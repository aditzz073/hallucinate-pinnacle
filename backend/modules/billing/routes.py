from datetime import datetime, timedelta, timezone
import logging
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Request
import stripe

from config.stripe import (
    FRONTEND_URL,
    STRIPE_PRICE_ID,
    STRIPE_WEBHOOK_SECRET,
    stripe_is_configured,
    webhook_is_configured,
)
from database.connection import users_collection
from middlewares.auth_middleware import verify_token

router = APIRouter(prefix="/billing", tags=["Billing"])
logger = logging.getLogger("pinnacle_ai")

SUBSCRIPTION_PENDING_WINDOW_MINUTES = 10


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _frontend_base_url(request: Request) -> str:
    if FRONTEND_URL:
        return FRONTEND_URL

    origin = (request.headers.get("origin") or "").strip().rstrip("/")
    if origin:
        return origin

    return "http://localhost:3000"


async def _get_user_or_404(user_id: str) -> dict:
    user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc


@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    current_user: dict = Depends(verify_token),
):
    if not stripe_is_configured():
        raise HTTPException(status_code=503, detail="Stripe billing is not configured")

    user_id = current_user.get("user_id")
    user_doc = await _get_user_or_404(user_id)

    customer_id = user_doc.get("stripeCustomerId")
    if not customer_id:
        customer = stripe.Customer.create(
            email=user_doc.get("email"),
            metadata={"user_id": str(user_id)},
        )
        customer_id = customer.get("id")

    pending_until = (datetime.now(timezone.utc) + timedelta(minutes=SUBSCRIPTION_PENDING_WINDOW_MINUTES)).isoformat()
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "stripeCustomerId": customer_id,
                "subscriptionStatus": "pending",
                "subscriptionPendingUntil": pending_until,
                "subscriptionUpdatedAt": _utc_now_iso(),
            }
        },
    )

    frontend_base = _frontend_base_url(request)
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
        success_url=f"{frontend_base}/dashboard?success=true",
        cancel_url=f"{frontend_base}/pricing",
        client_reference_id=str(user_id),
        metadata={"user_id": str(user_id)},
    )

    return {"url": session.url}


@router.post("/create-portal-session")
async def create_portal_session(
    request: Request,
    current_user: dict = Depends(verify_token),
):
    if not stripe_is_configured():
        raise HTTPException(status_code=503, detail="Stripe billing is not configured")

    user_doc = await _get_user_or_404(current_user.get("user_id"))
    customer_id = user_doc.get("stripeCustomerId")
    if not customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found for this user")

    frontend_base = _frontend_base_url(request)
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{frontend_base}/profile",
    )

    return {"url": session.url}


async def _mark_subscription_active(user_filter: dict, customer_id: Optional[str] = None, subscription_id: Optional[str] = None):
    update_fields = {
        "isSubscribed": True,
        "plan": "pro",
        "subscriptionStatus": "active",
        "subscriptionUpdatedAt": _utc_now_iso(),
    }
    if customer_id:
        update_fields["stripeCustomerId"] = customer_id
    if subscription_id:
        update_fields["stripeSubscriptionId"] = subscription_id

    result = await users_collection.update_one(
        user_filter,
        {
            "$set": update_fields,
            "$unset": {"subscriptionPendingUntil": ""},
        },
    )
    return result.modified_count > 0 or result.matched_count > 0


async def _mark_subscription_canceled(customer_id: str):
    result = await users_collection.update_one(
        {"stripeCustomerId": customer_id},
        {
            "$set": {
                "isSubscribed": False,
                "plan": "free",
                "subscriptionStatus": "canceled",
                "subscriptionUpdatedAt": _utc_now_iso(),
            },
            "$unset": {
                "subscriptionPendingUntil": "",
                "stripeSubscriptionId": "",
            },
        },
    )
    return result.modified_count > 0 or result.matched_count > 0


async def _activate_subscription_by_user_id(user_id: str, customer_id: Optional[str], subscription_id: Optional[str]) -> bool:
    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        logger.warning("Stripe webhook contained invalid user_id in metadata: %s", user_id)
        return False

    user_doc = await users_collection.find_one({"_id": object_id}, {"_id": 1})
    if not user_doc:
        logger.warning("Stripe webhook user not found for user_id=%s", user_id)
        return False

    return await _mark_subscription_active(
        {"_id": object_id},
        customer_id=customer_id,
        subscription_id=subscription_id,
    )


async def _activate_subscription_by_customer_id(customer_id: Optional[str], subscription_id: Optional[str]) -> bool:
    if not customer_id:
        logger.warning("Stripe webhook missing customer id for activation event")
        return False

    user_doc = await users_collection.find_one({"stripeCustomerId": customer_id}, {"_id": 1})
    if not user_doc:
        logger.warning("Stripe webhook user not found for customer_id=%s", customer_id)
        return False

    return await _mark_subscription_active(
        {"_id": user_doc["_id"]},
        customer_id=customer_id,
        subscription_id=subscription_id,
    )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    if not webhook_is_configured():
        raise HTTPException(status_code=503, detail="Stripe webhook is not configured")

    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook error")

    event_id = event.get("id")
    event_type = event.get("type")
    livemode = event.get("livemode")
    obj = event.get("data", {}).get("object", {})

    logger.info(
        "Stripe webhook received: id=%s type=%s livemode=%s",
        event_id,
        event_type,
        livemode,
    )

    try:
        if event_type == "checkout.session.completed":
            metadata = obj.get("metadata") or {}
            user_id = metadata.get("user_id") or obj.get("client_reference_id")
            customer_id = obj.get("customer")
            subscription_id = obj.get("subscription")

            if user_id:
                updated = await _activate_subscription_by_user_id(
                    user_id,
                    customer_id=customer_id,
                    subscription_id=subscription_id,
                )
                if not updated:
                    await _activate_subscription_by_customer_id(customer_id, subscription_id)
            else:
                await _activate_subscription_by_customer_id(customer_id, subscription_id)

            logger.info(
                "Processed checkout.session.completed: user_id=%s customer_id=%s subscription_id=%s",
                user_id,
                customer_id,
                subscription_id,
            )

        elif event_type == "invoice.payment_succeeded":
            customer_id = obj.get("customer")
            subscription_id = obj.get("subscription")
            await _activate_subscription_by_customer_id(customer_id, subscription_id)
            logger.info(
                "Processed invoice.payment_succeeded: customer_id=%s subscription_id=%s",
                customer_id,
                subscription_id,
            )

        elif event_type == "customer.subscription.deleted":
            customer_id = obj.get("customer")
            if customer_id:
                user_doc = await users_collection.find_one({"stripeCustomerId": customer_id}, {"_id": 1})
                if user_doc:
                    await _mark_subscription_canceled(customer_id)
                else:
                    logger.warning("No user found for cancellation event customer_id=%s", customer_id)

            logger.info("Processed customer.subscription.deleted: customer_id=%s", customer_id)

        else:
            logger.info("Stripe webhook ignored unsupported event type=%s", event_type)

    except Exception:
        logger.exception("Stripe webhook processing failed for event %s", event_type)
        raise HTTPException(status_code=500, detail="Webhook processing failed")

    return {"status": "success"}
