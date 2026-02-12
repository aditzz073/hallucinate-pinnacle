"""Content Matcher - Phase 2 Step 2"""
import re


def calculate_content_match(parsed: dict, tokens: list, intent: str) -> dict:
    headings = parsed.get("headings", {})
    all_headings_text = ""
    for level in range(1, 7):
        for h in headings.get(f"h{level}", []):
            all_headings_text += " " + h.lower()

    body_lower = parsed.get("body_text", "").lower()
    title_lower = parsed.get("title", "").lower()
    meta_lower = parsed.get("meta_description", "").lower()

    # Heading relevance: % of query tokens found in headings
    heading_matches = sum(1 for t in tokens if t in all_headings_text)
    heading_relevance = (heading_matches / len(tokens) * 100) if tokens else 0

    # Keyword overlap: % of tokens in body
    body_matches = sum(1 for t in tokens if t in body_lower)
    keyword_overlap = (body_matches / len(tokens) * 100) if tokens else 0

    # Title relevance
    title_matches = sum(1 for t in tokens if t in title_lower)
    title_relevance = (title_matches / len(tokens) * 100) if tokens else 0

    # Meta relevance
    meta_matches = sum(1 for t in tokens if t in meta_lower)
    meta_relevance = (meta_matches / len(tokens) * 100) if tokens else 0

    # FAQ presence
    faq_items = parsed.get("faq_items", [])
    has_faq = len(faq_items) > 0
    faq_relevance = 0
    if has_faq and tokens:
        for item in faq_items:
            q_lower = item.get("question", "").lower()
            matches = sum(1 for t in tokens if t in q_lower)
            faq_relevance = max(faq_relevance, matches / len(tokens) * 100)

    # Definition block detection
    has_definition = False
    definition_patterns = [
        r"\bis\s+(a|an|the)\s+\w+",
        r"\brefers\s+to\b",
        r"\bdefined\s+as\b",
        r"\bmeans\b",
    ]
    first_paragraphs = body_lower[:1500]
    for p in definition_patterns:
        if re.search(p, first_paragraphs):
            has_definition = True
            break

    # Summary block detection
    has_summary = False
    summary_signals = ["in summary", "to summarize", "key takeaways", "tldr", "tl;dr", "overview", "at a glance"]
    for s in summary_signals:
        if s in body_lower:
            has_summary = True
            break

    return {
        "heading_relevance": min(100, heading_relevance),
        "keyword_overlap": min(100, keyword_overlap),
        "title_relevance": min(100, title_relevance),
        "meta_relevance": min(100, meta_relevance),
        "has_faq": has_faq,
        "faq_relevance": min(100, faq_relevance),
        "has_definition": has_definition,
        "has_summary": has_summary,
    }
