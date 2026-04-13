"""Billing & payments routes — Stripe checkout, webhook, portal, status."""

from datetime import datetime, timedelta, timezone
import logging
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import stripe

from config.stripe import (
    FRONTEND_URL,
    STRIPE_WEBHOOK_SECRET,
    PLAN_DISPLAY_NAMES,
    stripe_is_configured,
    webhook_is_configured,
    get_price_id_for_plan,
)
from database.connection import users_collection, audits_collection, ai_tests_collection
from middlewares.auth_middleware import verify_token
from middlewares.feature_access import (
    build_feature_map,
    PLAN_LIMITS,
    LEGACY_PLAN_MAP,
    VALID_PLANS,
)

# We import VALID_PLANS from auth service to keep it DRY; define locally as fallback
try:
    from modules.auth.service import VALID_PLANS as _AUTH_VALID_PLANS
except ImportError:
    _AUTH_VALID_PLANS = {"discover", "optimize", "dominate", "founder", "custom"}

router = APIRouter(prefix="/billing", tags=["Billing"])
logger = logging.getLogger("pinnacle_ai")

SUBSCRIPTION_PENDING_WINDOW_MINUTES = 10

# Map Stripe Price ID → plan name (built at first use)
_PRICE_TO_PLAN: dict | None = None


def _build_price_to_plan_map() -> dict:
    global _PRICE_TO_PLAN
    if _PRICE_TO_PLAN is None:
        from config.stripe import PLAN_PRICE_MAP
        _PRICE_TO_PLAN = {v: k for k, v in PLAN_PRICE_MAP.items() if v}
    return _PRICE_TO_PLAN


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _frontend_base_url(request: Request) -> str:
    if FRONTEND_URL:
        return FRONTEND_URL
    origin = (request.headers.get("origin") or "").strip().rstrip("/")
    if origin:
        return origin
    return "http://localhost:3000"


def _normalize_plan(raw: str | None) -> str:
    if raw in LEGACY_PLAN_MAP:
        return LEGACY_PLAN_MAP[raw]
    if raw in VALID_PLANS:
        return raw
    return "discover"


async def _get_user_or_404(user_id: str) -> dict:
    user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class CheckoutRequest(BaseModel):
    plan: str  # "discover" | "optimize" | "dominate"


# ---------------------------------------------------------------------------
# POST /api/billing/checkout  (alias: /api/billing/create-checkout-session)
# ---------------------------------------------------------------------------
@router.post("/checkout")
@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    current_user: dict = Depends(verify_token),
    body: CheckoutRequest | None = None,
):
    if not stripe_is_configured():
        raise HTTPException(status_code=503, detail="Stripe billing is not configured")

    plan = body.plan if body else "optimize"
    plan = _normalize_plan(plan)

    price_id = get_price_id_for_plan(plan)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"No Stripe price configured for plan '{plan}'")

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
                "subscription_status": "pending",
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
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{frontend_base}/dashboard?success=true",
        cancel_url=f"{frontend_base}/pricing",
        client_reference_id=str(user_id),
        metadata={"user_id": str(user_id), "plan": plan},
    )

    return {"url": session.url, "checkout_url": session.url}


# ---------------------------------------------------------------------------
# POST /api/billing/portal  (alias: /api/billing/create-portal-session)
# ---------------------------------------------------------------------------
@router.post("/portal")
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

    return {"url": session.url, "portal_url": session.url}


# ---------------------------------------------------------------------------
# GET /api/billing/status
# ---------------------------------------------------------------------------
@router.get("/status")
async def billing_status(current_user: dict = Depends(verify_token)):
    user_doc = await _get_user_or_404(current_user.get("user_id"))

    plan = _normalize_plan(user_doc.get("plan"))
    plan_name = PLAN_DISPLAY_NAMES.get(plan, plan.title())
    sub_status = user_doc.get("subscription_status", user_doc.get("subscriptionStatus", "none"))
    billing_cycle = user_doc.get("billing_cycle", "monthly")

    # Gather next billing date from Stripe if available
    next_billing_date = None
    stripe_sub_id = user_doc.get("stripeSubscriptionId")
    if stripe_sub_id:
        try:
            sub = stripe.Subscription.retrieve(stripe_sub_id)
            if sub.current_period_end:
                next_billing_date = datetime.fromtimestamp(sub.current_period_end, tz=timezone.utc).strftime("%Y-%m-%d")
        except Exception:
            pass

    # Usage counts for current month
    user_id = current_user.get("user_id")
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    # Use embedded usage doc if available; fall back to live counts
    embedded_usage = user_doc.get("usage") or {}

    # Ensure the embedded doc is initialised
    from middlewares.feature_access import ensure_usage_doc, reset_monthly_usage_if_needed
    await ensure_usage_doc(user_id)
    refreshed = await reset_monthly_usage_if_needed(user_id)
    if refreshed:
        embedded_usage = refreshed.get("usage") or {}
        user_doc = refreshed

    # Re-read if needed
    if not embedded_usage:
        user_doc_fresh = await _get_user_or_404(user_id)
        embedded_usage = user_doc_fresh.get("usage") or {}

    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS.get("free", {}))

    return {
        "plan": plan,
        "plan_name": plan_name,
        "status": sub_status,
        "billing_cycle": billing_cycle,
        "next_billing_date": next_billing_date,
        "stripe_subscription_id": stripe_sub_id,
        "features": build_feature_map(plan),
        "usage": {
            **embedded_usage,
            # Convenience fields for the frontend
            "aeo_audits_limit":        limits.get("aeo_audits"),
            "ai_lab_tests_limit":      limits.get("ai_lab_tests"),
            "advanced_audits_limit":   limits.get("advanced_audits"),
            "ai_testing_lab_limit":    limits.get("ai_testing_lab"),
            "strategy_simulator_limit": limits.get("strategy_simulator"),
            "monitoring_urls_limit":   limits.get("monitoring_urls"),
        },
    }



