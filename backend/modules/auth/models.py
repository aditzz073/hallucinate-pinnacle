from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone
from typing import Literal


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    nickname: Optional[str] = Field(None, max_length=50)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    nickname: Optional[str] = None
    plan: Literal["free", "pro", "founder"] = "free"
    isSubscribed: bool = False
    isFoundingUser: bool = False
    is_privileged: bool = False
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class APIKeyResponse(BaseModel):
    api_key: str
