"""Input Validation Middleware - Phase 8
URL sanitization and standardized error responses."""
import re
import ipaddress
import socket
from urllib.parse import urlparse
from pydantic import BaseModel
from fastapi import HTTPException


BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", ""}
MAX_URL_LENGTH = 2048


def validate_url(url: str) -> str:
    """Validate and sanitize URL input."""
    if not url or not url.strip():
        raise HTTPException(status_code=400, detail="URL is required")

    url = url.strip()

    if len(url) > MAX_URL_LENGTH:
        raise HTTPException(status_code=400, detail=f"URL exceeds maximum length of {MAX_URL_LENGTH}")

    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    if hostname in BLOCKED_HOSTNAMES:
        raise HTTPException(status_code=400, detail="Private/localhost URLs are not allowed")

    # Check for private IP ranges
    try:
        ip_str = socket.gethostbyname(hostname)
        if ipaddress.ip_address(ip_str).is_private:
            raise HTTPException(status_code=400, detail="Private IP addresses are not allowed")
    except socket.gaierror:
        pass  # DNS resolution failed, will be caught by fetch

    # Basic XSS prevention
    if re.search(r"[<>\"']", url):
        raise HTTPException(status_code=400, detail="URL contains invalid characters")

    return url


def validate_query(query: str) -> str:
    """Validate search query input."""
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query is required")

    query = query.strip()

    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Query exceeds maximum length of 500 characters")

    return query


class StandardError(BaseModel):
    detail: str
    error_code: str = "UNKNOWN"
    timestamp: str = ""
