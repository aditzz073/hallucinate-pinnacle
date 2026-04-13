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

LEGACY_PLAN_MAP = {
    "pro": "optimize",
    "premium": "dominate",
}

VALID_PLANS = {"free", "discover", "optimize", "dominate", "founder", "custom"}

PLAN_DISPLAY_NAMES = {
    "free":     "Free",
    "discover": "Discover",
    "optimize": "Optimize",
    "dominate": "Dominate",
    "founder":  "Founder",
    "custom":   "Custom",
}


def is_privileged_email(email: str) -> bool:
    """Check if email has privileged founding access"""
    return email.lower() in PRIVILEGED_EMAILS


def _normalize_plan(raw_plan: str | None, is_founding_user: bool = False, is_subscribed: bool = False) -> str:
    if is_founding_user:
        return "founder"
    if raw_plan in LEGACY_PLAN_MAP:
        return LEGACY_PLAN_MAP[raw_plan]
    if raw_plan in VALID_PLANS:
        return raw_plan
    if is_subscribed:
        return "optimize"
    return "free"


def _normalize_access_fields(user_doc: dict, fallback_email: str = "") -> dict:
    # Keep backward compatibility with legacy is_privileged field.
    is_founding_user = bool(
        user_doc.get("isFoundingUser", user_doc.get("is_privileged", False))
        or (fallback_email and is_privileged_email(fallback_email))
    )
    is_subscribed = bool(user_doc.get("isSubscribed", False))

    plan = _normalize_plan(user_doc.get("plan"), is_founding_user, is_subscribed)
    plan_name = PLAN_DISPLAY_NAMES.get(plan, plan.title())

    return {
        "plan": plan,
        "plan_name": plan_name,
        "isSubscribed": is_subscribed,
        "stripeCustomerId": user_doc.get("stripeCustomerId"),
        "isFoundingUser": is_founding_user,
        "is_privileged": is_founding_user,
        "subscription_status": user_doc.get("subscription_status", user_doc.get("subscriptionStatus", "none")),
        "billing_cycle": user_doc.get("billing_cycle", "monthly"),
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

    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    is_privileged = is_privileged_email(email)
    plan = "founder" if is_privileged else "free"
    plan_name = PLAN_DISPLAY_NAMES[plan]

    access_fields = {
        "plan": plan,
        "plan_name": plan_name,
        "isSubscribed": False,
        "isFoundingUser": is_privileged,
        "is_privileged": is_privileged,
    }
    response_access_fields = {
        **access_fields,
        "stripeCustomerId": None,
        "subscription_status": "none",
        "billing_cycle": "monthly",
    }

    period_start = now_dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month = period_start.month % 12 + 1
    next_year = period_start.year + (1 if next_month == 1 else 0)
    period_end = period_start.replace(year=next_year, month=next_month, day=1)

    user_doc = {
        "email": email,
        "password_hash": hash_password(password),
        "nickname": nickname,
        **access_fields,
        "stripeSubscriptionId": None,
        "stripeCustomerId": None,
        "subscription_status": "none",
        "billing_cycle": "monthly",
        "plan_expires_at": None,
        "custom_plan": False,
        "subscriptionUpdatedAt": now_iso,
        "created_at": now_iso,
        "usage": {
            "current_period_start": period_start.isoformat(),
            "current_period_end":   period_end.isoformat(),
            "aeo_audits_used":          0,
            "ai_lab_tests_used":        0,
            "advanced_audits_used":     0,
            "ai_testing_lab_used":      0,
            "strategy_simulator_used":  0,
            "competitor_intel_used":    0,
            "monitoring_urls_count":    0,
        },
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
            **response_access_fields,
            "created_at": now_iso
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
