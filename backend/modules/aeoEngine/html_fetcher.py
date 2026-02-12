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


def _is_cloudflare_challenge(html: str) -> bool:
    """Check if the response is a Cloudflare challenge page"""
    indicators = [
        "just a moment",
        "checking your browser",
        "cloudflare",
        "cf-browser-verification",
        "cf_chl_opt",
        "challenge-platform",
        "ray id:",
    ]
    html_lower = html.lower()
    return any(ind in html_lower for ind in indicators)


def _fetch_with_curl_cffi(url: str) -> str:
    """
    Fetch using curl_cffi which has proper TLS fingerprinting
    to bypass some anti-bot systems
    """
    from curl_cffi import requests as curl_requests
    
    response = curl_requests.get(
        url,
        impersonate="chrome120",
        timeout=FETCH_TIMEOUT,
        allow_redirects=True,
    )
    
    # Check for Cloudflare challenge even on 200 status
    if _is_cloudflare_challenge(response.text):
        raise ValueError("Cloudflare challenge detected")
    
    response.raise_for_status()
    return response.text


def _fetch_with_cloudscraper(url: str) -> str:
    """Fallback fetcher using cloudscraper"""
    import cloudscraper
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'mobile': False
        }
    )
    response = scraper.get(url, timeout=FETCH_TIMEOUT)
    
    if _is_cloudflare_challenge(response.text):
        raise ValueError("Cloudflare challenge detected")
    
    response.raise_for_status()
    return response.text


async def fetch_html(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")

    if _is_private_url(url):
        raise ValueError("Private/localhost URLs are not allowed")

    hostname = urlparse(url).netloc
    html = None
    errors = []

    # Method 1: Try curl_cffi first (best TLS fingerprinting)
    try:
        html = _fetch_with_curl_cffi(url)
    except Exception as e:
        errors.append(f"curl_cffi: {str(e)[:100]}")

    # Method 2: Try cloudscraper if curl_cffi fails
    if html is None:
        try:
            html = _fetch_with_cloudscraper(url)
        except Exception as e:
            errors.append(f"cloudscraper: {str(e)[:100]}")

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
                
                if _is_cloudflare_challenge(response.text):
                    raise ValueError("Cloudflare challenge detected")
                    
                response.raise_for_status()
                html = response.text
        except httpx.HTTPStatusError as e:
            errors.append(f"httpx: HTTP {e.response.status_code}")
        except Exception as e:
            errors.append(f"httpx: {str(e)[:100]}")

    # All methods failed
    if html is None:
        # Determine the type of failure
        if any("cloudflare" in err.lower() or "challenge" in err.lower() for err in errors):
            raise ValueError(
                f"This website ({hostname}) uses Cloudflare protection that requires "
                "JavaScript execution. Unfortunately, we can't analyze pages with "
                "active Cloudflare challenges. Try one of these alternatives:\n"
                "• Use the site's main homepage instead of a product page\n"
                "• Try a different page on the same site\n"
                "• Use a site without aggressive bot protection"
            )
        elif any("403" in err or "forbidden" in err.lower() for err in errors):
            raise ValueError(
                f"Access denied (403). The website '{hostname}' is blocking our requests. "
                "This is common with e-commerce sites. Try the main homepage instead."
            )
        elif any("404" in err for err in errors):
            raise ValueError("Page not found (404). Please check the URL.")
        elif any("timeout" in err.lower() for err in errors):
            raise ValueError("Request timed out. The website is too slow to respond.")
        else:
            raise ValueError(f"Failed to fetch page. Errors: {'; '.join(errors)}")

    # Validate content
    if not html.strip():
        raise ValueError("Empty response received from the website.")
        
    html_lower = html[:500].lower()
    if not any(tag in html_lower for tag in ['<html', '<!doctype', '<head', '<body', '<div']):
        raise ValueError("The response doesn't appear to be an HTML page.")

    if len(html.encode("utf-8")) > MAX_HTML_SIZE:
        raise ValueError("HTML exceeds 5MB limit")

    return html
