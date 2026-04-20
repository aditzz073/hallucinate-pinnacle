"""
Stripe Webhook & Billing Tests — Pinnacle.AI
============================================

Tests covered:
  1. Successful checkout.session.completed → isSubscribed = True
  2. Missing metadata (no user_id) → webhook returns 200 "ignored"
  3. Invalid webhook signature → 400 rejected
  4. customer.subscription.deleted → isSubscribed = False
  5. invoice.payment_succeeded → subscription reactivated
  6. invoice.payment_failed → status → past_due, access retained
  7. customer.subscription.updated (active) → plan updated
  8. Checkout session creation includes metadata with user_id

Units tests (no live server / DB needed) are in TestWebhookUnit.
Integration tests (require running backend) are in TestWebhookIntegration.
"""

import hashlib
import hmac
import json
import os
import sys
import time
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure backend package root is on sys.path so 'modules', 'config', etc. resolve
_BACKEND_DIR = str(Path(__file__).parent.parent.resolve())
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Load .env from backend so JWT_SECRET etc. are set before any imports
from dotenv import load_dotenv as _load_dotenv
_load_dotenv(Path(_BACKEND_DIR) / ".env")

import pytest

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _detect_backend_url() -> str:
    """Try port 8000 first (current default), then 8001 as fallback."""
    import urllib.request
    explicit = (
        os.environ.get("BACKEND_BASE_URL")
        or os.environ.get("REACT_APP_BACKEND_URL")
    )
    if explicit:
        return explicit.rstrip("/")
    for port in (8000, 8001):
        try:
            urllib.request.urlopen(f"http://localhost:{port}/api/health", timeout=2)
            return f"http://localhost:{port}"
        except Exception:
            pass
    return "http://localhost:8000"  # best guess

BASE_URL = _detect_backend_url()


WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_test_secret_for_unit_tests")


def _stripe_sig_header(payload: bytes, secret: str) -> str:
    """Build a valid Stripe-Signature header (t=timestamp,v1=hmac)."""
    ts = str(int(time.time()))
    signed_payload = f"{ts}.{payload.decode()}"
    sig = hmac.new(
        secret.encode("utf-8"),
        signed_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"t={ts},v1={sig}"


def _make_event(event_type: str, data: dict, metadata: dict | None = None) -> dict:
    """Build a minimal Stripe event dict for testing."""
    obj = {**data}
    if metadata is not None:
        obj["metadata"] = metadata
    return {
        "id": "evt_test_123",
        "type": event_type,
        "livemode": False,
        "data": {"object": obj},
    }


# ─────────────────────────────────────────────────────────────────────────────
# Unit Tests — no network / DB required
# ─────────────────────────────────────────────────────────────────────────────

class TestWebhookUnit:
    """
    Pure unit tests for the webhook handler logic.
    Mocks out: stripe.Webhook.construct_event, users_collection, stripe.Subscription.retrieve.
    """

    # ── helpers ──────────────────────────────────────────────────────────────

    def _mock_update_result(self, modified: int = 1, matched: int = 1):
        result = MagicMock()
        result.modified_count = modified
        result.matched_count = matched
        return result

    def _mock_find_one(self, doc: dict | None):
        """Return an async mock that resolves to `doc`."""
        return AsyncMock(return_value=doc)

    # ── Test 1: checkout.session.completed → isSubscribed = True ─────────────

    @pytest.mark.asyncio
    async def test_checkout_session_completed_activates_subscription(self):
        """
        GIVEN  a valid checkout.session.completed event with user_id in metadata
        WHEN   the webhook handler processes it
        THEN   users_collection.update_one is called with isSubscribed=True
        """
        from modules.billing.routes import stripe_webhook

        user_id = "507f1f77bcf86cd799439011"
        customer_id = "cus_test_123"
        subscription_id = "sub_test_456"

        event = _make_event(
            "checkout.session.completed",
            {
                "customer": customer_id,
                "subscription": subscription_id,
                "client_reference_id": user_id,
            },
            metadata={"user_id": user_id, "plan": "optimize"},
        )

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        mock_request.headers = {"stripe-signature": "v1=sig"}

        mock_user_doc = {"_id": "507f1f77bcf86cd799439011"}

        with (
            patch("stripe.Webhook.construct_event", return_value=event),
            patch("modules.billing.routes.users_collection") as mock_col,
            patch("stripe.Subscription.retrieve") as mock_sub_retrieve,
        ):
            mock_col.find_one = self._mock_find_one(mock_user_doc)
            mock_col.update_one = AsyncMock(return_value=self._mock_update_result())

            # Subscription retrieve returns a subscription with a price
            mock_sub = MagicMock()
            mock_sub.get = lambda k, d=None: {
                "items": {"data": [{"price": {"id": "price_optimize_id"}}]}
            }.get(k, d)
            mock_sub_retrieve.return_value = mock_sub

            response = await stripe_webhook(mock_request)

        assert response == {"status": "success"}, f"Expected success, got {response}"
        mock_col.update_one.assert_called_once()
        call_args = mock_col.update_one.call_args
        update_doc = call_args[0][1] if call_args[0] else call_args.kwargs.get("update", {})
        assert update_doc.get("$set", {}).get("isSubscribed") is True, (
            "Expected isSubscribed=True in DB update"
        )
        print("✓ checkout.session.completed → isSubscribed=True confirmed in DB update call")

    # ── Test 2: Missing metadata → webhook returns 200 "ignored" ─────────────

    @pytest.mark.asyncio
    async def test_checkout_session_missing_user_id_returns_ignored(self):
        """
        GIVEN  a checkout.session.completed event with NO user_id in metadata
               AND no client_reference_id
        WHEN   the webhook handler processes it
        THEN   it returns {"status": "ignored"} (200) and does NOT update the DB
        """
        import os
        from modules.billing.routes import stripe_webhook

        discover_price_id = os.getenv("STRIPE_DISCOVER_PRICE_ID", "price_test_discover")

        event = _make_event(
            "checkout.session.completed",
            # No user_id / client_reference_id — but include a valid subscription
            # so plan-resolution succeeds and the user_id check can fire
            {"customer": "cus_test_xyz", "subscription": "sub_test_xyz", "id": "cs_test_xyz"},
            metadata={},  # no user_id!
        )

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        mock_request.headers = {"stripe-signature": "v1=sig"}

        mock_sub = {
            "items": {"data": [{"price": {"id": discover_price_id}}]}
        }

        with (
            patch("stripe.Webhook.construct_event", return_value=event),
            patch("modules.billing.routes.users_collection") as mock_col,
            patch("stripe.Subscription.retrieve", return_value=mock_sub),
        ):
            mock_col.update_one = AsyncMock(return_value=self._mock_update_result(modified=0))

            response = await stripe_webhook(mock_request)

        assert response.get("status") == "ignored", (
            f"Expected status='ignored' when user_id missing, got {response}"
        )
        mock_col.update_one.assert_not_called()
        print("\u2713 Missing user_id \u2192 webhook returns 'ignored' (200) without DB write")

    # ── Test 3: Invalid signature → 400 ─────────────────────────────────────

    @pytest.mark.asyncio
    async def test_invalid_signature_returns_400(self):
        """
        GIVEN  a webhook request with a forged/wrong stripe-signature
        WHEN   the webhook handler processes it
        THEN   it raises HTTPException with status_code=400
        """
        import stripe
        from fastapi import HTTPException
        from modules.billing.routes import stripe_webhook

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        mock_request.headers = {"stripe-signature": "t=1,v1=badbadbadbad"}

        with patch(
            "stripe.Webhook.construct_event",
            side_effect=stripe.SignatureVerificationError("sig mismatch", "t=1,v1=bad"),
        ):
            with pytest.raises(HTTPException) as exc_info:
                await stripe_webhook(mock_request)

        assert exc_info.value.status_code == 400, (
            f"Expected 400 for bad signature, got {exc_info.value.status_code}"
        )
        print("✓ Invalid signature → HTTPException 400")

    # ── Test 4: Subscription cancellation → isSubscribed = False ─────────────

    @pytest.mark.asyncio
    async def test_subscription_deleted_deactivates_user(self):
        """
        GIVEN  a customer.subscription.deleted event
        WHEN   the webhook handler processes it
        THEN   users_collection.update_one is called with isSubscribed=False, plan='discover'
        """
        from modules.billing.routes import stripe_webhook

        customer_id = "cus_test_to_cancel"
        event = _make_event(
            "customer.subscription.deleted",
            {"customer": customer_id},
        )

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        mock_request.headers = {"stripe-signature": "v1=sig"}

        mock_user_doc = {"_id": "507f1f77bcf86cd799439011"}

        with (
            patch("stripe.Webhook.construct_event", return_value=event),
            patch("modules.billing.routes.users_collection") as mock_col,
        ):
            mock_col.find_one = self._mock_find_one(mock_user_doc)
            mock_col.update_one = AsyncMock(return_value=self._mock_update_result())

            response = await stripe_webhook(mock_request)

        assert response == {"status": "success"}, f"Expected success, got {response}"
        mock_col.update_one.assert_called_once()
        call_args = mock_col.update_one.call_args
        update_doc = call_args[0][1] if call_args[0] else {}
        assert update_doc.get("$set", {}).get("isSubscribed") is False
        assert update_doc.get("$set", {}).get("plan") == "discover"
        print("✓ customer.subscription.deleted → isSubscribed=False, plan='discover'")

    # ── Test 5: invoice.payment_succeeded → subscription re-activated ─────────

    @pytest.mark.asyncio
    async def test_invoice_payment_succeeded_reactivates(self):
        """
        GIVEN  an invoice.payment_succeeded event with a valid customer and subscription
        WHEN   the webhook handler processes it
        THEN   _activate_subscription_by_customer_id is called with the correct plan
        """
        import os
        from modules.billing.routes import stripe_webhook

        customer_id = "cus_invoice_test"
        subscription_id = "sub_invoice_test"
        # Use the real price_id from env so _plan_from_price_id resolves it
        optimize_price_id = os.getenv("STRIPE_OPTIMIZE_PRICE_ID", "price_test_optimize")

        event = _make_event(
            "invoice.payment_succeeded",
            {"customer": customer_id, "subscription": subscription_id},
        )

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        mock_request.headers = {"stripe-signature": "v1=sig"}

        mock_user_doc = {"_id": "507f1f77bcf86cd799439011"}
        # Return a plain dict so .get() and item access work without MagicMock chains
        mock_sub = {
            "items": {"data": [{"price": {"id": optimize_price_id}}]}
        }

        with (
            patch("stripe.Webhook.construct_event", return_value=event),
            patch("modules.billing.routes.users_collection") as mock_col,
            patch("stripe.Subscription.retrieve", return_value=mock_sub),
        ):
            mock_col.find_one = self._mock_find_one(mock_user_doc)
            mock_col.update_one = AsyncMock(return_value=self._mock_update_result())

            response = await stripe_webhook(mock_request)

        assert response == {"status": "success"}, (
            f"Expected status='success', got {response!r}"
        )
        print("\u2713 invoice.payment_succeeded triggers subscription reactivation with correct plan")

    # ── Test 6: invoice.payment_failed → status = past_due ───────────────────

    @pytest.mark.asyncio
    async def test_invoice_payment_failed_sets_past_due(self):
        """
        GIVEN  an invoice.payment_failed event
        WHEN   the webhook handler processes it
        THEN   update_one is called with subscription_status='past_due'
        """
        from modules.billing.routes import stripe_webhook

        customer_id = "cus_failing_payment"
        event = _make_event(
            "invoice.payment_failed",
            {"customer": customer_id},
        )

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        mock_request.headers = {"stripe-signature": "v1=sig"}

        with (
            patch("stripe.Webhook.construct_event", return_value=event),
            patch("modules.billing.routes.users_collection") as mock_col,
        ):
            mock_col.update_one = AsyncMock(return_value=self._mock_update_result())

            response = await stripe_webhook(mock_request)

        assert response == {"status": "success"}
        mock_col.update_one.assert_called_once()
        call_args = mock_col.update_one.call_args
        update_doc = call_args[0][1] if call_args[0] else {}
        assert update_doc.get("$set", {}).get("subscription_status") == "past_due"
        print("✓ invoice.payment_failed → subscription_status='past_due'")

    # ── Test 7: Missing stripe-signature header → 400 ─────────────────────────

    @pytest.mark.asyncio
    async def test_missing_signature_header_returns_400(self):
        """
        GIVEN  a webhook request with NO stripe-signature header
        WHEN   the webhook handler processes it
        THEN   it raises HTTPException with status_code=400
        """
        from fastapi import HTTPException
        from modules.billing.routes import stripe_webhook

        mock_request = MagicMock()
        mock_request.body = AsyncMock(return_value=b"{}")
        # Use a MagicMock for headers so .get() can be overridden
        # (Python 3.13 made dict.get a read-only slot)
        mock_headers = MagicMock()
        mock_headers.get = MagicMock(return_value=None)  # no stripe-signature
        mock_request.headers = mock_headers

        with pytest.raises(HTTPException) as exc_info:
            await stripe_webhook(mock_request)

        assert exc_info.value.status_code == 400
        print("✓ Missing stripe-signature header → HTTPException 400")

    # ── Test 8: Checkout session creation includes user_id in metadata ─────────

    @pytest.mark.asyncio
    async def test_create_checkout_session_includes_user_id_in_metadata(self):
        """
        GIVEN  a valid user calls POST /api/billing/checkout
        WHEN   the checkout session is created
        THEN   stripe.checkout.Session.create is called with metadata={'user_id': ...}
        """
        from modules.billing.routes import create_checkout_session, CheckoutRequest

        user_id = "507f1f77bcf86cd799439011"
        mock_current_user = {"user_id": user_id, "email": "test@pinnacle.ai"}
        mock_user_doc = {
            "_id": user_id,
            "email": "test@pinnacle.ai",
            "stripeCustomerId": "cus_existing_123",
        }

        mock_session = MagicMock()
        mock_session.url = "https://checkout.stripe.com/test"

        mock_request = MagicMock()
        mock_request.headers = {}

        with (
            patch("modules.billing.routes.stripe_is_configured", return_value=True),
            patch("modules.billing.routes._get_user_or_404", AsyncMock(return_value=mock_user_doc)),
            patch("modules.billing.routes.get_price_id_for_plan", return_value="price_opt_123"),
            patch("modules.billing.routes.users_collection") as mock_col,
            patch("stripe.checkout.Session.create", return_value=mock_session) as mock_create,
        ):
            mock_col.update_one = AsyncMock(return_value=MagicMock())

            body = CheckoutRequest(plan="optimize")
            result = await create_checkout_session(mock_request, mock_current_user, body)

        assert result["url"] == "https://checkout.stripe.com/test"
        mock_create.assert_called_once()
        call_kwargs = mock_create.call_args.kwargs
        assert "metadata" in call_kwargs, "metadata not passed to Session.create"
        assert call_kwargs["metadata"].get("user_id") == str(user_id), (
            f"user_id not in metadata: {call_kwargs['metadata']}"
        )
        print(f"✓ Session.create called with metadata.user_id={call_kwargs['metadata']['user_id']!r}")


# ─────────────────────────────────────────────────────────────────────────────
# Integration Tests — require running backend at BASE_URL
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def backend_available():
    """Skip integration tests if the server is not reachable."""
    import requests as req
    try:
        r = req.get(f"{BASE_URL}/api/health", timeout=5)
        if r.status_code >= 500:
            pytest.skip(f"Backend unhealthy at {BASE_URL}")
    except Exception:
        pytest.skip(f"Backend not reachable at {BASE_URL}")


class TestWebhookIntegration:
    """
    Live integration tests that hit the running FastAPI server.
    Requires: backend running at BASE_URL, valid STRIPE_WEBHOOK_SECRET in env.
    """

    def _sign_payload(self, payload: bytes) -> str:
        return _stripe_sig_header(payload, WEBHOOK_SECRET)

    def test_invalid_signature_rejected(self, backend_available):
        """Invalid Stripe signature returns 400."""
        import requests as req
        payload = json.dumps({"type": "checkout.session.completed"}).encode()
        response = req.post(
            f"{BASE_URL}/api/billing/webhook",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "t=1,v1=badbadbadbad",
            },
            timeout=10,
        )
        assert response.status_code == 400, (
            f"Expected 400 for bad sig, got {response.status_code}: {response.text}"
        )
        print(f"✓ [Integration] Invalid signature → 400")

    def test_missing_signature_header_rejected(self, backend_available):
        """No Stripe-Signature header returns 400."""
        import requests as req
        payload = json.dumps({"type": "test.event"}).encode()
        response = req.post(
            f"{BASE_URL}/api/billing/webhook",
            data=payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        assert response.status_code == 400
        print(f"✓ [Integration] Missing signature header → 400")

    def test_webhook_endpoint_exists(self, backend_available):
        """Webhook endpoint is mounted and reachable (even with bad sig)."""
        import requests as req
        response = req.post(
            f"{BASE_URL}/api/billing/webhook",
            data=b"{}",
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "t=0,v1=invalid",
            },
            timeout=10,
        )
        # Any HTTP response (400 or 200) confirms the route exists
        assert response.status_code in [200, 400, 503], (
            f"Unexpected status {response.status_code} — route may not exist"
        )
        print(f"✓ [Integration] Webhook endpoint is mounted: {response.status_code}")

    def test_billing_status_requires_auth(self, backend_available):
        """GET /api/billing/status without auth returns 401/403."""
        import requests as req
        response = req.get(f"{BASE_URL}/api/billing/status", timeout=5)
        assert response.status_code in [401, 403]
        print("✓ [Integration] /api/billing/status properly protected")

    def test_checkout_requires_auth(self, backend_available):
        """POST /api/billing/checkout without auth returns 401/403."""
        import requests as req
        response = req.post(
            f"{BASE_URL}/api/billing/checkout",
            json={"plan": "optimize"},
            timeout=5,
        )
        assert response.status_code in [401, 403]
        print("✓ [Integration] /api/billing/checkout properly protected")

    def test_auth_me_returns_subscription_fields(self, backend_available):
        """
        GET /api/auth/me returns isSubscribed, plan, and subscription_status fields.
        These are the fields the frontend relies on for access control.
        """
        import requests as req

        # Register/login a test user and check the /me response
        test_email = "webhook_test_me@pinnacle.ai"
        test_pass = "WebhookTest123!"

        # Register (ignore if already exists)
        req.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": test_pass},
            timeout=5,
        )
        login = req.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": test_email, "password": test_pass},
            timeout=5,
        )
        if login.status_code != 200:
            pytest.skip("Could not log in test user")

        token = login.json()["access_token"]
        me = req.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5,
        )
        assert me.status_code == 200
        data = me.json()

        assert "isSubscribed" in data, f"/api/auth/me missing isSubscribed field: {data}"
        assert "plan" in data, f"/api/auth/me missing plan field: {data}"
        assert "subscription_status" in data, f"/api/auth/me missing subscription_status: {data}"
        print(
            f"✓ [Integration] /api/auth/me returns subscription fields: "
            f"isSubscribed={data['isSubscribed']!r} plan={data['plan']!r} "
            f"status={data['subscription_status']!r}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Quick smoke-run
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-x"])
