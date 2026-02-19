import bcrypt
import jwt
import os
from datetime import datetime, timezone, timedelta
from database.connection import users_collection

JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", "24"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def register_user(email: str, password: str, nickname: str = None) -> dict:
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise ValueError("Email already registered")

    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "email": email,
        "password_hash": hash_password(password),
        "nickname": nickname,
        "created_at": now,
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_token(user_id, email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user_id, "email": email, "nickname": nickname, "created_at": now},
    }


async def login_user(email: str, password: str) -> dict:
    user = await users_collection.find_one({"email": email})
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")

    user_id = str(user["_id"])
    token = create_token(user_id, email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "created_at": user["created_at"],
        },
    }


async def get_user_by_id(user_id: str) -> dict:
    from bson import ObjectId

    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not user:
        raise ValueError("User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "created_at": user["created_at"],
    }
