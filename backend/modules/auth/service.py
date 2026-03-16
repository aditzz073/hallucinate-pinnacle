import bcrypt
import jwt
import os
from datetime import datetime, timezone, timedelta
from database.connection import users_collection

JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", "24"))

# Privileged access whitelist (founding team)
PRIVILEGED_EMAILS = {
    "mrsahebsandhu@gmail.com",
    "pujeradi@gmail.com",
}


def is_privileged_email(email: str) -> bool:
    """Check if email has privileged founding access"""
    return email.lower() in PRIVILEGED_EMAILS


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_token(user_id: str, email: str, expiry_hours: int = None) -> str:
    hours = expiry_hours if expiry_hours is not None else JWT_EXPIRY_HOURS
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def register_user(email: str, password: str, nickname: str = None) -> dict:
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise ValueError("Email already registered")

    now = datetime.now(timezone.utc).isoformat()
    is_privileged = is_privileged_email(email)
    
    user_doc = {
        "email": email,
        "password_hash": hash_password(password),
        "nickname": nickname,
        "is_privileged": is_privileged,
        "created_at": now,
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_token(user_id, email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email,
            "nickname": nickname,
            "is_privileged": is_privileged,
            "created_at": now
        },
    }


async def login_user(email: str, password: str) -> dict:
    user = await users_collection.find_one({"email": email})
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")

    user_id = str(user["_id"])
    is_privileged = is_privileged_email(email)
    
    token = create_token(user_id, email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "nickname": user.get("nickname"),
            "is_privileged": is_privileged,
            "created_at": user["created_at"],
        },
    }


async def change_password(user_id: str, current_password: str, new_password: str) -> None:
    from bson import ObjectId

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise ValueError("User not found")

    if not verify_password(current_password, user["password_hash"]):
        raise ValueError("Current password is incorrect")

    new_hash = hash_password(new_password)
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": new_hash}},
    )


async def get_user_by_id(user_id: str) -> dict:
    from bson import ObjectId

    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not user:
        raise ValueError("User not found")
    
    is_privileged = is_privileged_email(user["email"])
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nickname": user.get("nickname"),
        "is_privileged": is_privileged,
        "created_at": user["created_at"],
    }
