from fastapi import APIRouter, HTTPException
import logging
from modules.auth.models import UserRegisterRequest, UserLoginRequest, TokenResponse, ChangePasswordRequest, APIKeyResponse
from modules.auth.service import register_user, login_user, get_user_by_id, change_password, create_token
from middlewares.auth_middleware import get_current_user
from middlewares.feature_access import enforce_feature_access, UpgradeRequiredException

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger("pinnacle_ai")


@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    try:
        result = await register_user(req.email, req.password, req.nickname)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Register failed due to DB connectivity issue: %s", e)
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    try:
        result = await login_user(req.email, req.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.exception("Login failed due to DB connectivity issue: %s", e)
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.get("/me")
async def me(current_user: dict = get_current_user):
    try:
        user = await get_user_by_id(current_user["user_id"])
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Me endpoint failed due to DB connectivity issue: %s", e)
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.post("/change-password")
async def change_password_route(req: ChangePasswordRequest, current_user: dict = get_current_user):
    try:
        await change_password(current_user["user_id"], req.current_password, req.new_password)
        return {"message": "Password updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Change password failed due to DB connectivity issue: %s", e)
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

@router.post("/api-key", response_model=APIKeyResponse)
async def generate_api_key(current_user: dict = get_current_user):
    try:
        await enforce_feature_access(current_user, "cli_tool")
        # Create a token valid for ~10 years (87600 hours)
        token = create_token(current_user["user_id"], current_user["email"], expiry_hours=87600)
        return {"api_key": token}
    except UpgradeRequiredException:
        raise
    except Exception as e:
        logger.exception("API key generation failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to generate API key")
