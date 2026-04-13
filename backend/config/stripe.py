import os

import stripe

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# Per-plan price IDs
STRIPE_DISCOVER_PRICE_ID = os.getenv("STRIPE_DISCOVER_PRICE_ID", "").strip()
STRIPE_OPTIMIZE_PRICE_ID = os.getenv("STRIPE_OPTIMIZE_PRICE_ID", "").strip()
STRIPE_DOMINATE_PRICE_ID = os.getenv("STRIPE_DOMINATE_PRICE_ID", "").strip()

# Legacy fallback — kept so old code referencing it doesn't crash
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "").strip()

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# Map plan names → Stripe Price IDs
PLAN_PRICE_MAP = {
    "discover": STRIPE_DISCOVER_PRICE_ID,
    "optimize": STRIPE_OPTIMIZE_PRICE_ID,
    "dominate": STRIPE_DOMINATE_PRICE_ID,
}

PLAN_DISPLAY_NAMES = {
    "discover": "Discover",
    "optimize": "Optimize",
    "dominate": "Dominate",
    "founder": "Founder",
    "custom": "Custom",
}


def stripe_is_configured() -> bool:
    return bool(STRIPE_SECRET_KEY and any(PLAN_PRICE_MAP.values()))


def webhook_is_configured() -> bool:
    return bool(STRIPE_WEBHOOK_SECRET)


def get_price_id_for_plan(plan: str) -> str | None:
    return PLAN_PRICE_MAP.get(plan)
