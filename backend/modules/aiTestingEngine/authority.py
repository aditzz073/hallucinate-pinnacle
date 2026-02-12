"""Authority Scorer - Phase 2 Step 4"""


def calculate_authority(parsed: dict, signals: dict) -> int:
    score = 0.0

    # Author presence
    if parsed.get("author"):
        score += 25

    # External citations (outbound links as references)
    ext = parsed.get("external_links", 0)
    if ext >= 5:
        score += 20
    elif ext >= 3:
        score += 15
    elif ext >= 1:
        score += 8

    # Organization schema
    if parsed.get("has_organization_schema"):
        score += 20

    # Contact transparency
    if parsed.get("has_contact_info"):
        score += 15

    # Content depth (word count)
    wc = parsed.get("word_count", 0)
    if wc >= 2000:
        score += 20
    elif wc >= 1000:
        score += 15
    elif wc >= 500:
        score += 10
    elif wc >= 300:
        score += 5

    return max(0, min(100, int(round(score))))
