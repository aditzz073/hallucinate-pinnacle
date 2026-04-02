"""Headless Browser Renderer with Security Controls - Fallback for JS-heavy sites"""
import asyncio
import ipaddress
import socket
import logging
from urllib.parse import urlparse
from typing import Optional
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

logger = logging.getLogger(__name__)

# Security Configuration
BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}
PRIVATE_IP_RANGES = [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "169.254.0.0/16",  # AWS metadata
    "127.0.0.0/8",
    "::1/128",
    "fc00::/7",
    "fe80::/10",
]

# Performance Configuration
MAX_NAVIGATION_TIMEOUT = 30000  # 30 seconds
MAX_TOTAL_TIMEOUT = 45000       # 45 seconds
NETWORK_IDLE_TIMEOUT = 5000     # 5 seconds for network idle
CONCURRENT_LIMIT = 5            # Max concurrent browsers
REACT_SETTLE_TIMEOUT_MS = 2500
REACT_ROOT_TIMEOUT_MS = 10000

# Global semaphore for concurrency control
_browser_semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)


def _is_private_ip(hostname: str) -> bool:
    """Check if hostname resolves to private IP address"""
    if hostname in BLOCKED_HOSTNAMES:
        return True
    
    try:
        # Resolve hostname to IP
        ip_str = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_str)
        
        # Check if IP is private
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
            return True
        
        # Check against specific private ranges
        for cidr in PRIVATE_IP_RANGES:
            if ip_obj in ipaddress.ip_network(cidr):
                return True
        
        return False
    except (socket.gaierror, ValueError):
        # Can't resolve - allow it to fail naturally in browser
        return False


def _validate_url_security(url: str) -> None:
    """Validate URL for SSRF protection"""
    if not url.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")
    
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    
    if not hostname:
        raise ValueError("Invalid URL: no hostname")
    
    # Check hostname directly
    if hostname.lower() in BLOCKED_HOSTNAMES:
        raise ValueError("Access to localhost/private URLs is blocked")
    
    # Resolve and check IP
    if _is_private_ip(hostname):
        raise ValueError("Access to private/internal IP addresses is blocked for security")


async def render_with_headless(url: str, timeout: int = MAX_TOTAL_TIMEOUT) -> dict:
    """
    Render page using headless browser with strict security controls.
    
    Returns:
        {
            "html": str,
            "used_headless": True,
            "fallback_used": bool,
            "render_time_ms": int,
            "error": Optional[str]
        }
    """
    import time
    start_time = time.time()
    
    result = {
        "html": "",
        "used_headless": True,
        "fallback_used": False,
        "render_time_ms": 0,
        "error": None,
    }
    
    # Security validation
    try:
        _validate_url_security(url)
    except ValueError as e:
        logger.warning(f"Headless render blocked for security: {url} - {str(e)}")
        result["error"] = f"Security validation failed: {str(e)}"
        result["fallback_used"] = True
        return result
    
    # Acquire semaphore for concurrency control
    async with _browser_semaphore:
        browser = None
        try:
            async with async_playwright() as p:
                # Launch browser with security options
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-accelerated-2d-canvas",
                        "--disable-gpu",
                        "--disable-web-security",  # For CORS issues
                        "--disable-features=IsolateOrigins,site-per-process",
                        "--disable-blink-features=AutomationControlled",
                    ],
                )
                
                # Create context with security settings
                context = await browser.new_context(
                    viewport={"width": 1280, "height": 720},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    ignore_https_errors=True,  # Allow self-signed certs
                    java_script_enabled=True,
                )
                
                # Disable unnecessary features
                await context.add_init_script("""
                    // Hide webdriver property
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => false
                    });
                """)
                
                page = await context.new_page()

                # Present a realistic browser header profile before navigation.
                await page.set_extra_http_headers(
                    {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                )
                
                # Block unnecessary resources for performance
                await page.route("**/*", lambda route: (
                    route.abort() if route.request.resource_type in [
                        "image", "media", "font", "stylesheet", "websocket"
                    ] else route.continue_()
                ))
                
                # Disable file downloads, popups, dialogs
                page.on("dialog", lambda dialog: dialog.dismiss())
                page.on("download", lambda download: download.cancel())
                
                # Navigate to page with timeout
                try:
                    await page.goto(
                        url,
                        wait_until="networkidle",
                        timeout=MAX_NAVIGATION_TIMEOUT,
                    )

                    # Give client-side apps additional time to hydrate after network settles.
                    await page.wait_for_timeout(REACT_SETTLE_TIMEOUT_MS)

                    # For React/Next apps, wait for mounted root children when available.
                    try:
                        await page.wait_for_selector("#root > *, #__next > *", timeout=REACT_ROOT_TIMEOUT_MS)
                    except PlaywrightTimeout:
                        logger.info("Root selector not found for %s, continuing with captured DOM", url)
                    
                    # Extract rendered HTML
                    html = await page.content()
                    result["html"] = html
                    
                except PlaywrightTimeout:
                    logger.error(f"Timeout rendering {url}")
                    result["error"] = "Page load timeout exceeded"
                    result["fallback_used"] = True
                
                except Exception as e:
                    logger.error(f"Error during page navigation for {url}: {str(e)}")
                    result["error"] = f"Navigation failed: {str(e)}"
                    result["fallback_used"] = True
                
                finally:
                    # Always close page and context
                    await page.close()
                    await context.close()
        
        except Exception as e:
            logger.error(f"Browser launch failed for {url}: {str(e)}")
            result["error"] = f"Browser error: {str(e)}"
            result["fallback_used"] = True
        
        finally:
            # Always close browser
            if browser:
                try:
                    await browser.close()
                except:
                    pass
    
    # Calculate render time
    result["render_time_ms"] = int((time.time() - start_time) * 1000)
    
    return result


async def render_with_timeout(url: str, max_timeout: int = MAX_TOTAL_TIMEOUT) -> dict:
    """
    Wrapper with absolute timeout to prevent runaway processes.
    """
    try:
        return await asyncio.wait_for(
            render_with_headless(url, timeout=max_timeout),
            timeout=max_timeout / 1000,  # Convert to seconds
        )
    except asyncio.TimeoutError:
        logger.error(f"Absolute timeout exceeded for {url}")
        return {
            "html": "",
            "used_headless": True,
            "fallback_used": True,
            "render_time_ms": max_timeout,
            "error": "Absolute timeout exceeded",
        }
