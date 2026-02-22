from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os

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


# Dependency shorthand
get_current_user = Depends(verify_token)
get_current_user_optional = Depends(verify_token_optional)
