"""Stripe Payment Gateway Service"""
import os
import logging
from datetime import datetime, timezone

logger = logging.getLogger("pinnacle_ai")

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


def _get_razorpay():
    """Lazy import razorpay to avoid import errors when not installed."""
    try:
        import razorpay
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except ImportError:
        logger.warning("razorpay package not installed")
        return None


async def create_payment_order(user_id: str, plan: str) -> dict:
    """Create a Razorpay Order for subscription."""
    client = _get_razorpay()

    if not client or not RAZORPAY_KEY_ID:
        return {
            "order_id": None,
            "message": "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        }

    # Amount in paise (100 INR = 10000 paise)
    amount = 10000 if plan == "monthly" else 99900  # Example prices

    try:
        order_data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"receipt_{user_id[:8]}_{plan}",
            "notes": {"user_id": user_id, "plan": plan},
        }
        order = client.order.create(data=order_data)
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": RAZORPAY_KEY_ID
        }
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise ValueError(f"Payment setup failed: {str(e)}")


async def verify_payment(
    user_id: str, 
    order_id: str, 
    payment_id: str, 
    signature: str, 
    plan: str
) -> bool:
    """Verify Razorpay payment signature and activate subscription."""
    client = _get_razorpay()
    if not client:
        return False

    try:
        # Verify signature
        params_dict = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
        client.utility.verify_payment_signature(params_dict)

        # Activate subscription
        await _activate_subscription(user_id, plan, payment_id)
        return True
    except Exception as e:
        logger.error(f"Razorpay verification failed: {e}")
        return False


async def handle_razorpay_webhook(payload: bytes, sig_header: str) -> dict:
    """Process Razorpay webhook events (optional backup for signature verification)."""
    # For subscriptions, signature verification in /verify-payment is primary.
    # Webhooks are best for subscription.cancelled or payment.failed tracking.
    return {"received": True, "processed": False, "reason": "Webhook handler not fully implemented yet"}


async def _activate_subscription(user_id: str, plan: str, subscription_id: str):
    """Update user record to mark as subscribed."""
    from bson import ObjectId
    from database.connection import users_collection

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "is_subscribed": True,
                "subscription_plan": plan,
                "razorpay_payment_id": payment_id,
                "subscription_activated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )


async def _deactivate_subscription(subscription_id: str):
    """Deactivate subscription by Stripe subscription ID."""
    from database.connection import users_collection

    await users_collection.update_one(
        {"razorpay_payment_id": payment_id},
        {
            "$set": {
                "is_subscribed": False,
                "subscription_deactivated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
