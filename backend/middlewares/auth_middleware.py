from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os
from bson import ObjectId
from database.connection import users_collection

JWT_SECRET = os.environ.get("JWT_SECRET", "")
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"user_id": payload["user_id"], "email": payload["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def verify_token_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)) -> Optional[dict]:
    """Optional authentication - returns None if no token provided, validates if present"""
    if not credentials:
        return None
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"user_id": payload["user_id"], "email": payload["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def verify_subscription(current_user: dict = Depends(verify_token)) -> dict:
    """Verifies that the current user has an active subscription."""
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get("is_subscribed", False):
        raise HTTPException(
            status_code=403, 
            detail="Subscription required for this feature. Upgrade to professional plan for access."
        )
    
    return current_user


# Dependency shorthand
get_current_user = Depends(verify_token)
get_current_user_optional = Depends(verify_token_optional)
require_subscription = Depends(verify_subscription)
