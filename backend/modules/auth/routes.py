from fastapi import APIRouter, HTTPException
from modules.auth.models import UserRegisterRequest, UserLoginRequest, TokenResponse, ChangePasswordRequest
from modules.auth.service import register_user, login_user, get_user_by_id, change_password
from middlewares.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    try:
        result = await register_user(req.email, req.password, req.nickname)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    try:
        result = await login_user(req.email, req.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def me(current_user: dict = get_current_user):
    try:
        user = await get_user_by_id(current_user["user_id"])
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/change-password")
async def change_password_route(req: ChangePasswordRequest, current_user: dict = get_current_user):
    try:
        await change_password(current_user["user_id"], req.current_password, req.new_password)
        return {"message": "Password updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
