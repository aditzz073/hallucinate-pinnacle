"""Strategy Simulator Routes - Phase 7"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
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

router = APIRouter(prefix="/simulate-strategy", tags=["Strategy Simulator"])


class SimulateRequest(BaseModel):
    url: str
    query: str
    strategy: str


@router.post("")
async def simulate(req: SimulateRequest, current_user: dict = Depends(verify_token)):
    from modules.strategySimulator.service import simulate_strategy
    from database.connection import users_collection
    from bson import ObjectId

    user_id = current_user["user_id"]

    # 1. Ensure usage doc
    await ensure_usage_doc(user_id)

    # 2. Reset if new month
    user_doc = await reset_monthly_usage_if_needed(user_id)
    if user_doc is None:
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})

    # 3. Feature access (requires optimize+)
    await enforce_feature_access(current_user, "strategy_simulator")

    # 4. Usage limit
    await enforce_usage_limit(user_id, user_doc, "strategy_simulator", "strategy_simulator")

    try:
        result = await simulate_strategy(
            str(req.url), req.query.strip(), req.strategy.strip(), user_id
        )

        # 5. Increment
        await increment_usage(user_id, "strategy_simulator_used")

        return result
    except (UpgradeRequiredException, UsageLimitReachedException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Simulation failed: {str(e)}")
