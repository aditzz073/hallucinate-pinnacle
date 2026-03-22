"""Legacy HTML fetch compatibility wrapper.

Prefer using modules.aeoEngine.page_fetch_service.fetch_page_content directly.
"""

from modules.aeoEngine.page_fetch_service import fetch_page_content


async def fetch_html(url: str, requester_id: str = None) -> str:
    """Fetch HTML content and return plain HTML string for legacy callers."""
    result = await fetch_page_content(url, requester_id=requester_id)
    if not result.get("success"):
        raise ValueError(result.get("error") or "Unable to fetch content")
    return result.get("html", "")