# ---------------------------------------------------------------------------
# Webhook helpers
# ---------------------------------------------------------------------------
def _plan_from_price_id(price_id: str) -> str:
    """Resolve a Stripe price ID back to a plan name."""
    mapping = _build_price_to_plan_map()
    return mapping.get(price_id, "optimize")  # default to optimize for unknown


async def _mark_subscription_active(
    user_filter: dict,
    plan: str = "optimize",
    customer_id: Optional[str] = None,
    subscription_id: Optional[str] = None,
):
    plan = _normalize_plan(plan)
    update_fields = {
        "isSubscribed": True,
        "plan": plan,
        "plan_name": PLAN_DISPLAY_NAMES.get(plan, plan.title()),
        "subscription_status": "active",
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
                "plan": "discover",
                "plan_name": "Discover",
                "subscription_status": "canceled",
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


async def _mark_subscription_past_due(customer_id: str):
    """Flag as past_due without revoking access (7-day grace)."""
    result = await users_collection.update_one(
        {"stripeCustomerId": customer_id},
        {
            "$set": {
                "subscription_status": "past_due",
                "subscriptionStatus": "past_due",
                "subscriptionUpdatedAt": _utc_now_iso(),
            },
        },
    )
    return result.modified_count > 0 or result.matched_count > 0


async def _activate_subscription_by_user_id(
    user_id: str,
    plan: str,
    customer_id: Optional[str],
    subscription_id: Optional[str],
) -> bool:
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
        plan=plan,
        customer_id=customer_id,
        subscription_id=subscription_id,
    )


async def _activate_subscription_by_customer_id(
    customer_id: Optional[str],
    plan: str = "optimize",
    subscription_id: Optional[str] = None,
) -> bool:
    if not customer_id:
        logger.warning("Stripe webhook missing customer id for activation event")
        return False

    user_doc = await users_collection.find_one({"stripeCustomerId": customer_id}, {"_id": 1})
    if not user_doc:
        logger.warning("Stripe webhook user not found for customer_id=%s", customer_id)
        return False

    return await _mark_subscription_active(
        {"_id": user_doc["_id"]},
        plan=plan,
        customer_id=customer_id,
        subscription_id=subscription_id,
    )


# ---------------------------------------------------------------------------
# POST /api/billing/webhook
# ---------------------------------------------------------------------------
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
            plan = metadata.get("plan", "optimize")

            # Try to resolve plan from the subscription's price for accuracy
            if subscription_id:
                try:
                    sub = stripe.Subscription.retrieve(subscription_id)
                    if sub.get("items") and sub["items"].get("data"):
                        price_id = sub["items"]["data"][0].get("price", {}).get("id", "")
                        resolved = _plan_from_price_id(price_id)
                        if resolved:
                            plan = resolved
                except Exception:
                    pass

            if user_id:
                updated = await _activate_subscription_by_user_id(
                    user_id,
                    plan=plan,
                    customer_id=customer_id,
                    subscription_id=subscription_id,
                )
                if not updated:
                    await _activate_subscription_by_customer_id(customer_id, plan=plan, subscription_id=subscription_id)
            else:
                await _activate_subscription_by_customer_id(customer_id, plan=plan, subscription_id=subscription_id)

            logger.info(
                "Processed checkout.session.completed: user_id=%s customer_id=%s plan=%s",
                user_id,
                customer_id,
                plan,
            )

        elif event_type == "customer.subscription.updated":
            customer_id = obj.get("customer")
            subscription_id = obj.get("id")
            status = obj.get("status", "active")

            # Resolve the plan from the subscription's price
            plan = "optimize"
            if obj.get("items") and obj["items"].get("data"):
                price_id = obj["items"]["data"][0].get("price", {}).get("id", "")
                plan = _plan_from_price_id(price_id)

            if status == "active":
                await _activate_subscription_by_customer_id(customer_id, plan=plan, subscription_id=subscription_id)
            elif status == "past_due":
                await _mark_subscription_past_due(customer_id)

            logger.info(
                "Processed customer.subscription.updated: customer_id=%s status=%s plan=%s",
                customer_id,
                status,
                plan,
            )

        elif event_type == "invoice.payment_succeeded":
            customer_id = obj.get("customer")
            subscription_id = obj.get("subscription")

            plan = "optimize"
            if subscription_id:
                try:
                    sub = stripe.Subscription.retrieve(subscription_id)
                    if sub.get("items") and sub["items"].get("data"):
                        price_id = sub["items"]["data"][0].get("price", {}).get("id", "")
                        plan = _plan_from_price_id(price_id)
                except Exception:
                    pass

            await _activate_subscription_by_customer_id(customer_id, plan=plan, subscription_id=subscription_id)
            logger.info(
                "Processed invoice.payment_succeeded: customer_id=%s subscription_id=%s",
                customer_id,
                subscription_id,
            )

        elif event_type == "invoice.payment_failed":
            customer_id = obj.get("customer")
            if customer_id:
                await _mark_subscription_past_due(customer_id)
            logger.info("Processed invoice.payment_failed: customer_id=%s", customer_id)

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
