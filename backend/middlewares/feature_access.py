"""Feature access middleware — 5-stage plan-aware gating with usage limits.

Stages:
  guest     (-1) — not registered, tracked in localStorage frontend-side
  free        (0) — registered, no plan
  discover    (1) — ₹8,000/month
  optimize    (2) — ₹15,000/month
  dominate    (3) — ₹40,000/month
  founder    (99) — full access, bypasses all checks
"""

from datetime import datetime, timezone, timedelta
from calendar import monthrange
from bson import ObjectId
from fastapi import HTTPException

from database.connection import users_collection, audits_collection, ai_tests_collection

# ---------------------------------------------------------------------------
# Plan hierarchy
# ---------------------------------------------------------------------------
PLAN_HIERARCHY = ["free", "discover", "optimize", "dominate", "founder"]

PLAN_LEVELS = {
    "guest":    -1,
    "free":      0,
    "discover":  1,
    "optimize":  2,
    "dominate":  3,
    "founder":  99,
    "custom":    3,  # custom ≥ dominate
}

PLAN_DISPLAY_NAMES = {
    "guest":    "Guest",
    "free":     "Free",
    "discover": "Discover",
    "optimize": "Optimize",
    "dominate": "Dominate",
    "founder":  "Founder",
    "custom":   "Custom",
}

# Legacy plan name migration (applied on read, not a hard migration)
LEGACY_PLAN_MAP = {
    "free":    "free",       # "free" is now a real stage, not discover
    "pro":     "optimize",
    "premium": "dominate",
}

VALID_PLANS = {"free", "discover", "optimize", "dominate", "founder", "custom"}

# ---------------------------------------------------------------------------
# Feature → minimum plan required (boolean lock)
# ---------------------------------------------------------------------------
FEATURE_PLAN_MAP = {
    # Available to all registered users (free+)
    "basic_audit":          "free",
    "ai_visibility_score":  "free",
    "full_recommendations": "free",
    "basic_pdf_report":     "free",
    "audit_history":        "free",

    # Discover+
    "advanced_audit":       "discover",
    "ai_testing_lab":       "discover",
    "monitoring":           "discover",

    # Optimize+
    "strategy_simulator":   "optimize",
    "competitor_intel":     "optimize",
    "competitor_intel_limited": "optimize",
    "branded_pdf_report":   "optimize",

    # Dominate only
    "competitor_intel_full": "dominate",
    "cli_access":           "dominate",
    "executive_summary":    "dominate",
    "enterprise_reports":   "dominate",
    "ai_skip_reason":       "dominate",
    "priority_fixes":       "dominate",
    "real_time_alerts":     "dominate",
    "api_access":           "dominate",
    "unlimited_audits":     "dominate",
}

# Backward-compatible aliases so existing enforce_feature_access calls keep working
FEATURE_ALIASES = {
    "cli_tool":              "cli_access",
    "competitor_intel":      "competitor_intel_limited",
    "full_ai_testing":       "ai_testing_lab",
    "limited_ai_testing":    "basic_audit",
    "ai_testing_lab_run":    "ai_testing_lab",
    "basic_recommendations": "full_recommendations",
}

# ---------------------------------------------------------------------------
# Monthly usage limits per plan
# "999999" = effectively unlimited
# ---------------------------------------------------------------------------
PLAN_LIMITS = {
    "free": {
        "aeo_audits":            5,
        "ai_lab_tests":          3,
        "advanced_audits":       0,
        "ai_testing_lab":        0,
        "strategy_simulator":    0,
        "competitor_intel":      0,
        "monitoring_urls":       0,
        "audit_history_records": 5,
    },
    "discover": {
        "aeo_audits":            20,
        "ai_lab_tests":          10,
        "advanced_audits":       5,
        "ai_testing_lab":        5,
        "strategy_simulator":    0,
        "competitor_intel":      0,
        "monitoring_urls":       1,
        "audit_history_records": 30,
    },
    "optimize": {
        "aeo_audits":            60,
        "ai_lab_tests":          30,
        "advanced_audits":       20,
        "ai_testing_lab":        25,
        "strategy_simulator":    15,
        "competitor_intel":      2,  # per query
        "monitoring_urls":       5,
        "audit_history_records": 999999,
    },
    "dominate": {
        "aeo_audits":            999999,
        "ai_lab_tests":          999999,
        "advanced_audits":       999999,
        "ai_testing_lab":        999999,
        "strategy_simulator":    999999,
        "competitor_intel":      5,  # per query
        "monitoring_urls":       20,
        "audit_history_records": 999999,
    },
    "founder": {
        "aeo_audits":            999999,
        "ai_lab_tests":          999999,
        "advanced_audits":       999999,
        "ai_testing_lab":        999999,
        "strategy_simulator":    999999,
        "competitor_intel":      999999,
        "monitoring_urls":       999999,
        "audit_history_records": 999999,
    },
    "custom": {
        "aeo_audits":            999999,
        "ai_lab_tests":          999999,
        "advanced_audits":       999999,
        "ai_testing_lab":        999999,
        "strategy_simulator":    999999,
        "competitor_intel":      5,
        "monitoring_urls":       999999,
        "audit_history_records": 999999,
    },
}

