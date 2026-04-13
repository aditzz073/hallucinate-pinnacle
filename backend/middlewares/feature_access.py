"""Feature access middleware — plan-aware gating with usage limits."""

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException

from database.connection import users_collection, audits_collection, ai_tests_collection

# ---------------------------------------------------------------------------
# Plan hierarchy (higher index = more access)
# ---------------------------------------------------------------------------
PLAN_HIERARCHY = ["discover", "optimize", "dominate", "founder"]

PLAN_DISPLAY_NAMES = {
    "discover": "Discover",
    "optimize": "Optimize",
    "dominate": "Dominate",
    "founder": "Founder",
    "custom": "Custom",
}

# Legacy plan name migration (applied on read, not a hard migration)
LEGACY_PLAN_MAP = {
    "free": "discover",
    "pro": "optimize",
    "premium": "dominate",
}

VALID_PLANS = {"discover", "optimize", "dominate", "founder", "custom"}

# ---------------------------------------------------------------------------
# Feature → minimum plan required
# ---------------------------------------------------------------------------
FEATURE_PLAN_MAP = {
    # Discover-level (available to all plans)
    "basic_audit": "discover",
    "ai_visibility_score": "discover",
    "basic_recommendations": "discover",
    "limited_ai_testing": "discover",
    "audit_history": "discover",  # limited to 3 records for discover

    # Optimize-level
    "advanced_audit": "optimize",
    "strategy_simulator": "optimize",
    "ai_testing_lab": "optimize",
    "full_ai_testing": "optimize",
    "competitor_intel_limited": "optimize",

    # Dominate-level
    "competitor_intel_full": "dominate",
    "monitoring": "dominate",
    "cli_access": "dominate",
    "unlimited_audits": "dominate",
    "enterprise_reports": "dominate",
    "executive_summary": "dominate",

    # Founder-only
    "api_access": "founder",
}

# Backward-compatible aliases so existing enforce_feature_access calls keep working
FEATURE_ALIASES = {
    "cli_tool": "cli_access",
    "competitor_intel": "competitor_intel_limited",
}

# ---------------------------------------------------------------------------
# Usage limits by plan
# ---------------------------------------------------------------------------
PLAN_LIMITS = {
    "discover": {
        "max_audits_per_month": 5,
        "max_ai_tests_per_month": 3,
        "max_audit_history": 3,
        "max_competitors_per_query": 0,
    },
    "optimize": {
        "max_audits_per_month": 30,
        "max_ai_tests_per_month": 20,
        "max_audit_history": None,  # unlimited
        "max_competitors_per_query": 2,
    },
    "dominate": {
        "max_audits_per_month": None,  # unlimited
        "max_ai_tests_per_month": None,
        "max_audit_history": None,
        "max_competitors_per_query": 5,
    },
    "founder": {
        "max_audits_per_month": None,
        "max_ai_tests_per_month": None,
        "max_audit_history": None,
        "max_competitors_per_query": None,
    },
    "custom": {
        "max_audits_per_month": None,
        "max_ai_tests_per_month": None,
        "max_audit_history": None,
        "max_competitors_per_query": None,
    },
}

# ---------------------------------------------------------------------------
# Upgrade prompt messages per feature
# ---------------------------------------------------------------------------
FEATURE_UPGRADE_MESSAGES = {
    "strategy_simulator": "See exactly what changes will improve your citation probability before making them.",
    "advanced_audit": "Get deep explainability and AI-skip analysis for any page.",
    "competitor_intel_full": "Compare against up to 5 competitors and see exactly why AI prefers them.",
    "competitor_intel_limited": "Unlock competitor intelligence to see why AI prefers other sites.",
    "cli_access": "Run AEO audits directly from your terminal in CI/CD pipelines.",
    "cli_tool": "Run AEO audits directly from your terminal in CI/CD pipelines.",
    "monitoring": "Track AI visibility changes over time with automatic alerts.",
    "enterprise_reports": "Generate comprehensive enterprise reports for stakeholders.",
    "executive_summary": "Get AI-generated executive summaries across all your audits.",
    "ai_testing_lab": "Test your content across multiple AI engines simultaneously.",
    "full_ai_testing": "Unlock unlimited AI testing with deep analysis.",
    "api_access": "Access the Pinnacle API for programmatic integrations.",
}


class UpgradeRequiredException(Exception):
    """Raised when a user tries to access a feature beyond their plan."""

    def __init__(
        self,
        message: str = "Upgrade required to access this feature",
        feature: str = "",
        required_plan: str = "",
        current_plan: str = "",
    ):
        self.message = message
        self.feature = feature
        self.required_plan = required_plan
        self.current_plan = current_plan
        super().__init__(message)


