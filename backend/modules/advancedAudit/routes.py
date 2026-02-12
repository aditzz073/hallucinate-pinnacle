"""Advanced Audit Routes - Phase 5"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middlewares.auth_middleware import verify_token

router = APIRouter(prefix="/audit", tags=["Advanced Audit"])


class AdvancedAuditRequest(BaseModel):
    url: str


@router.post("/advanced")
async def run_advanced_audit(req: AdvancedAuditRequest, current_user: dict = Depends(verify_token)):
    from modules.advancedAudit.service import run_advanced_audit as _run

    try:
        result = await _run(str(req.url), current_user["user_id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Advanced audit failed: {str(e)}")
