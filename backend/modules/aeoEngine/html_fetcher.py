"""Secure HTML Fetcher - Phase 1 Step 1"""
import httpx
import ipaddress
import socket
import random
from urllib.parse import urlparse

MAX_HTML_SIZE = 5 * 1024 * 1024  # 5MB
FETCH_TIMEOUT = 25

BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}

# Realistic browser User-Agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
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
    """Generate realistic browser headers"""
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


def _fetch_with_curl_cffi(url: str) -> str:
    """
    Fetch using curl_cffi which has proper TLS fingerprinting
    to bypass Cloudflare and similar anti-bot systems
    """
    from curl_cffi import requests as curl_requests
    
    # Impersonate Chrome browser for proper TLS fingerprint
    response = curl_requests.get(
        url,
        impersonate="chrome120",
        timeout=FETCH_TIMEOUT,
        allow_redirects=True,
    )
    response.raise_for_status()
    return response.text


def _fetch_with_cloudscraper(url: str) -> str:
    """Fallback fetcher using cloudscraper for Cloudflare-protected sites"""
    import cloudscraper
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
    html = None
    last_error = None

    # Method 1: Try curl_cffi first (best TLS fingerprinting)
    try:
        html = _fetch_with_curl_cffi(url)
    except Exception as e:
        last_error = e

    # Method 2: Try cloudscraper if curl_cffi fails
    if html is None:
        try:
            html = _fetch_with_cloudscraper(url)
        except Exception as e:
            last_error = e

    # Method 3: Try httpx as last resort
    if html is None:
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(FETCH_TIMEOUT),
                follow_redirects=True,
                max_redirects=10,
                http2=True,
            ) as client:
                response = await client.get(url, headers=_get_browser_headers())
                response.raise_for_status()
                html = response.text
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise ValueError(
                    f"Access denied (403 Forbidden). The website '{hostname}' "
                    "has strong anti-bot protection. This commonly happens with "
                    "e-commerce sites using Cloudflare or similar services. "
                    "Try the site's main homepage or a different page."
                )
            elif e.response.status_code == 404:
                raise ValueError("Page not found (404). The URL may be incorrect.")
            elif e.response.status_code >= 500:
                raise ValueError(f"Server error ({e.response.status_code}).")
            raise ValueError(f"HTTP error {e.response.status_code}.")
        except httpx.TimeoutException:
            raise ValueError("Request timed out.")
        except httpx.ConnectError:
            raise ValueError("Could not connect to the website.")
        except Exception as e:
            # All methods failed
            if "403" in str(last_error) or "forbidden" in str(last_error).lower():
                raise ValueError(
                    f"Access denied. The website '{hostname}' has anti-bot protection "
                    "that we couldn't bypass. Try the site's homepage instead."
                )
            raise ValueError(f"Failed to fetch page: {str(last_error)[:200]}")

    if html is None:
        raise ValueError(f"Failed to fetch the page after multiple attempts.")

    # Validate content
    if not html.strip():
        raise ValueError("Empty response received from the website.")
        
    html_lower = html[:500].lower()
    if not any(tag in html_lower for tag in ['<html', '<!doctype', '<head', '<body', '<div']):
        raise ValueError("The response doesn't appear to be an HTML page.")

    if len(html.encode("utf-8")) > MAX_HTML_SIZE:
        raise ValueError("HTML exceeds 5MB limit")

    return html
