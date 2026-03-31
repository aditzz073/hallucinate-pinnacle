"""AEO Engine Routes - Phase 1"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from middlewares.auth_middleware import verify_token, verify_token_optional
from typing import Optional

router = APIRouter(prefix="/audit", tags=["AEO Audit"])


class AuditRequest(BaseModel):
    url: str


@router.post("")
async def run_audit(req: AuditRequest, current_user: Optional[dict] = Depends(verify_token_optional)):
    from modules.aeoEngine.service import run_audit as _run_audit

    # Guest mode: user_id is None
    user_id = current_user["user_id"] if current_user else None
    
    try:
        result = await _run_audit(str(req.url), user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to audit URL: {str(e)}")


@router.get("/self")
async def self_audit():
    """Run AEO audit on Pinnacle's own site for transparency."""
    import os
    from modules.aeoEngine.service import run_audit as _run_audit

    pinnacle_url = os.environ.get("PINNACLE_SELF_URL", "https://usepinnacle.com")
    try:
        result = await _run_audit(pinnacle_url, user_id=None)
        return {
            "url": pinnacle_url,
            "overall_score": result.get("overall_score", 0),
            "breakdown": result.get("breakdown", {}),
            "rag_status": result.get("rag_status", {}),
            "top_suggestions": result.get("top_suggestions", []),
            "strengths": [r for r in result.get("recommendations", []) if r.get("severity") == "low"][:3],
            "weaknesses": [r for r in result.get("recommendations", []) if r.get("severity") == "high"][:3],
        }
    except Exception as e:
        return {
            "url": pinnacle_url,
            "overall_score": 0,
            "breakdown": {},
            "rag_status": {},
            "error": f"Self-audit unavailable: {str(e)}",
        }


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