# Upgrade messages per feature (exact strings from the spec)
FEATURE_UPGRADE_MESSAGES = {
    "advanced_audit":
        "Get deep AI explainability for any page. Available from Discover — ₹8,000/month.",
    "ai_testing_lab":
        "Test your content across multiple AI engines simultaneously. Available from Discover — ₹8,000/month.",
    "monitoring":
        "Track AI visibility score changes automatically. Available from Discover — ₹8,000/month.",
    "strategy_simulator":
        "See exactly what fixes will improve your citation probability before making them. Available from Optimize — ₹15,000/month.",
    "competitor_intel":
        "See why competitors outrank you in AI-generated answers. Available from Optimize — ₹15,000/month.",
    "competitor_intel_limited":
        "See why competitors outrank you in AI-generated answers. Available from Optimize — ₹15,000/month.",
    "branded_pdf_report":
        "Download branded PDF reports for clients. Available from Optimize — ₹15,000/month.",
    "cli_access":
        "Run AEO audits from your terminal in CI/CD pipelines. Available in Dominate — ₹40,000/month.",
    "cli_tool":
        "Run AEO audits from your terminal in CI/CD pipelines. Available in Dominate — ₹40,000/month.",
    "executive_summary":
        "Get a full AI visibility portfolio summary. Available in Dominate — ₹40,000/month.",
    "enterprise_reports":
        "Generate comprehensive enterprise reports for stakeholders. Available in Dominate — ₹40,000/month.",
    "ai_skip_reason":
        "Understand exactly why AI skips your content. Available in Dominate — ₹40,000/month.",
    "priority_fixes":
        "Get prioritized fix recommendations from AI analysis. Available in Dominate — ₹40,000/month.",
    "real_time_alerts":
        "Get notified instantly when your AI visibility changes. Available in Dominate — ₹40,000/month.",
    "api_access":
        "Access the Pinnacle API for programmatic integrations. Available in Dominate — ₹40,000/month.",
    "competitor_intel_full":
        "Compare against up to 5 competitors. Available in Dominate — ₹40,000/month.",
}

# Usage limit upgrade messages
USAGE_LIMIT_MESSAGES = {
    "aeo_audits": {
        "free":     "Upgrade to Discover for 20 audits/month — ₹8,000/month.",
        "discover": "Upgrade to Optimize for 60 audits/month — ₹15,000/month.",
        "optimize": "Upgrade to Dominate for unlimited audits — ₹40,000/month.",
    },
    "ai_lab_tests": {
        "free":     "Upgrade to Discover for 10 AI tests/month — ₹8,000/month.",
        "discover": "Upgrade to Optimize for 30 AI tests/month — ₹15,000/month.",
        "optimize": "Upgrade to Dominate for unlimited AI tests — ₹40,000/month.",
    },
    "advanced_audits": {
        "discover": "Upgrade to Optimize for 20 advanced audits/month — ₹15,000/month.",
        "optimize": "Upgrade to Dominate for unlimited advanced audits — ₹40,000/month.",
    },
    "strategy_simulator": {
        "optimize": "Upgrade to Dominate for unlimited simulations — ₹40,000/month.",
    },
    "ai_testing_lab": {
        "discover": "Upgrade to Optimize for 25 AI lab runs/month — ₹15,000/month.",
        "optimize": "Upgrade to Dominate for unlimited AI lab runs — ₹40,000/month.",
    },
}


