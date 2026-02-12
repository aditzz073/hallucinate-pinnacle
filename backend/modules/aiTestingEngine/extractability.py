"""Extractability Scorer - Phase 2 Step 3"""


def calculate_extractability(parsed: dict, content_match: dict) -> int:
    score = 0.0

    # Direct answer blocks (definition detected in first paragraphs)
    if content_match.get("has_definition"):
        score += 25

    # Structured FAQ
    faq_count = len(parsed.get("faq_items", []))
    if faq_count >= 5:
        score += 25
    elif faq_count >= 3:
        score += 20
    elif faq_count >= 1:
        score += 12

    # Clear formatting: lists in content
    body = parsed.get("body_text", "")
    # Check for numbered/bullet patterns
    import re
    list_patterns = re.findall(r"(?:^|\n)\s*(?:\d+[\.\)]\s|\-\s|\*\s|•\s)", body)
    if len(list_patterns) >= 5:
        score += 20
    elif len(list_patterns) >= 3:
        score += 12
    elif len(list_patterns) >= 1:
        score += 6

    # Summary block
    if content_match.get("has_summary"):
        score += 15

    # Heading structure (easy extraction)
    headings = parsed.get("headings", {})
    h2_count = len(headings.get("h2", []))
    if h2_count >= 3:
        score += 15
    elif h2_count >= 1:
        score += 8

    return max(0, min(100, int(round(score))))
