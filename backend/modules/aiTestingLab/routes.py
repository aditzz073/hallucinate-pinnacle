"""AI Testing Lab Routes — Multi-Engine Citation Readiness API."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

from middlewares.auth_middleware import verify_token_optional
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

    valid_engines = [e for e in req.engines if e in ENGINE_PROFILES]
    if not valid_engines:
        raise HTTPException(status_code=400, detail="No valid engines specified")

    try:
        result = await run_ai_testing_lab(req.query, str(req.url), valid_engines)
        return result
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
