"""Strategy Simulator Routes - Phase 7"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middlewares.auth_middleware import verify_token

router = APIRouter(prefix="/simulate-strategy", tags=["Strategy Simulator"])


class SimulateRequest(BaseModel):
    url: str
    query: str
    strategy: str


@router.post("")
async def simulate(req: SimulateRequest, current_user: dict = Depends(verify_token)):
    from modules.strategySimulator.service import simulate_strategy

    try:
        result = await simulate_strategy(
            str(req.url), req.query.strip(), req.strategy.strip(), current_user["user_id"]
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Simulation failed: {str(e)}")
