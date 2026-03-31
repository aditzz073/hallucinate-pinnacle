"""Deterministic Scorer - Phase 1 Step 5"""


def _clamp(value: float) -> int:
    return max(0, min(100, int(round(value))))


def score_structure(signals: dict) -> int:
    s = signals.get("structure", {})
    score = 0.0

    if s.get("has_title"):
        score += 15
        tl = s.get("title_length", 0)
        if 30 <= tl <= 60:
            score += 5  # optimal title length
    if s.get("has_meta_description"):
        score += 10
        ml = s.get("meta_description_length", 0)
        if 120 <= ml <= 160:
            score += 5  # optimal meta desc length
    if s.get("h1_count", 0) == 1:
        score += 15
    elif s.get("h1_count", 0) > 1:
        score += 8  # multiple H1s less ideal
    if s.get("has_heading_hierarchy"):
        score += 10
    # Heading depth bonus
    depth = s.get("heading_depth", 0)
    if depth >= 3:
        score += 5
    elif depth >= 2:
        score += 3
    wc = s.get("word_count", 0)
    if wc >= 2000:
        score += 20
    elif wc >= 1000:
        score += 15
    elif wc >= 300:
        score += 10
    elif wc >= 100:
        score += 5
    if s.get("internal_links", 0) >= 3:
        score += 10
    elif s.get("internal_links", 0) >= 1:
        score += 5
    if s.get("external_links", 0) >= 1:
        score += 5
    if s.get("has_canonical"):
        score += 5

    return _clamp(score)


def score_trust(signals: dict) -> int:
    t = signals.get("trust", {})
    score = 0.0

    if t.get("has_author"):
        score += 25
    if t.get("has_organization_schema"):
        score += 20
    if t.get("has_contact_info"):
        score += 15
    ext = t.get("external_links", 0)
    if ext >= 3:
        score += 15
    elif ext >= 1:
        score += 8
    wc = t.get("word_count", 0)
    if wc >= 1500:
        score += 10
    elif wc >= 500:
        score += 5
    if not t.get("has_robots_noindex", False):
        score += 10
    # Base trust for being a live page
    score += 5

    return _clamp(score)


def score_media(signals: dict) -> int:
    m = signals.get("media", {})
    score = 0.0

    total = m.get("total_images", 0)
    if total > 0:
        score += 25
        coverage = m.get("alt_coverage", 0)
        if coverage == 100:
            score += 25
        elif coverage >= 80:
            score += 20
        elif coverage >= 50:
            score += 12
        elif coverage > 0:
            score += 5
        if total >= 5:
            score += 15
        elif total >= 3:
            score += 10
        elif total >= 2:
            score += 5
    else:
        score += 10  # some pages legitimately have no images

    # Remaining points based on image-to-word ratio
    wc = signals.get("structure", {}).get("word_count", 0)
    if total > 0 and wc > 0:
        ratio = total / (wc / 200)  # ~1 image per 200 words is ideal
        if 0.5 <= ratio <= 2.0:
            score += 15
        elif 0.2 <= ratio < 0.5:
            score += 8
    else:
        score += 10

    return _clamp(score)


def score_schema(signals: dict) -> int:
    sc = signals.get("schema", {})
    score = 0.0

    if sc.get("has_json_ld"):
        score += 20
    types = sc.get("schema_types", [])
    relevant = sc.get("has_article_schema") or sc.get("has_product_schema") or sc.get("has_faq_schema")
    if relevant:
        score += 25
    if sc.get("has_organization_schema"):
        score += 15
    if sc.get("has_breadcrumb"):
        score += 10
    count = sc.get("schema_count", 0)
    if count >= 3:
        score += 15
    elif count >= 2:
        score += 10
    elif count >= 1:
        score += 5
    if sc.get("faq_items_count", 0) >= 3:
        score += 10
    elif sc.get("faq_items_count", 0) >= 1:
        score += 5
    # Bonus for multiple schema types
    if len(types) >= 3:
        score += 5

    return _clamp(score)


def score_technical(signals: dict) -> int:
    t = signals.get("technical", {})
    score = 0.0

    if t.get("has_canonical"):
        score += 15
    if not t.get("has_noindex", False):
        score += 15
    if t.get("has_og_tags"):
        score += 15
    if t.get("has_twitter_cards"):
        score += 10
    if t.get("has_viewport"):
        score += 15
    if t.get("has_lang"):
        score += 10
    # Base technical score for being accessible
    score += 20

    return _clamp(score)


def score_freshness(signals: dict) -> int:
    """Score content freshness and voice-search readiness."""
    f = signals.get("freshness", {})
    score = 0.0

    days = f.get("days_since_update", -1)
    if days >= 0:
        # Has modification date — score based on recency
        if days <= 30:
            score += 40  # Updated within last month
        elif days <= 90:
            score += 30
        elif days <= 180:
            score += 20
        elif days <= 365:
            score += 10
        else:
            score += 0  # Stale content
    else:
        # No modification date found — neutral score
        score += 15

    # Conversational tone (voice search readiness)
    conv = f.get("conversational_score", 0)
    if conv >= 60:
        score += 35
    elif conv >= 30:
        score += 25
    elif conv >= 10:
        score += 15
    else:
        score += 5

    # Question headings boost
    qh = f.get("question_headings", 0)
    if qh >= 3:
        score += 25
    elif qh >= 1:
        score += 15
    else:
        score += 5

    return _clamp(score)


def calculate_overall(
    structure: int, trust: int, media: int, schema: int, technical: int, freshness: int = 50
) -> int:
    weighted = (
        structure * 0.22
        + trust * 0.18
        + media * 0.13
        + schema * 0.22
        + technical * 0.13
        + freshness * 0.12
    )
    return _clamp(weighted)


def calculate_all_scores(signals: dict) -> dict:
    structure = score_structure(signals)
    trust = score_trust(signals)
    media = score_media(signals)
    schema = score_schema(signals)
    technical = score_technical(signals)
    freshness = score_freshness(signals)
    overall = calculate_overall(structure, trust, media, schema, technical, freshness)

    return {
        "overall_score": overall,
        "breakdown": {
            "structure": structure,
            "trust": trust,
            "media": media,
            "schema": schema,
            "technical": technical,
            "freshness": freshness,
        },
    }

