"""AEO Engine Routes - Phase 1"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middlewares.auth_middleware import verify_token, verify_token_optional
from middlewares.feature_access import (
    enforce_feature_access,
    enforce_usage_limit,
    reset_monthly_usage_if_needed,
    ensure_usage_doc,
    increment_usage,
    get_user_access,
    check_usage_limit_from_doc,
    UpgradeRequiredException,
    UsageLimitReachedException,
    NoActivePlanException,
)
from typing import Optional

router = APIRouter(prefix="/audit", tags=["AEO Audit"])


class AuditRequest(BaseModel):
    url: str


@router.post("")
async def run_audit(req: AuditRequest, current_user: Optional[dict] = Depends(verify_token_optional)):
    from modules.aeoEngine.service import run_audit as _run_audit
    from database.connection import users_collection
    from bson import ObjectId

    user_id = current_user["user_id"] if current_user else None

    # Authenticated users: apply plan-based limits
    if user_id:
        # 1. Ensure usage doc exists
        await ensure_usage_doc(user_id)

        # 2. Reset if new month
        user_doc = await reset_monthly_usage_if_needed(user_id)
        if user_doc is None:
            user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})

        # 3. Check usage limit (aeo_audits)
        await enforce_usage_limit(user_id, user_doc, "aeo_audits", "aeo_audits")

    try:
        result = await _run_audit(str(req.url), user_id)

        # 4. Increment counter after successful audit
        if user_id:
            await increment_usage(user_id, "aeo_audits_used")

        return result
    except (UpgradeRequiredException, UsageLimitReachedException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to audit URL: {str(e)}")


@router.get("")
async def list_audits(current_user: dict = Depends(verify_token)):
    from modules.aeoEngine.service import get_user_audits

    audits = await get_user_audits(current_user["user_id"])
    return {"audits": audits}


@router.get("/{audit_id}")
async def get_audit(audit_id: str, current_user: dict = Depends(verify_token)):
    from modules.aeoEngine.service import get_audit_detail

    audit = await get_audit_detail(audit_id, current_user["user_id"])
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit
