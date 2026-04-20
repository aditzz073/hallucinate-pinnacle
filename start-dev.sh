#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Pinnacle AI — Dev startup script
# Starts backend (port 8000) + Stripe webhook listener
# Usage: ./start-dev.sh
# ─────────────────────────────────────────────────────────────

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
VENV_DIR="$ROOT/.venv"
STRIPE_BIN="$HOME/bin/stripe"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║      Pinnacle AI — Dev Environment       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Activate venv ──────────────────────────────────────────
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
    echo "✓ Virtualenv activated"
else
    echo "✗ No .venv found at $VENV_DIR — run: python3 -m venv .venv && pip install -r backend/requirements.txt"
    exit 1
fi

# ── 2. Load .env to get stripe secret ─────────────────────────
if [ -f "$BACKEND_DIR/.env" ]; then
    set -o allexport
    source "$BACKEND_DIR/.env"
    set +o allexport
    echo "✓ .env loaded"
fi

# ── 3. Start backend on port 8000 ─────────────────────────────
echo ""
echo "→ Starting FastAPI backend on :8000 ..."
cd "$BACKEND_DIR"
uvicorn server:app --reload --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!
echo "  PID: $BACKEND_PID"

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in $(seq 1 20); do
    sleep 0.5
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo " ✓ Ready"
        break
    fi
    echo -n "."
done

# ── 4. Start Stripe listener forwarding to :8000 ──────────────
echo ""
echo "→ Starting Stripe webhook listener → localhost:8000/api/billing/webhook ..."
if [ -f "$STRIPE_BIN" ]; then
    "$STRIPE_BIN" listen --forward-to localhost:8000/api/billing/webhook &
    STRIPE_PID=$!
    echo "  PID: $STRIPE_PID"
    sleep 3
    echo "  ✓ Stripe listener started"
else
    echo "  ✗ Stripe CLI not found at $STRIPE_BIN"
    echo "    Run: curl -sL https://github.com/stripe/stripe-cli/releases/download/v1.40.6/stripe_1.40.6_mac-os_arm64.tar.gz | tar xz -C ~/bin/"
fi

# ── 5. Summary ────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "  Backend  : http://localhost:8000"
echo "  Webhook  : POST /api/billing/webhook"
echo "  Health   : http://localhost:8000/api/health"
echo "══════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# ── 6. Wait for Ctrl+C, kill all on exit ─────────────────────
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $STRIPE_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID
