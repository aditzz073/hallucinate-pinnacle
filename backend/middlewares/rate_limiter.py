"""Rate Limiter Middleware - Phase 8
Per-IP + per-user rate limiting using in-memory store."""
import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

# Config
RATE_LIMIT_IP_REQUESTS = 200   # per window — generous for dev
RATE_LIMIT_USER_REQUESTS = 120  # per window
RATE_LIMIT_WINDOW = 60  # seconds

# Routes exempt from the per-USER bucket (still checked by per-IP bucket).
# These are lightweight, read-only, and polled frequently by the frontend.
USER_BUCKET_EXEMPT_PATHS = {
    "/api/auth/me",
    "/api/billing/status",
    "/api/health",
}


class _TokenBucket:
    def __init__(self, capacity: int, window: int):
        self.capacity = capacity
        self.window = window
        self.tokens = capacity
        self.last_refill = time.time()

    def consume(self) -> bool:
        now = time.time()
        elapsed = now - self.last_refill
        if elapsed >= self.window:
            self.tokens = self.capacity
            self.last_refill = now
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False

    @property
    def remaining(self):
        return max(0, self.tokens)


_ip_buckets = defaultdict(lambda: _TokenBucket(RATE_LIMIT_IP_REQUESTS, RATE_LIMIT_WINDOW))
_user_buckets = defaultdict(lambda: _TokenBucket(RATE_LIMIT_USER_REQUESTS, RATE_LIMIT_WINDOW))


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip health endpoint
        if request.url.path == "/api/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        ip_bucket = _ip_buckets[client_ip]

        if not ip_bucket.consume():
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
            )

        # Check user-level rate limit if auth header present.
        # Exempt lightweight polling endpoints — they are already IP-protected.
        auth = request.headers.get("authorization", "")
        if auth.startswith("Bearer ") and request.url.path not in USER_BUCKET_EXEMPT_PATHS:
            token_hash = hash(auth[7:30])  # partial hash for bucketing
            user_bucket = _user_buckets[str(token_hash)]
            if not user_bucket.consume():
                raise HTTPException(
                    status_code=429,
                    detail="User rate limit exceeded. Please try again later.",
                )

        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(ip_bucket.remaining)
        return response
