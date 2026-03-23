import bcrypt
import jwt
import os
from datetime import datetime, timezone, timedelta
from database.connection import users_collection

JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_EXPIRY_HOURS = int(os.environ.get("JWT_EXPIRY_HOURS", "24"))

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required and cannot be empty")

# Privileged access whitelist (founding team)
PRIVILEGED_EMAILS = {
    "mrsahebsandhu@gmail.com",
    "pujeradi@gmail.com",
}


def is_privileged_email(email: str) -> bool:
    """Check if email has privileged founding access"""
    return email.lower() in PRIVILEGED_EMAILS


def _normalize_access_fields(user_doc: dict, fallback_email: str = "") -> dict:
    # Keep backward compatibility with legacy is_privileged field.
    is_founding_user = bool(
        user_doc.get("isFoundingUser", user_doc.get("is_privileged", False))
        or (fallback_email and is_privileged_email(fallback_email))
    )
    is_subscribed = bool(user_doc.get("isSubscribed", False))

    plan = user_doc.get("plan")
    if plan not in {"free", "pro", "founder"}:
        if is_founding_user:
            plan = "founder"
        elif is_subscribed:
            plan = "pro"
        else:
            plan = "free"

    return {
        "plan": plan,
        "isSubscribed": is_subscribed,
        "isFoundingUser": is_founding_user,
        "is_privileged": is_founding_user,
    }


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
    access_fields = {
        "plan": "founder" if is_privileged else "free",
        "isSubscribed": False,
        "isFoundingUser": is_privileged,
        "is_privileged": is_privileged,
    }
    
    user_doc = {
        "email": email,
        "password_hash": hash_password(password),
        "nickname": nickname,
        **access_fields,
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
            **access_fields,
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
    access_fields = _normalize_access_fields(user, fallback_email=email)
    
    token = create_token(user_id, email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "nickname": user.get("nickname"),
            **access_fields,
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
    
    access_fields = _normalize_access_fields(user, fallback_email=user.get("email", ""))
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nickname": user.get("nickname"),
        **access_fields,
        "created_at": user["created_at"],
    }
