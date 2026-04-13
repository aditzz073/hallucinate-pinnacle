"""Monitoring Routes - Phase 3"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database.connection import monitored_pages_collection
from middlewares.auth_middleware import verify_token
from middlewares.feature_access import (
    enforce_feature_access,
    enforce_usage_limit,
    ensure_usage_doc,
    reset_monthly_usage_if_needed,
    get_user_access,
    PLAN_LIMITS,
    UpgradeRequiredException,
    UsageLimitReachedException,
    NoActivePlanException,
)

router = APIRouter(prefix="/monitor", tags=["Page Monitoring"])


class MonitorRequest(BaseModel):
    url: str


@router.post("")
async def add_monitored_page(req: MonitorRequest, current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]

    # 1. Ensure usage doc
    await ensure_usage_doc(user_id)

    # 2. Feature access check (requires discover+)
    await enforce_feature_access(current_user, "monitoring")

    # 3. Check monitoring URL count against plan limit
    user_access = await get_user_access(user_id)
    plan = user_access.get("plan", "free")
    url_limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"]).get("monitoring_urls", 0)

    if url_limit < 999999:
        current_count = await monitored_pages_collection.count_documents(
            {"user_id": user_id, "deleted": {"$ne": True}}
        )
        if current_count >= url_limit:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "usage_limit_reached",
                    "feature": "monitoring",
                    "used": current_count,
                    "limit": url_limit,
                    "upgrade_url": "/pricing",
                    "upgrade_message": f"Your {plan.title()} plan allows {url_limit} monitored URL(s). Upgrade to monitor more.",
                }
            )

    try:
        from modules.monitoring.service import add_monitored_page as _add
        result = await _add(str(req.url), user_id)
        return result
    except (UpgradeRequiredException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to monitor URL: {str(e)}")


@router.get("")
async def list_monitored_pages(current_user: dict = Depends(verify_token)):
    from modules.monitoring.service import get_monitored_pages

    pages = await get_monitored_pages(current_user["user_id"])
    return {"pages": pages}


@router.post("/{page_id}/refresh")
async def refresh_page(page_id: str, current_user: dict = Depends(verify_token)):
    from modules.monitoring.service import refresh_snapshot

    try:
        result = await refresh_snapshot(page_id, current_user["user_id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Refresh failed: {str(e)}")


@router.get("/{page_id}/snapshots")
async def get_snapshots(page_id: str, current_user: dict = Depends(verify_token)):
    from modules.monitoring.service import get_page_snapshots

    try:
        snapshots = await get_page_snapshots(page_id, current_user["user_id"])
        return {"snapshots": snapshots}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{page_id}/changes")
async def get_changes(page_id: str, current_user: dict = Depends(verify_token)):
    from modules.monitoring.service import get_page_change_logs

    try:
        changes = await get_page_change_logs(page_id, current_user["user_id"])
        return {"changes": changes}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{page_id}")
async def delete_page(page_id: str, current_user: dict = Depends(verify_token)):
    from modules.monitoring.service import delete_monitored_page

    try:
        await delete_monitored_page(page_id, current_user["user_id"])
        return {"message": "Monitored page removed"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