# ---------------------------------------------------------------------------
# Custom exception classes
# ---------------------------------------------------------------------------
class UpgradeRequiredException(Exception):
    """Feature completely locked — wrong plan."""

    def __init__(
        self,
        message: str = "Upgrade required to access this feature",
        feature: str = "",
        required_plan: str = "",
        current_plan: str = "",
        error_type: str = "feature_locked",
    ):
        self.message = message
        self.feature = feature
        self.required_plan = required_plan
        self.current_plan = current_plan
        self.error_type = error_type
        super().__init__(message)


class UsageLimitReachedException(Exception):
    """Plan allows feature but monthly limit hit. Should return HTTP 429."""

    def __init__(
        self,
        feature: str,
        used: int,
        limit: int,
        resets_at: str,
        upgrade_message: str = "",
        current_plan: str = "",
    ):
        self.feature = feature
        self.used = used
        self.limit = limit
        self.resets_at = resets_at
        self.upgrade_message = upgrade_message
        self.current_plan = current_plan
        super().__init__(f"Usage limit reached: {used}/{limit} for {feature}")


class NoActivePlanException(Exception):
    """Free user hitting a feature that requires any paid plan."""

    def __init__(self, feature: str = "", required_plan: str = "discover"):
        self.feature = feature
        self.required_plan = required_plan
        super().__init__(f"No active plan for feature: {feature}")


# ---------------------------------------------------------------------------
# Plan normalisation
# ---------------------------------------------------------------------------
def _normalize_plan(raw_plan: str | None, is_founding_user: bool = False, is_subscribed: bool = False) -> str:
    if is_founding_user:
        return "founder"
    if raw_plan in LEGACY_PLAN_MAP:
        mapped = LEGACY_PLAN_MAP[raw_plan]
        # "free" maps to itself, not discover
        return mapped
    if raw_plan in VALID_PLANS:
        return raw_plan
    # Fallback: if subscribed but plan unknown, default optimize
    if is_subscribed:
        return "optimize"
    return "free"


def _plan_level(plan: str) -> int:
    return PLAN_LEVELS.get(plan, 0)


# ---------------------------------------------------------------------------
# Core boolean feature access check
# ---------------------------------------------------------------------------
def check_feature_access(user: dict, feature_name: str) -> bool:
    """Return True if user can access feature_name (boolean lock only, not usage)."""
    feature_name = FEATURE_ALIASES.get(feature_name, feature_name)

    required_plan = FEATURE_PLAN_MAP.get(feature_name)
    if required_plan is None:
        return True  # unknown feature — allow

    user_plan = _normalize_plan(
        user.get("plan"),
        user.get("isFoundingUser", False),
        user.get("isSubscribed", False),
    )

    # Founder bypasses everything
    if user_plan == "founder":
        return True

    return _plan_level(user_plan) >= _plan_level(required_plan)


# Backward-compatible alias
can_access_feature = check_feature_access


def get_minimum_plan_for_feature(feature_name: str) -> str:
    """Return display name of minimum plan required for a feature."""
    feature_name = FEATURE_ALIASES.get(feature_name, feature_name)
    plan_key = FEATURE_PLAN_MAP.get(feature_name, "free")
    return PLAN_DISPLAY_NAMES.get(plan_key, plan_key.title())


def get_minimum_plan_key_for_feature(feature_name: str) -> str:
    """Return raw plan key (e.g. 'optimize') for the minimum plan required."""
    feature_name = FEATURE_ALIASES.get(feature_name, feature_name)
    return FEATURE_PLAN_MAP.get(feature_name, "free")


# ---------------------------------------------------------------------------
# Usage limit check (reads from user.usage embedded doc)
# ---------------------------------------------------------------------------
def _next_month_start(now: datetime) -> datetime:
    """Return datetime for the first day of next month."""
    year = now.year
    month = now.month
    if month == 12:
        return datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    return datetime(year, month + 1, 1, tzinfo=timezone.utc)


