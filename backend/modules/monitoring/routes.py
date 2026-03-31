"""Monitoring Routes - Phase 3"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middlewares.auth_middleware import verify_token, require_subscription

router = APIRouter(prefix="/monitor", tags=["Page Monitoring"])


class MonitorRequest(BaseModel):
    url: str


@router.post("/pages")
async def monitor_page(req: MonitorRequest, current_user: dict = require_subscription):
    from modules.monitoring.service import add_monitored_page as _add

    try:
        result = await _add(str(req.url), current_user["user_id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to monitor URL: {str(e)}")


@router.get("/pages")
async def list_monitored_pages(current_user: dict = require_subscription):
    from modules.monitoring.service import get_monitored_pages

    pages = await get_monitored_pages(current_user["user_id"])
    return {"pages": pages}


@router.post("/{page_id}/refresh")
async def refresh_page(page_id: str, current_user: dict = require_subscription):
    from modules.monitoring.service import refresh_snapshot

    try:
        result = await refresh_snapshot(page_id, current_user["user_id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Refresh failed: {str(e)}")


@router.get("/{page_id}/snapshots")
async def get_snapshots(page_id: str, current_user: dict = require_subscription):
    from modules.monitoring.service import get_page_snapshots

    try:
        snapshots = await get_page_snapshots(page_id, current_user["user_id"])
        return {"snapshots": snapshots}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{page_id}/changes")
async def get_changes(page_id: str, current_user: dict = require_subscription):
    from modules.monitoring.service import get_page_change_logs

    try:
        changes = await get_page_change_logs(page_id, current_user["user_id"])
        return {"changes": changes}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{page_id}")
async def delete_page(page_id: str, current_user: dict = require_subscription):
    from modules.monitoring.service import delete_monitored_page

    try:
        await delete_monitored_page(page_id, current_user["user_id"])
        return {"message": "Monitored page removed"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