# ---------------------------------------------------------------------------
# Plan normalisation — handles legacy plan names on read
# ---------------------------------------------------------------------------
def _normalize_plan(raw_plan: str | None, is_founding_user: bool = False, is_subscribed: bool = False) -> str:
    if is_founding_user:
        return "founder"

    if raw_plan in LEGACY_PLAN_MAP:
        return LEGACY_PLAN_MAP[raw_plan]

    if raw_plan in PLAN_HIERARCHY or raw_plan == "custom":
        return raw_plan

    # Fallback heuristics
    if is_subscribed:
        return "optimize"
    return "discover"


def _plan_rank(plan: str) -> int:
    try:
        return PLAN_HIERARCHY.index(plan)
    except ValueError:
        if plan == "custom":
            return PLAN_HIERARCHY.index("dominate")  # custom ≥ dominate
        return 0


# ---------------------------------------------------------------------------
# Core access helpers
# ---------------------------------------------------------------------------
def check_feature_access(user: dict, feature_name: str) -> bool:
    """Return True if *user* can access *feature_name*."""
    feature_name = FEATURE_ALIASES.get(feature_name, feature_name)

    required_plan = FEATURE_PLAN_MAP.get(feature_name)
    if required_plan is None:
        # Unknown feature — allow by default (don't break unknown routes)
        return True

    user_plan = user.get("plan", "discover")
    user_plan = _normalize_plan(user_plan, user.get("isFoundingUser", False), user.get("isSubscribed", False))

    return _plan_rank(user_plan) >= _plan_rank(required_plan)


# Backward-compatible alias used by existing code
can_access_feature = check_feature_access


def get_minimum_plan_for_feature(feature_name: str) -> str:
    feature_name = FEATURE_ALIASES.get(feature_name, feature_name)
    return FEATURE_PLAN_MAP.get(feature_name, "discover")


async def check_usage_limit(user_id: str, limit_type: str, plan: str) -> dict:
    """Check a usage limit and return {allowed, used, limit}."""
    plan = _normalize_plan(plan)
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["discover"])
    limit_value = limits.get(limit_type)

    if limit_value is None:
        return {"allowed": True, "used": 0, "limit": None}

    # Count current month usage
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    used = 0
    if limit_type == "max_audits_per_month":
        used = await audits_collection.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start},
        })
    elif limit_type == "max_ai_tests_per_month":
        used = await ai_tests_collection.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start},
        })
    elif limit_type == "max_audit_history":
        used = await audits_collection.count_documents({"user_id": user_id})

    return {
        "allowed": used < limit_value,
        "used": used,
        "limit": limit_value,
    }


# ---------------------------------------------------------------------------
# Build feature access map for a plan
# ---------------------------------------------------------------------------
def build_feature_map(plan: str) -> dict:
    """Return a {feature: bool} map for the given plan."""
    plan = _normalize_plan(plan)
    result = {}
    for feature, required in FEATURE_PLAN_MAP.items():
        result[feature] = _plan_rank(plan) >= _plan_rank(required)
    return result


# ---------------------------------------------------------------------------
# Normalise a raw user document to canonical access fields
# ---------------------------------------------------------------------------
def _normalize_access_doc(user_doc: dict) -> dict:
    is_founding_user = bool(user_doc.get("isFoundingUser", user_doc.get("is_privileged", False)))
    is_subscribed = bool(user_doc.get("isSubscribed", False))

    plan = _normalize_plan(user_doc.get("plan"), is_founding_user, is_subscribed)
    plan_name = PLAN_DISPLAY_NAMES.get(plan, plan.title())

    return {
        "plan": plan,
        "plan_name": plan_name,
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
                "subscription_status": 1,
                "billing_cycle": 1,
                "stripe_customer_id": 1,
                "stripeCustomerId": 1,
                "custom_plan": 1,
            },
        )
    except Exception:
        user_doc = None

    if not user_doc:
        return {
            "plan": "discover",
            "plan_name": "Discover",
            "isSubscribed": False,
            "isFoundingUser": False,
        }

    return _normalize_access_doc(user_doc)


async def enforce_feature_access(current_user: dict, feature: str) -> dict:
    """Enforce that the authenticated user can access *feature*.

    Raises UpgradeRequiredException (handled by the global exception handler)
    if the user's plan is insufficient.
    """
    if not current_user or not current_user.get("user_id"):
        raise HTTPException(status_code=401, detail="Authentication required")

    user_access = await get_user_access(current_user["user_id"])
    if not check_feature_access(user_access, feature):
        canonical = FEATURE_ALIASES.get(feature, feature)
        required = get_minimum_plan_for_feature(canonical)
        required_display = PLAN_DISPLAY_NAMES.get(required, required.title())
        current_display = user_access.get("plan_name", user_access["plan"].title())
        upgrade_msg = FEATURE_UPGRADE_MESSAGES.get(canonical, "Unlock this feature by upgrading your plan.")

        raise UpgradeRequiredException(
            message=upgrade_msg,
            feature=canonical,
            required_plan=required_display,
            current_plan=current_display,
        )
    return user_access
