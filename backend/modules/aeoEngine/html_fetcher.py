"""Secure HTML Fetcher - Phase 1 Step 1"""
import httpx
import ipaddress
import socket
import random
from urllib.parse import urlparse

MAX_HTML_SIZE = 5 * 1024 * 1024  # 5MB
FETCH_TIMEOUT = 15

BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}

# Realistic browser User-Agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]


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


def _get_browser_headers() -> dict:
    """Generate realistic browser headers to avoid 403 blocks"""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }


async def fetch_html(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")

    if _is_private_url(url):
        raise ValueError("Private/localhost URLs are not allowed")

    # Strip tracking parameters that may cause issues
    clean_url = url.split("?utm_")[0] if "?utm_" in url else url
    if "&utm_" in clean_url:
        clean_url = clean_url.split("&utm_")[0]

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(FETCH_TIMEOUT),
        follow_redirects=True,
        max_redirects=10,
        http2=True,
    ) as client:
        try:
            response = await client.get(
                url,  # Use original URL to preserve any needed params
                headers=_get_browser_headers(),
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise ValueError(
                    f"Access denied (403 Forbidden). The website '{urlparse(url).netloc}' "
                    "is blocking automated requests. This commonly happens with e-commerce sites. "
                    "Try a different URL or the site's main page instead."
                )
            elif e.response.status_code == 404:
                raise ValueError(f"Page not found (404). The URL may be incorrect or the page has been moved.")
            elif e.response.status_code >= 500:
                raise ValueError(f"Server error ({e.response.status_code}). The website may be experiencing issues.")
            raise
        except httpx.TimeoutException:
            raise ValueError(f"Request timed out. The website took too long to respond.")
        except httpx.ConnectError:
            raise ValueError(f"Could not connect to the website. Please check the URL.")

        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type and "xhtml" not in content_type:
            # Be more lenient - some sites don't set proper content-type
            if not response.text.strip().startswith(("<", "<!DOCTYPE")):
                raise ValueError(f"Not an HTML page: {content_type}")

        html = response.text
        if len(html.encode("utf-8")) > MAX_HTML_SIZE:
            raise ValueError("HTML exceeds 5MB limit")

        return html
