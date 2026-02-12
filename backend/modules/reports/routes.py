"""Reports Routes - Phase 4"""
from fastapi import APIRouter, Depends, Query
from middlewares.auth_middleware import verify_token

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/overview")
async def get_overview(current_user: dict = Depends(verify_token)):
    from modules.reports.service import get_overview as _get_overview

    return await _get_overview(current_user["user_id"])


@router.get("/trends")
async def get_trends(
    url: str = Query(None, description="Filter by URL"),
    current_user: dict = Depends(verify_token),
):
    from modules.reports.service import get_trends as _get_trends

    return await _get_trends(current_user["user_id"], url)


@router.get("/competitors")
async def get_competitors(current_user: dict = Depends(verify_token)):
    from modules.reports.service import get_competitors as _get_competitors

    return await _get_competitors(current_user["user_id"])