def _get_usage_doc(user_doc: dict) -> dict:
    """Return usage embedded doc, always with safe defaults."""
    usage = user_doc.get("usage") or {}
    now = datetime.now(timezone.utc)
    first = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    nxt = _next_month_start(now)
    return {
        "current_period_start": usage.get("current_period_start", first.isoformat()),
        "current_period_end": usage.get("current_period_end", nxt.isoformat()),
        "aeo_audits_used":           usage.get("aeo_audits_used", 0),
        "ai_lab_tests_used":         usage.get("ai_lab_tests_used", 0),
        "advanced_audits_used":      usage.get("advanced_audits_used", 0),
        "ai_testing_lab_used":       usage.get("ai_testing_lab_used", 0),
        "strategy_simulator_used":   usage.get("strategy_simulator_used", 0),
        "competitor_intel_used":     usage.get("competitor_intel_used", 0),
        "monitoring_urls_count":     usage.get("monitoring_urls_count", 0),
    }


def check_usage_limit_from_doc(user_doc: dict, limit_type: str) -> dict:
    """
    Check usage limit from embedded user doc (no DB hit).
    Returns {allowed, used, limit, remaining, resets_at}.
    """
    user_plan = _normalize_plan(
        user_doc.get("plan"),
        user_doc.get("isFoundingUser", False),
        user_doc.get("isSubscribed", False),
    )

    limits = PLAN_LIMITS.get(user_plan, PLAN_LIMITS["free"])
    limit_value = limits.get(limit_type, 0)

    usage = _get_usage_doc(user_doc)

    # Map limit_type to usage field
    field_map = {
        "aeo_audits":      "aeo_audits_used",
        "ai_lab_tests":    "ai_lab_tests_used",
        "advanced_audits": "advanced_audits_used",
        "ai_testing_lab":  "ai_testing_lab_used",
        "strategy_simulator": "strategy_simulator_used",
        "competitor_intel":   "competitor_intel_used",
        "monitoring_urls":    "monitoring_urls_count",
    }
    used = usage.get(field_map.get(limit_type, limit_type), 0)
    resets_at = usage.get("current_period_end", "")

    allowed = limit_value == 999999 or used < limit_value

    return {
        "allowed": allowed,
        "used": used,
        "limit": limit_value if limit_value != 999999 else None,
        "remaining": max(0, limit_value - used) if limit_value != 999999 else None,
        "resets_at": resets_at,
        "plan": user_plan,
    }


# ---------------------------------------------------------------------------
# Monthly usage reset
# ---------------------------------------------------------------------------
async def reset_monthly_usage_if_needed(user_id: str) -> dict | None:
    """
    If current_period_end has passed, reset monthly counters and update DB.
    Does NOT reset monitoring_urls_count (persistent).
    Returns updated user_doc if reset occurred, None otherwise.
    """
    try:
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

    if not user_doc:
        return None

    usage = _get_usage_doc(user_doc)
    now = datetime.now(timezone.utc)

    # Parse period end
    try:
        period_end_str = usage["current_period_end"]
        if period_end_str.endswith("+00:00"):
            period_end_str = period_end_str.replace("+00:00", "+00:00")
        period_end = datetime.fromisoformat(period_end_str)
        if period_end.tzinfo is None:
            period_end = period_end.replace(tzinfo=timezone.utc)
    except Exception:
        period_end = now  # force reset on parse error

    if now < period_end:
        return None  # still in period

    # Reset monthly counters
    new_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_end = _next_month_start(now)

    reset_fields = {
        "usage.current_period_start": new_start.isoformat(),
        "usage.current_period_end":   new_end.isoformat(),
        "usage.aeo_audits_used":          0,
        "usage.ai_lab_tests_used":        0,
        "usage.advanced_audits_used":     0,
        "usage.ai_testing_lab_used":      0,
        "usage.strategy_simulator_used":  0,
        "usage.competitor_intel_used":    0,
        # monitoring_urls_count intentionally NOT reset
    }

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": reset_fields}
    )

    updated = await users_collection.find_one({"_id": ObjectId(user_id)})
    return updated


# ---------------------------------------------------------------------------
# Increment usage counter
# ---------------------------------------------------------------------------
async def increment_usage(user_id: str, field_name: str, amount: int = 1) -> None:
    """Atomically increment a usage counter field (e.g. 'aeo_audits_used')."""
    try:
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {f"usage.{field_name}": amount}},
            upsert=False,
        )
    except Exception:
        pass  # Don't fail the request if counter increment fails


# ---------------------------------------------------------------------------
# Ensure usage subdocument exists (init if missing)
# ---------------------------------------------------------------------------
async def ensure_usage_doc(user_id: str) -> None:
    """Create the usage subdocument if it doesn't exist yet."""
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    period_end = _next_month_start(now)

    await users_collection.update_one(
        {"_id": ObjectId(user_id), "usage": {"$exists": False}},
        {"$set": {
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
            }
        }}
    )


