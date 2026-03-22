"""Backward-compatible wrapper around the unified page fetch service."""
import logging
from typing import Dict

from modules.aeoEngine.content_detector import get_content_stats
from modules.aeoEngine.page_fetch_service import fetch_page_content

logger = logging.getLogger(__name__)


async def fetch_html_hybrid(url: str) -> Dict:
    """Return legacy metadata format backed by the new unified fetch service."""
    unified = await fetch_page_content(url)
    if not unified.get("success"):
        raise Exception(unified.get("error") or "Unable to fetch content")

    html = unified.get("html", "")
    source = unified.get("source", "fetch")

    return {
        "html": html,
        "used_headless": source == "browser",
        "fallback_used": source == "browser",
        "render_time_ms": int(unified.get("render_time_ms", 0) or 0),
        "content_stats": get_content_stats(html),
        "method": "headless" if source == "browser" else "raw",
        "source": source,
        "success": unified.get("success", False),
        "status_code": unified.get("status_code", 0),
        "headers": unified.get("headers", {}),
        "blocked_reasons": unified.get("blocked_reasons", []),
    }
