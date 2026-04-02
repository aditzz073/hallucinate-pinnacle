"""Reusable page content fetch service with hybrid fetch->browser fallback."""
import asyncio
import ipaddress
import logging
import re
import socket
import time
from collections import defaultdict, deque
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from modules.aeoEngine.headless_renderer import render_with_timeout

logger = logging.getLogger(__name__)

FETCH_TIMEOUT_SECONDS = 5
BROWSER_TIMEOUT_MS = 15000
CACHE_TTL_SECONDS = 120
MAX_HTML_SIZE = 5 * 1024 * 1024
MIN_HTML_LENGTH = 400
BROWSER_RENDER_LIMIT = 8
BROWSER_WINDOW_SECONDS = 300

BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}

BLOCK_INDICATORS = [
    "checking your browser",
    "cf-browser-verification",
    "cloudflare",
    "captcha",
    "access denied",
    "request blocked",
    "forbidden",
    "bot detection",
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

MIN_MEANINGFUL_HTML_LENGTH = 2000

_html_cache: Dict[str, Dict[str, Any]] = {}
_cache_lock = asyncio.Lock()
_browser_usage: Dict[str, deque] = defaultdict(deque)
_browser_usage_lock = asyncio.Lock()


def _is_private_host(hostname: str) -> bool:
    if hostname in BLOCKED_HOSTNAMES:
        return True

    try:
        ip_str = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_str)
        return ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
    except (socket.gaierror, ValueError):
        return False


def _validate_url(url: str) -> None:
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    if not hostname:
        raise ValueError("Invalid URL: no hostname")
    if _is_private_host(hostname):
        raise ValueError("Private/localhost URLs are not allowed")


def _fetch_headers() -> Dict[str, str]:
    return {
        "User-Agent": USER_AGENTS[0],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }


def _looks_like_empty_shell_or_thin_content(html: str) -> bool:
    html_text = html or ""
    if len(html_text.strip()) < MIN_MEANINGFUL_HTML_LENGTH:
        return True

    shell_patterns = [
        r'<div[^>]+id=["\']root["\'][^>]*>\s*</div>',
        r'<div[^>]+id=["\']__next["\'][^>]*>\s*</div>',
    ]
    lowered = html_text.lower()
    return any(re.search(pattern, lowered, flags=re.IGNORECASE) for pattern in shell_patterns)


def _detect_block_or_incomplete(html: str, status_code: int) -> Dict[str, Any]:
    reasons = []

    html_lower = (html or "").lower()
    if status_code >= 400:
        reasons.append(f"http_{status_code}")

    for indicator in BLOCK_INDICATORS:
        if indicator in html_lower:
            reasons.append(f"blocked:{indicator}")
            break

    if len(html) < MIN_HTML_LENGTH:
        reasons.append("html_too_short")

    if _looks_like_empty_shell_or_thin_content(html):
        reasons.append("client_shell_or_thin_content")

    soup = BeautifulSoup(html, "lxml")
    body = soup.find("body")
    if body is None:
        reasons.append("missing_body")
    else:
        text = body.get_text(" ", strip=True)
        if len(text) < 120:
            reasons.append("body_text_too_short")

    return {
        "blocked": len(reasons) > 0,
        "reasons": reasons,
    }


async def _cache_get(url: str) -> Optional[Dict[str, Any]]:
    now = time.monotonic()
    async with _cache_lock:
        entry = _html_cache.get(url)
        if not entry:
            return None
        if entry["expires_at"] < now:
            _html_cache.pop(url, None)
            return None
        return entry["payload"]


async def _cache_set(url: str, payload: Dict[str, Any]) -> None:
    async with _cache_lock:
        _html_cache[url] = {
            "expires_at": time.monotonic() + CACHE_TTL_SECONDS,
            "payload": payload,
        }


async def _can_use_browser(requester_id: Optional[str]) -> bool:
    key = requester_id or "anonymous"
    now = time.monotonic()

    async with _browser_usage_lock:
        q = _browser_usage[key]
        while q and (now - q[0]) > BROWSER_WINDOW_SECONDS:
            q.popleft()

        if len(q) >= BROWSER_RENDER_LIMIT:
            return False

        q.append(now)
        return True


async def _try_fetch(url: str) -> Dict[str, Any]:
    timeout = httpx.Timeout(FETCH_TIMEOUT_SECONDS)

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, max_redirects=10) as client:
        response = await client.get(url, headers=_fetch_headers())
        html = response.text or ""
        if len(html.encode("utf-8")) > MAX_HTML_SIZE:
            raise ValueError("HTML exceeds 5MB limit")

        detection = _detect_block_or_incomplete(html, response.status_code)
        return {
            "html": html,
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "blocked": detection["blocked"],
            "blocked_reasons": detection["reasons"],
        }


