"""Stripe Payment Routes"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import logging
from middlewares.auth_middleware import verify_token

router = APIRouter(prefix="/payments", tags=["Payments"])
logger = logging.getLogger("pinnacle_ai")


class OrderRequest(BaseModel):
    plan: str  # "monthly" or "yearly"


class VerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    plan: str


@router.post("/create-order")
async def create_order(req: OrderRequest, current_user: dict = Depends(verify_token)):
    from modules.payments.service import create_payment_order

    if req.plan not in ("monthly", "yearly"):
        raise HTTPException(status_code=400, detail="Plan must be 'monthly' or 'yearly'")

    try:
        result = await create_payment_order(current_user["user_id"], req.plan)
        return result
    except Exception as e:
        logger.exception("Order creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Payment setup failed")


@router.post("/verify-payment")
async def verify_signature(req: VerifyRequest, current_user: dict = Depends(verify_token)):
    from modules.payments.service import verify_payment

    success = await verify_payment(
        current_user["user_id"], 
        req.order_id, 
        req.payment_id, 
        req.signature,
        req.plan
    )

    if not success:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    return {"status": "success", "message": "Subscription activated"}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    from modules.payments.service import handle_webhook

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        result = await handle_razorpay_webhook(payload, sig_header)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Webhook processing failed: %s", e)
        raise HTTPException(status_code=500, detail="Webhook processing failed")
