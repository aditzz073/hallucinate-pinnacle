"""Demo Booking Routes"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import logging

router = APIRouter(prefix="/booking", tags=["Booking"])
logger = logging.getLogger("pinnacle_ai")


class DemoBookingRequest(BaseModel):
    name: str
    email: str
    selected_time: str


@router.post("/demo")
async def book_demo(req: DemoBookingRequest):
    from modules.booking.service import book_demo as _book_demo

    if not req.name.strip() or not req.email.strip():
        raise HTTPException(status_code=400, detail="Name and email are required")

    try:
        result = await _book_demo(req.name.strip(), req.email.strip(), req.selected_time.strip())
        return result
    except Exception as e:
        logger.exception("Demo booking failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process demo booking")
