"""Secure HTML Fetcher - Phase 1 Step 1"""
import httpx
import ipaddress
import socket
from urllib.parse import urlparse

MAX_HTML_SIZE = 5 * 1024 * 1024  # 5MB
FETCH_TIMEOUT = 10

BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}


def _is_private_url(url: str) -> bool:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    if hostname in BLOCKED_HOSTNAMES:
        return True
    try:
        ip_str = socket.gethostbyname(hostname)
        return ipaddress.ip_address(ip_str).is_private
    except (socket.gaierror, ValueError):
        return False


async def fetch_html(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")

    if _is_private_url(url):
        raise ValueError("Private/localhost URLs are not allowed")

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(FETCH_TIMEOUT),
        follow_redirects=True,
        max_redirects=5,
    ) as client:
        response = await client.get(
            url,
            headers={
                "User-Agent": "AEO-Copilot/1.0 (Web Auditor)",
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type and "xhtml" not in content_type:
            raise ValueError(f"Not an HTML page: {content_type}")

        html = response.text
        if len(html.encode("utf-8")) > MAX_HTML_SIZE:
            raise ValueError("HTML exceeds 5MB limit")

        return html
