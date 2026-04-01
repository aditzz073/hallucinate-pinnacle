"""Advanced Audit Routes - Phase 5"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from middlewares.auth_middleware import verify_token
from middlewares.feature_access import enforce_feature_access, UpgradeRequiredException

router = APIRouter(prefix="/audit", tags=["Advanced Audit"])


class AdvancedAuditRequest(BaseModel):
    url: str
    query: Optional[str] = None


class AISkipReasonRequest(BaseModel):
    query: Optional[str] = None


class PriorityFixesRequest(BaseModel):
    engine_recommendations: Optional[list] = None


@router.post("/advanced")
async def run_advanced_audit(req: AdvancedAuditRequest, current_user: dict = Depends(verify_token)):
    from modules.advancedAudit.service import run_advanced_audit as _run

    try:
        await enforce_feature_access(current_user, "advanced_audit")
        result = await _run(str(req.url), current_user["user_id"], req.query)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UpgradeRequiredException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Advanced audit failed: {str(e)}")


@router.post("/advanced/{audit_id}/ai-skip-reason")
async def get_ai_skip_reason(audit_id: str, req: AISkipReasonRequest, current_user: dict = Depends(verify_token)):
    from modules.advancedAudit.service import get_ai_skip_reason_for_audit as _get_reason

    try:
        await enforce_feature_access(current_user, "advanced_audit")
        reason = await _get_reason(audit_id, current_user["user_id"], req.query)
        return {"ai_skip_reason": reason}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UpgradeRequiredException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI skip reason generation failed: {str(e)}")


@router.post("/advanced/{audit_id}/priority-fixes")
async def get_priority_fixes(audit_id: str, req: PriorityFixesRequest, current_user: dict = Depends(verify_token)):
    from modules.advancedAudit.service import get_priority_fixes_for_audit as _get_fixes

    try:
        await enforce_feature_access(current_user, "advanced_audit")
        fixes = await _get_fixes(audit_id, current_user["user_id"], req.engine_recommendations)
        return {"priority_fixes": fixes}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UpgradeRequiredException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Priority fixes generation failed: {str(e)}")
