"""Advanced Audit Routes - Phase 5"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from middlewares.auth_middleware import verify_token
from middlewares.feature_access import (
    enforce_feature_access,
    enforce_usage_limit,
    reset_monthly_usage_if_needed,
    ensure_usage_doc,
    increment_usage,
    UpgradeRequiredException,
    UsageLimitReachedException,
    NoActivePlanException,
)

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
    from database.connection import users_collection
    from bson import ObjectId

    user_id = current_user["user_id"]

    # 1. Ensure usage doc exists
    await ensure_usage_doc(user_id)

    # 2. Reset if new month
    user_doc = await reset_monthly_usage_if_needed(user_id)
    if user_doc is None:
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})

    # 3. Feature access (requires discover+)
    await enforce_feature_access(current_user, "advanced_audit")

    # 4. Usage limit
    await enforce_usage_limit(user_id, user_doc, "advanced_audits", "advanced_audit")

    try:
        result = await _run(str(req.url), user_id, req.query)

        # 5. Increment counter
        await increment_usage(user_id, "advanced_audits_used")

        return result
    except (UpgradeRequiredException, UsageLimitReachedException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Advanced audit failed: {str(e)}")


@router.post("/advanced/{audit_id}/ai-skip-reason")
async def get_ai_skip_reason(audit_id: str, req: AISkipReasonRequest, current_user: dict = Depends(verify_token)):
    from modules.advancedAudit.service import get_ai_skip_reason_for_audit as _get_reason

    # ai_skip_reason requires dominate+
    await enforce_feature_access(current_user, "ai_skip_reason")

    try:
        reason = await _get_reason(audit_id, current_user["user_id"], req.query)
        return {"ai_skip_reason": reason}
    except (UpgradeRequiredException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI skip reason generation failed: {str(e)}")


@router.post("/advanced/{audit_id}/priority-fixes")
async def get_priority_fixes(audit_id: str, req: PriorityFixesRequest, current_user: dict = Depends(verify_token)):
    from modules.advancedAudit.service import get_priority_fixes_for_audit as _get_fixes

    # priority_fixes requires dominate+
    await enforce_feature_access(current_user, "priority_fixes")

    try:
        fixes = await _get_fixes(audit_id, current_user["user_id"], req.engine_recommendations)
        return {"priority_fixes": fixes}
    except (UpgradeRequiredException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Priority fixes generation failed: {str(e)}")
