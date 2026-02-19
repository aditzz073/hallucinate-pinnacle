from fastapi import APIRouter, HTTPException
from modules.auth.models import UserRegisterRequest, UserLoginRequest, TokenResponse
from modules.auth.service import register_user, login_user, get_user_by_id
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
