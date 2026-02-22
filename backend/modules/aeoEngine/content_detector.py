"""Content Sufficiency Detector - Determines if headless rendering is needed"""
import re
from bs4 import BeautifulSoup


# Configurable thresholds
MIN_TEXT_LENGTH = 800  # characters
MIN_WORD_COUNT = 100
MIN_PARAGRAPH_COUNT = 3


def is_content_insufficient(html: str) -> bool:
    """
    Detect if raw HTML has insufficient content and needs headless rendering.
    
    Returns True if ANY of these conditions are met:
    - Visible body text < 800 characters
    - No H1 detected
    - Only root container detected (SPA placeholder)
    - No meaningful paragraph tags
    - Suspiciously low word count
    - High JS bundle presence but minimal content
    """
    soup = BeautifulSoup(html, "lxml")
    
    # Check 1: Extract visible text
    body = soup.find("body")
    if not body:
        return True  # No body tag - likely needs rendering
    
    # Remove script and style elements
    for script_or_style in body(["script", "style", "noscript"]):
        script_or_style.decompose()
    
    body_text = body.get_text(separator=" ", strip=True)
    text_length = len(body_text)
    
    # Check 2: Text length threshold
    if text_length < MIN_TEXT_LENGTH:
        return True
    
    # Check 3: Word count
    words = re.findall(r"\b\w+\b", body_text)
    if len(words) < MIN_WORD_COUNT:
        return True
    
    # Check 4: H1 presence
    h1_tags = soup.find_all("h1")
    if not h1_tags:
        return True
    
    # Check 5: SPA placeholder detection (common patterns)
    root_containers = soup.find_all(["div", "main"], id=re.compile(r"^(root|app|__next|gatsby)$", re.I))
    if root_containers:
        # Check if root container is mostly empty
        for container in root_containers:
            container_text = container.get_text(strip=True)
            if len(container_text) < 200:  # Root container with < 200 chars = likely SPA
                return True
    
    # Check 6: Paragraph count
    paragraphs = soup.find_all("p")
    meaningful_paragraphs = [p for p in paragraphs if len(p.get_text(strip=True)) > 20]
    if len(meaningful_paragraphs) < MIN_PARAGRAPH_COUNT:
        return True
    
    # Check 7: High JS bundle presence with low content ratio
    script_tags = soup.find_all("script", src=True)
    js_bundle_keywords = ["bundle", "chunk", "vendor", "webpack", "next", "react", "vue", "angular"]
    has_js_bundles = any(
        any(keyword in script.get("src", "").lower() for keyword in js_bundle_keywords)
        for script in script_tags
    )
    
    if has_js_bundles and text_length < 1500:
        # High JS presence but low content suggests client-side rendering
        return True
    
    # Check 8: Placeholder content detection
    placeholder_phrases = [
        "loading...",
        "please wait",
        "enabling javascript",
        "turn on javascript",
        "javascript is required",
        "javascript disabled",
    ]
    body_text_lower = body_text.lower()
    if any(phrase in body_text_lower for phrase in placeholder_phrases) and text_length < 1000:
        return True
    
    # All checks passed - content is sufficient
    return False


def get_content_stats(html: str) -> dict:
    """
    Extract content statistics for debugging/logging.
    """
    soup = BeautifulSoup(html, "lxml")
    body = soup.find("body")
    
    if not body:
        return {
            "text_length": 0,
            "word_count": 0,
            "h1_count": 0,
            "paragraph_count": 0,
            "has_root_container": False,
        }
    
    # Remove script and style
    for script_or_style in body(["script", "style", "noscript"]):
        script_or_style.decompose()
    
    body_text = body.get_text(separator=" ", strip=True)
    words = re.findall(r"\b\w+\b", body_text)
    
    h1_count = len(soup.find_all("h1"))
    paragraph_count = len([p for p in soup.find_all("p") if len(p.get_text(strip=True)) > 20])
    
    root_containers = soup.find_all(["div", "main"], id=re.compile(r"^(root|app|__next|gatsby)$", re.I))
    has_root_container = bool(root_containers)
    
    return {
        "text_length": len(body_text),
        "word_count": len(words),
        "h1_count": h1_count,
        "paragraph_count": paragraph_count,
        "has_root_container": has_root_container,
    }
