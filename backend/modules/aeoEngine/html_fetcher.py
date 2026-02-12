"""Secure HTML Fetcher - Phase 1 Step 1"""
import httpx
import ipaddress
import socket
import random
from urllib.parse import urlparse
import cloudscraper

MAX_HTML_SIZE = 5 * 1024 * 1024  # 5MB
FETCH_TIMEOUT = 20

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


def _fetch_with_cloudscraper(url: str) -> str:
    """Fallback fetcher using cloudscraper for Cloudflare-protected sites"""
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'mobile': False
        }
    )
    response = scraper.get(url, timeout=FETCH_TIMEOUT)
    response.raise_for_status()
    return response.text


async def fetch_html(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")

    if _is_private_url(url):
        raise ValueError("Private/localhost URLs are not allowed")

    hostname = urlparse(url).netloc

    # First try with httpx (faster, async)
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(FETCH_TIMEOUT),
            follow_redirects=True,
            max_redirects=10,
            http2=True,
        ) as client:
            response = await client.get(
                url,
                headers=_get_browser_headers(),
            )
            response.raise_for_status()
            html = response.text
            
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            # Try cloudscraper as fallback for Cloudflare-protected sites
            try:
                html = _fetch_with_cloudscraper(url)
            except Exception as cf_error:
                raise ValueError(
                    f"Access denied (403 Forbidden). The website '{hostname}' "
                    "has strong anti-bot protection that we couldn't bypass. "
                    "This commonly happens with e-commerce sites using Cloudflare. "
                    "Try the site's main homepage or a different page."
                )
        elif e.response.status_code == 404:
            raise ValueError(f"Page not found (404). The URL may be incorrect or the page has been moved.")
        elif e.response.status_code >= 500:
            raise ValueError(f"Server error ({e.response.status_code}). The website may be experiencing issues.")
        else:
            raise ValueError(f"HTTP error {e.response.status_code} when fetching the page.")
            
    except httpx.TimeoutException:
        # Also try cloudscraper on timeout (sometimes sites detect httpx)
        try:
            html = _fetch_with_cloudscraper(url)
        except Exception:
            raise ValueError(f"Request timed out. The website took too long to respond.")
            
    except httpx.ConnectError:
        raise ValueError(f"Could not connect to the website. Please check the URL.")

    # Validate content type loosely
    if not html.strip():
        raise ValueError("Empty response received from the website.")
        
    # Check if it looks like HTML
    html_lower = html[:500].lower()
    if not any(tag in html_lower for tag in ['<html', '<!doctype', '<head', '<body', '<div']):
        raise ValueError("The response doesn't appear to be an HTML page.")

    if len(html.encode("utf-8")) > MAX_HTML_SIZE:
        raise ValueError("HTML exceeds 5MB limit")

    return html