async def fetch_page_content(url: str, requester_id: Optional[str] = None) -> Dict[str, Any]:
    """Fetch page content with fetch-first and browser fallback strategy.

    Unified return shape:
    {
      "html": str,
      "source": "fetch" | "browser",
      "success": bool,
      "error": str | None,
      ...extra metadata
    }
    """
    try:
        _validate_url(url)
    except Exception as e:
        return {"html": "", "source": "fetch", "success": False, "error": str(e)}

    cached = await _cache_get(url)
    if cached:
        logger.info("page_fetch cache hit: %s (source=%s)", url, cached.get("source"))
        return cached

    async def _degraded_fetch_payload(fetch_data: Dict[str, Any], reason: str) -> Optional[Dict[str, Any]]:
        # If initial fetch produced HTML, return it instead of failing hard when browser fallback is unavailable.
        html = fetch_data.get("html", "")
        if not html:
            return None
        if _looks_like_empty_shell_or_thin_content(html):
            return None

        blocked_reasons = list(fetch_data.get("blocked_reasons", []))
        blocked_reasons.append(f"browser_unavailable:{reason}")
        payload = {
            "html": html,
            "source": "fetch",
            "success": True,
            "error": None,
            "status_code": fetch_data.get("status_code", 0),
            "headers": fetch_data.get("headers", {}),
            "blocked_reasons": blocked_reasons,
            "degraded": True,
            "degraded_reason": reason,
        }
        await _cache_set(url, payload)
        logger.warning("Using degraded fetch result for %s (%s)", url, reason)
        return payload

    # Step 1: fast fetch path
    try:
        fetch_result = await _try_fetch(url)
        if not fetch_result["blocked"]:
            payload = {
                "html": fetch_result["html"],
                "source": "fetch",
                "success": True,
                "error": None,
                "status_code": fetch_result["status_code"],
                "headers": fetch_result["headers"],
                "blocked_reasons": [],
            }
            await _cache_set(url, payload)
            logger.info("page_fetch success via fetch: %s status=%s", url, fetch_result["status_code"])
            return payload

        logger.warning(
            "Fetch blocked/incomplete for %s -> fallback to browser (%s)",
            url,
            ",".join(fetch_result["blocked_reasons"]),
        )
    except Exception as fetch_error:
        fetch_result = {
            "html": "",
            "status_code": 0,
            "headers": {},
            "blocked": True,
            "blocked_reasons": [f"fetch_error:{str(fetch_error)}"],
        }
        logger.warning("Fetch failed for %s -> fallback to browser (%s)", url, str(fetch_error))

    # Step 2: browser fallback
    if not await _can_use_browser(requester_id):
        logger.warning("Browser render rate limit exceeded for requester=%s", requester_id or "anonymous")
        degraded = await _degraded_fetch_payload(fetch_result, "rate_limit_exceeded")
        if degraded:
            return degraded

        return {
            "html": "",
            "source": "browser",
            "success": False,
            "error": "Browser render rate limit exceeded",
            "status_code": fetch_result.get("status_code", 0),
            "headers": fetch_result.get("headers", {}),
            "blocked_reasons": fetch_result.get("blocked_reasons", []),
        }

    browser_result = await render_with_timeout(url, max_timeout=BROWSER_TIMEOUT_MS)
    browser_html = browser_result.get("html", "")

    if browser_html and not _looks_like_empty_shell_or_thin_content(browser_html):
        payload = {
            "html": browser_html,
            "source": "browser",
            "success": True,
            "error": None,
            "status_code": fetch_result.get("status_code", 0),
            "headers": fetch_result.get("headers", {}),
            "blocked_reasons": fetch_result.get("blocked_reasons", []),
            "render_time_ms": browser_result.get("render_time_ms", 0),
        }
        await _cache_set(url, payload)
        logger.info("page_fetch success via browser: %s render_time_ms=%s", url, payload.get("render_time_ms", 0))
        return payload

    browser_error = browser_result.get("error") or "browser_render_failed"
    if browser_html and _looks_like_empty_shell_or_thin_content(browser_html):
        browser_error = "rendered_html_is_empty_shell_or_too_thin"

    degraded = await _degraded_fetch_payload(fetch_result, browser_error)
    if degraded:
        return degraded

    logger.error("Unable to fetch content for %s using fetch and browser fallback", url)
    return {
        "html": "",
        "source": "browser",
        "success": False,
        "error": f"Unable to fetch content ({browser_error})",
        "status_code": fetch_result.get("status_code", 0),
        "headers": fetch_result.get("headers", {}),
        "blocked_reasons": fetch_result.get("blocked_reasons", []),
    }
