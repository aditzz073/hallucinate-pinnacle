"""Input validators for AI Testing Lab."""
import re
from urllib.parse import urlparse


def validate_ai_test_input(url: str, query: str) -> list:
    """Returns a list of validation error strings."""
    errors = []

    if not url or not url.strip():
        errors.append("URL is required")
    elif not _is_valid_url(url):
        errors.append("URL must be a valid http/https URL")

    q = query.strip() if query else ""
    if not q:
        errors.append("Query is required")
    elif len(q) < 3:
        errors.append("Query must be at least 3 characters")
    elif len(q) > 200:
        errors.append("Query must be under 200 characters")

    return errors


def sanitize_query(query: str) -> str:
    """Strip dangerous characters from a query string."""
    q = query.strip()
    q = re.sub(r"[<>\"'&;]", "", q)
    return q[:200]


def normalize_url(url: str) -> str:
    """Ensure URL has a valid scheme."""
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def _is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False
