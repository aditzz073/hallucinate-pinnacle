"""AEO Signal Analyzer for AI Testing Lab — calculates 8 core signals from parsed HTML."""
from datetime import datetime


def calculate_structure_signal(parsed: dict) -> int:
    score = 0
    headings = parsed.get("headings", {})
    h1 = headings.get("h1", [])
    h2 = headings.get("h2", [])
    h3 = headings.get("h3", [])
    title = parsed.get("title", "")

    # Title present: +5; optimal 40-65 chars: +15
    if title:
        score += 5
        if 40 <= len(title) <= 65:
            score += 15

    # H1: +20
    if h1:
        score += 20

    # H2 ≥ 2: +20
    if len(h2) >= 2:
        score += 20

    # Heading hierarchy (H1 → H2 → H3): +15 full, +8 partial
    if h1 and h2 and h3:
        score += 15
    elif h1 and h2:
        score += 8

    # Lists (approximated via FAQ items or list-type schema): +15
    schema_types_lower = [t.lower() for t in parsed.get("schema_types", [])]
    faq_count = len(parsed.get("faq_items", []))
    if "itemlist" in schema_types_lower or "howto" in schema_types_lower or faq_count >= 2:
        score += 15
    elif len(h2) >= 3:
        score += 8

    return max(0, min(100, score))


def calculate_trust_signal(parsed: dict) -> int:
    score = 0

    # Author present: +25
    if parsed.get("author"):
        score += 25

    # Organization schema: +20
    if parsed.get("has_organization_schema", False):
        score += 20

    # Contact info: +15
    if parsed.get("has_contact_info", False):
        score += 15

    # External links: +20 (≥3), +10 (≥1)
    ext = parsed.get("external_links", 0)
    if ext >= 3:
        score += 20
    elif ext >= 1:
        score += 10

    # Author schema JSON-LD: +15
    for block in parsed.get("schema_blocks", []):
        if isinstance(block, dict):
            if block.get("@type") == "Person" or isinstance(block.get("author"), dict):
                score += 15
                break

    # Credentials/bio text: +5
    body_lower = parsed.get("body_text", "").lower()
    if any(c in body_lower for c in ["expert", "phd", "professor", "certified", "specialist"]):
        score += 5

    return max(0, min(100, score))


def calculate_schema_signal(parsed: dict) -> int:
    score = 0
    schema_blocks = parsed.get("schema_blocks", [])
    schema_types = parsed.get("schema_types", [])

    # Has JSON-LD: +30
    if schema_blocks:
        score += 30

    # Open Graph tags: +20
    if parsed.get("og_tags"):
        score += 20

    # Twitter card: +15
    if parsed.get("twitter_tags"):
        score += 15

    # Schema type count: ≥3 → +20, ≥1 → +10
    if len(schema_types) >= 3:
        score += 20
    elif len(schema_types) >= 1:
        score += 10

    # FAQ schema: +15
    if any(t.lower() == "faqpage" for t in schema_types):
        score += 15

    return max(0, min(100, score))


def calculate_citation_signal(parsed: dict) -> int:
    # Scale: 0 ext links = 0; 10+ = 100
    ext = parsed.get("external_links", 0)
    return min(100, int(ext / 10 * 100))


def calculate_content_signal(parsed: dict) -> int:
    score = 0
    wc = parsed.get("word_count", 0)
    headings = parsed.get("headings", {})

    # Word count
    if wc >= 1500:
        score += 40
    elif wc >= 800:
        score += 30
    elif wc >= 400:
        score += 20
    elif wc >= 200:
        score += 10

    # Has body text: +20
    if parsed.get("body_text"):
        score += 20

    # Heading diversity (h2 + h3): ≥5 → +30, ≥2 → +15, ≥1 → +5
    h2_count = len(headings.get("h2", []))
    h3_count = len(headings.get("h3", []))
    heading_variety = h2_count + h3_count
    if heading_variety >= 5:
        score += 30
    elif heading_variety >= 2:
        score += 15
    elif heading_variety >= 1:
        score += 5

    # Multiple heading levels: +10
    levels = sum([
        len(headings.get("h1", [])) > 0,
        h2_count > 0,
        h3_count > 0,
        len(headings.get("h4", [])) > 0,
    ])
    if levels >= 3:
        score += 10

    return max(0, min(100, score))


def calculate_freshness_signal(parsed: dict) -> int:
    score = 0
    date_str = None

    # Check schema blocks for dateModified / datePublished
    for block in parsed.get("schema_blocks", []):
        if isinstance(block, dict):
            date_str = block.get("dateModified") or block.get("datePublished")
            if date_str:
                break
            for item in block.get("@graph", []):
                if isinstance(item, dict):
                    date_str = item.get("dateModified") or item.get("datePublished")
                    if date_str:
                        break
        if date_str:
            break

    # Fallback: OpenGraph article dates
    if not date_str:
        og = parsed.get("og_tags", {})
        date_str = og.get("article:modified_time") or og.get("article:published_time")

    if date_str:
        score += 50  # date present
        try:
            pub_date = datetime.strptime(str(date_str)[:10], "%Y-%m-%d")
            days_old = (datetime.now() - pub_date).days
            if days_old <= 180:
                score += 50
            elif days_old <= 365:
                score += 30
            elif days_old <= 730:
                score += 10
        except (ValueError, TypeError):
            pass

    return max(0, min(100, score))


def calculate_media_signal(parsed: dict) -> int:
    score = 0
    images_total = parsed.get("images_total", 0)
    images_with_alt = parsed.get("images_with_alt", 0)

    # Images with alt text: +40
    if images_with_alt > 0:
        score += 40

    # Image count: ≥5 → +30, ≥2 → +20, ≥1 → +10
    if images_total >= 5:
        score += 30
    elif images_total >= 2:
        score += 20
    elif images_total >= 1:
        score += 10

    return max(0, min(100, score))


def calculate_technical_signal(parsed: dict) -> int:
    score = 0

    if parsed.get("canonical"):
        score += 30
    if parsed.get("meta_description"):
        score += 25
    if parsed.get("has_viewport", False):
        score += 25
    if "noindex" not in parsed.get("robots", "").lower():
        score += 20

    return max(0, min(100, score))


def run_aeo_analysis(parsed: dict) -> dict:
    """Calculate all 8 AEO signals from parsed page data."""
    signals = {
        "structure": calculate_structure_signal(parsed),
        "trust":     calculate_trust_signal(parsed),
        "schema":    calculate_schema_signal(parsed),
        "citations": calculate_citation_signal(parsed),
        "content":   calculate_content_signal(parsed),
        "freshness": calculate_freshness_signal(parsed),
        "media":     calculate_media_signal(parsed),
        "technical": calculate_technical_signal(parsed),
    }
    page_info = {
        "title": parsed.get("title", ""),
        "word_count": parsed.get("word_count", 0),
        "has_schema": len(parsed.get("schema_blocks", [])) > 0,
        "schema_types": parsed.get("schema_types", []),
        "author": parsed.get("author", ""),
        "external_links": parsed.get("external_links", 0),
        "images_total": parsed.get("images_total", 0),
    }
    return {"signals": signals, "page_info": page_info}
