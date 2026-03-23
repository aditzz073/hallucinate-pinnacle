from bson import ObjectId

from database.connection import users_collection

PREMIUM_FEATURES = [
    "advanced_audit",
    "strategy_simulator",
    "competitor_intel",
    "cli_tool",
]


class UpgradeRequiredException(Exception):
    def __init__(self, message: str = "Upgrade required to access this feature"):
        self.message = message
        super().__init__(message)


def can_access_feature(user: dict, feature: str) -> bool:
    if feature not in PREMIUM_FEATURES:
        return True

    if user.get("isFoundingUser") is True:
        return True

    if user.get("isSubscribed") is True:
        return True

    return False


def _normalize_access_doc(user_doc: dict) -> dict:
    is_founding_user = bool(user_doc.get("isFoundingUser", user_doc.get("is_privileged", False)))
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
    }


async def get_user_access(user_id: str) -> dict:
    try:
        user_doc = await users_collection.find_one(
            {"_id": ObjectId(user_id)},
            {
                "plan": 1,
                "isSubscribed": 1,
                "isFoundingUser": 1,
                "is_privileged": 1,
            },
        )
    except Exception:
        user_doc = None

    if not user_doc:
        return {
            "plan": "free",
            "isSubscribed": False,
            "isFoundingUser": False,
        }

    return _normalize_access_doc(user_doc)


async def enforce_feature_access(current_user: dict, feature: str) -> dict:
    user_access = await get_user_access(current_user["user_id"])
    if not can_access_feature(user_access, feature):
        raise UpgradeRequiredException()
    return user_access
