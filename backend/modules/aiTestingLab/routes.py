"""AI Testing Lab Routes — Multi-Engine Citation Readiness API."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

from middlewares.auth_middleware import verify_token, verify_token_optional
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
from modules.aiTestingLab.engine_profiles import ENGINE_PROFILES

router = APIRouter(prefix="/ai-testing-lab", tags=["AI Testing Lab"])


class LabRunRequest(BaseModel):
    query: str
    url: str
    engines: List[str] = list(ENGINE_PROFILES.keys())

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Query must be at least 3 characters")
        if len(v) > 200:
            raise ValueError("Query must be under 200 characters")
        return v


class QuickScoreRequest(BaseModel):
    url: str
    engine: str = "chatgpt"


@router.post("/run")
async def run_lab(
    req: LabRunRequest,
    current_user: Optional[dict] = Depends(verify_token_optional),
):
    from modules.aiTestingLab.service import run_ai_testing_lab
    from database.connection import users_collection
    from bson import ObjectId

    valid_engines = [e for e in req.engines if e in ENGINE_PROFILES]
    if not valid_engines:
        raise HTTPException(status_code=400, detail="No valid engines specified")

    user_id = current_user["user_id"] if current_user else None

    if user_id:
        # 1. Ensure usage doc exists
        await ensure_usage_doc(user_id)

        # 2. Reset if new month
        user_doc = await reset_monthly_usage_if_needed(user_id)
        if user_doc is None:
            user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})

        # 3. Feature access check (ai_testing_lab requires discover+)
        await enforce_feature_access(current_user, "ai_testing_lab")

        # 4. Usage limit check
        await enforce_usage_limit(user_id, user_doc, "ai_testing_lab", "ai_testing_lab")

    try:
        result = await run_ai_testing_lab(req.query, str(req.url), valid_engines)

        # 5. Increment after success
        if user_id:
            await increment_usage(user_id, "ai_testing_lab_used")

        return result
    except (UpgradeRequiredException, UsageLimitReachedException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Lab analysis failed: {str(e)}")


@router.post("/quick-score")
async def quick_score(
    req: QuickScoreRequest,
    current_user: Optional[dict] = Depends(verify_token_optional),
):
    from modules.aiTestingLab.service import get_quick_score

    if req.engine not in ENGINE_PROFILES:
        raise HTTPException(status_code=400, detail=f"Unknown engine: {req.engine}")

    try:
        result = await get_quick_score(str(req.url), req.engine)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quick score failed: {str(e)}")


@router.get("/engines")
async def list_engines():
    engines = [
        {
            "id": eid,
            "name": profile["name"],
            "description": profile["description"],
            "priority_signals": profile["priority_signals"],
        }
        for eid, profile in ENGINE_PROFILES.items()
    ]
    return {"engines": engines, "total": len(engines)}


@router.get("/engines/{engine_id}")
async def get_engine(engine_id: str):
    if engine_id not in ENGINE_PROFILES:
        raise HTTPException(status_code=404, detail=f"Engine '{engine_id}' not found")

    profile = ENGINE_PROFILES[engine_id]
    return {
        "id": engine_id,
        "name": profile["name"],
        "description": profile["description"],
        "weights": profile["weights"],
        "priority_signals": profile["priority_signals"],
    }