# ---------------------------------------------------------------------------
# Build feature access map for a plan (for frontend handshake)
# ---------------------------------------------------------------------------
def build_feature_map(plan: str) -> dict:
    """Return {feature: bool} map for a given plan (founder sees all True)."""
    plan = _normalize_plan(plan)
    result = {}
    level = _plan_level(plan)
    for feature, required in FEATURE_PLAN_MAP.items():
        result[feature] = (plan == "founder") or (level >= _plan_level(required))
    return result


# ---------------------------------------------------------------------------
# Full user access doc from DB (used by billing/status endpoint)
# ---------------------------------------------------------------------------
async def get_user_access(user_id: str) -> dict:
    try:
        user_doc = await users_collection.find_one(
            {"_id": ObjectId(user_id)},
            {
                "plan": 1, "isSubscribed": 1, "isFoundingUser": 1,
                "is_privileged": 1, "subscription_status": 1,
                "billing_cycle": 1, "stripeCustomerId": 1,
                "custom_plan": 1, "usage": 1,
            },
        )
    except Exception:
        user_doc = None

    if not user_doc:
        return {"plan": "free", "plan_name": "Free", "isSubscribed": False, "isFoundingUser": False}

    plan = _normalize_plan(
        user_doc.get("plan"),
        user_doc.get("isFoundingUser", False),
        user_doc.get("isSubscribed", False),
    )
    usage = _get_usage_doc(user_doc)

    return {
        "plan": plan,
        "plan_name": PLAN_DISPLAY_NAMES.get(plan, plan.title()),
        "isSubscribed": bool(user_doc.get("isSubscribed", False)),
        "isFoundingUser": bool(user_doc.get("isFoundingUser", False)),
        "usage": usage,
    }


# ---------------------------------------------------------------------------
# Main enforcement function (used by all route handlers)
# ---------------------------------------------------------------------------
async def enforce_feature_access(current_user: dict, feature: str) -> dict:
    """
    Enforce that authenticated user can access `feature`.
    Raises UpgradeRequiredException (→ 403) or NoActivePlanException (→ 403).
    Does NOT check usage limits — call check_usage_limit_from_doc separately.
    """
    if not current_user or not current_user.get("user_id"):
        raise HTTPException(status_code=401, detail="Authentication required")

    user_access = await get_user_access(current_user["user_id"])
    canonical = FEATURE_ALIASES.get(feature, feature)

    if not check_feature_access(user_access, canonical):
        user_plan = user_access.get("plan", "free")
        required = get_minimum_plan_key_for_feature(canonical)
        required_display = PLAN_DISPLAY_NAMES.get(required, required.title())
        current_display = PLAN_DISPLAY_NAMES.get(user_plan, user_plan.title())
        upgrade_msg = FEATURE_UPGRADE_MESSAGES.get(canonical, "Unlock this feature by upgrading your plan.")

        # If free user hitting any paid feature → NoActivePlan
        if user_plan == "free":
            raise NoActivePlanException(feature=canonical, required_plan=required)

        raise UpgradeRequiredException(
            message=upgrade_msg,
            feature=canonical,
            required_plan=required_display,
            current_plan=current_display,
        )

    return user_access


async def enforce_usage_limit(user_id: str, user_doc: dict, limit_type: str, feature: str) -> dict:
    """
    Check usage limit and raise UsageLimitReachedException (→ 429) if exceeded.
    Returns the limit check result dict on success.
    """
    result = check_usage_limit_from_doc(user_doc, limit_type)

    if not result["allowed"]:
        plan = result.get("plan", "free")
        upgrade_msg = (
            USAGE_LIMIT_MESSAGES.get(limit_type, {}).get(plan)
            or f"Upgrade your plan for more {limit_type.replace('_', ' ')}."
        )
        raise UsageLimitReachedException(
            feature=feature,
            used=result["used"],
            limit=result["limit"] or 0,
            resets_at=result["resets_at"],
            upgrade_message=upgrade_msg,
            current_plan=plan,
        )

    return result


# ---------------------------------------------------------------------------
# Normalise raw user doc to access fields (used by auth service)
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
