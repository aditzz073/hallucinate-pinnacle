"""Explainability Engine - Phase 5
Provides per-category contributing factors, penalties, evidence, and detected signals."""

SCORING_VERSION = "1.0.0"


def explain_structure(signals: dict) -> dict:
    s = signals.get("structure", {})
    factors = []
    penalties = []
    detected = []
    evidence = []
    score = 0

    if s.get("has_title"):
        factors.append({"signal": "has_title", "contribution": 15, "reason": "Page title present"})
        detected.append("title")
        evidence.append(f"Title length: {s.get('title_length', 0)} characters")
        score += 15
        tl = s.get("title_length", 0)
        if 30 <= tl <= 60:
            factors.append({"signal": "optimal_title_length", "contribution": 5, "reason": "Title length 30-60 chars (optimal)"})
            score += 5
        elif tl > 60:
            penalties.append({"signal": "title_too_long", "penalty": 0, "reason": f"Title is {tl} chars, exceeds 60 char optimal"})
        elif tl < 30 and tl > 0:
            penalties.append({"signal": "title_too_short", "penalty": 0, "reason": f"Title is only {tl} chars, below 30 char minimum"})
    else:
        penalties.append({"signal": "missing_title", "penalty": 15, "reason": "No page title found"})

    if s.get("has_meta_description"):
        factors.append({"signal": "has_meta_description", "contribution": 10, "reason": "Meta description present"})
        detected.append("meta_description")
        ml = s.get("meta_description_length", 0)
        evidence.append(f"Meta description length: {ml} characters")
        score += 10
        if 120 <= ml <= 160:
            factors.append({"signal": "optimal_meta_length", "contribution": 5, "reason": "Meta description 120-160 chars"})
            score += 5
    else:
        penalties.append({"signal": "missing_meta_description", "penalty": 10, "reason": "No meta description"})

    h1c = s.get("h1_count", 0)
    if h1c == 1:
        factors.append({"signal": "single_h1", "contribution": 15, "reason": "Single H1 heading (ideal)"})
        detected.append("h1")
        score += 15
    elif h1c > 1:
        factors.append({"signal": "multiple_h1", "contribution": 8, "reason": f"Found {h1c} H1 headings"})
        penalties.append({"signal": "multiple_h1", "penalty": 7, "reason": f"{h1c} H1 tags reduces clarity"})
        score += 8
    else:
        penalties.append({"signal": "missing_h1", "penalty": 15, "reason": "No H1 heading found"})

    if s.get("has_heading_hierarchy"):
        factors.append({"signal": "heading_hierarchy", "contribution": 10, "reason": "Proper H1>H2 hierarchy"})
        detected.append("heading_hierarchy")
        score += 10

    wc = s.get("word_count", 0)
    evidence.append(f"Word count: {wc}")
    if wc >= 2000:
        factors.append({"signal": "deep_content", "contribution": 20, "reason": f"{wc} words (comprehensive)"})
        score += 20
    elif wc >= 1000:
        factors.append({"signal": "good_content", "contribution": 15, "reason": f"{wc} words (good depth)"})
        score += 15
    elif wc >= 300:
        factors.append({"signal": "adequate_content", "contribution": 10, "reason": f"{wc} words (adequate)"})
        score += 10
    elif wc >= 100:
        factors.append({"signal": "thin_content", "contribution": 5, "reason": f"{wc} words (thin)"})
        penalties.append({"signal": "thin_content", "penalty": 5, "reason": "Content below 300 words"})
        score += 5
    else:
        penalties.append({"signal": "very_thin_content", "penalty": 10, "reason": f"Only {wc} words"})

    il = s.get("internal_links", 0)
    if il >= 3:
        factors.append({"signal": "internal_links", "contribution": 10, "reason": f"{il} internal links"})
        score += 10
    elif il >= 1:
        factors.append({"signal": "some_internal_links", "contribution": 5, "reason": f"{il} internal link(s)"})
        score += 5

    el = s.get("external_links", 0)
    if el >= 1:
        factors.append({"signal": "external_links", "contribution": 5, "reason": f"{el} external link(s)"})
        score += 5

    if s.get("has_canonical"):
        factors.append({"signal": "canonical", "contribution": 5, "reason": "Canonical URL set"})
        detected.append("canonical")
        score += 5

    return {
        "score": max(0, min(100, score)),
        "contributing_factors": factors,
        "penalties": penalties,
        "detected_signals": detected,
        "evidence": evidence,
    }


def explain_trust(signals: dict) -> dict:
    t = signals.get("trust", {})
    factors = []
    penalties = []
    detected = []
    evidence = []
    score = 5  # base

    factors.append({"signal": "live_page", "contribution": 5, "reason": "Page is accessible"})

    if t.get("has_author"):
        factors.append({"signal": "author_present", "contribution": 25, "reason": f"Author: {t.get('author', 'detected')}"})
        detected.append("author")
        evidence.append(f"Author: {t.get('author', 'N/A')}")
        score += 25
    else:
        penalties.append({"signal": "no_author", "penalty": 25, "reason": "No author attribution found"})

    if t.get("has_organization_schema"):
        factors.append({"signal": "organization_schema", "contribution": 20, "reason": "Organization schema present"})
        detected.append("organization_schema")
        score += 20
    else:
        penalties.append({"signal": "no_org_schema", "penalty": 20, "reason": "No Organization schema"})

    if t.get("has_contact_info"):
        factors.append({"signal": "contact_info", "contribution": 15, "reason": "Contact information detected"})
        detected.append("contact_info")
        score += 15
    else:
        penalties.append({"signal": "no_contact", "penalty": 15, "reason": "No contact information"})

    ext = t.get("external_links", 0)
    if ext >= 3:
        factors.append({"signal": "citations", "contribution": 15, "reason": f"{ext} external citations"})
        score += 15
    elif ext >= 1:
        factors.append({"signal": "some_citations", "contribution": 8, "reason": f"{ext} external link(s)"})
        score += 8

    wc = t.get("word_count", 0)
    if wc >= 1500:
        factors.append({"signal": "content_depth", "contribution": 10, "reason": "Deep content (1500+ words)"})
        score += 10
    elif wc >= 500:
        factors.append({"signal": "moderate_depth", "contribution": 5, "reason": "Moderate content depth"})
        score += 5

    if not t.get("has_robots_noindex", False):
        factors.append({"signal": "indexable", "contribution": 10, "reason": "Page is indexable"})
        detected.append("indexable")
        score += 10
    else:
        penalties.append({"signal": "noindex", "penalty": 10, "reason": "Page has noindex directive"})

    return {
        "score": max(0, min(100, score)),
        "contributing_factors": factors,
        "penalties": penalties,
        "detected_signals": detected,
        "evidence": evidence,
    }


def explain_media(signals: dict) -> dict:
    m = signals.get("media", {})
    factors = []
    penalties = []
    detected = []
    evidence = []
    score = 0

    total = m.get("total_images", 0)
    alt_count = m.get("images_with_alt", 0)
    coverage = m.get("alt_coverage", 0)
    evidence.append(f"Total images: {total}")
    evidence.append(f"Images with alt: {alt_count} ({coverage}%)")

    if total > 0:
        factors.append({"signal": "has_images", "contribution": 25, "reason": f"{total} image(s) found"})
        detected.append("images")
        score += 25
        if coverage == 100:
            factors.append({"signal": "full_alt_coverage", "contribution": 25, "reason": "All images have alt text"})
            score += 25
        elif coverage >= 80:
            factors.append({"signal": "good_alt_coverage", "contribution": 20, "reason": f"{coverage}% alt coverage"})
            score += 20
        elif coverage >= 50:
            factors.append({"signal": "partial_alt", "contribution": 12, "reason": f"{coverage}% alt coverage"})
            penalties.append({"signal": "low_alt_coverage", "penalty": 8, "reason": f"Only {coverage}% images have alt text"})
            score += 12
        elif coverage > 0:
            factors.append({"signal": "minimal_alt", "contribution": 5, "reason": f"{coverage}% alt coverage"})
            penalties.append({"signal": "very_low_alt", "penalty": 15, "reason": f"Only {coverage}% images have alt text"})
            score += 5
        else:
            penalties.append({"signal": "no_alt_text", "penalty": 25, "reason": "No images have alt text"})

        if total >= 5:
            factors.append({"signal": "rich_media", "contribution": 15, "reason": f"{total} images (rich)"})
            score += 15
        elif total >= 3:
            factors.append({"signal": "moderate_media", "contribution": 10, "reason": f"{total} images"})
            score += 10
        elif total >= 2:
            factors.append({"signal": "some_media", "contribution": 5, "reason": f"{total} images"})
            score += 5
    else:
        score += 10
        factors.append({"signal": "no_images_baseline", "contribution": 10, "reason": "Baseline score for imageless page"})
        penalties.append({"signal": "no_images", "penalty": 15, "reason": "No images found"})

    wc = signals.get("structure", {}).get("word_count", 0)
    if total > 0 and wc > 0:
        ratio = total / (wc / 200)
        if 0.5 <= ratio <= 2.0:
            factors.append({"signal": "good_ratio", "contribution": 15, "reason": f"Good image-to-text ratio"})
            score += 15
        elif 0.2 <= ratio < 0.5:
            factors.append({"signal": "moderate_ratio", "contribution": 8, "reason": "Moderate image-to-text ratio"})
            score += 8
    else:
        score += 10

    return {
        "score": max(0, min(100, score)),
        "contributing_factors": factors,
        "penalties": penalties,
        "detected_signals": detected,
        "evidence": evidence,
    }


def explain_schema(signals: dict) -> dict:
    sc = signals.get("schema", {})
    factors = []
    penalties = []
    detected = []
    evidence = []
    score = 0

    types = sc.get("schema_types", [])
    evidence.append(f"Schema types: {', '.join(types) if types else 'none'}")
    evidence.append(f"Schema count: {sc.get('schema_count', 0)}")
    evidence.append(f"FAQ items: {sc.get('faq_items_count', 0)}")

    if sc.get("has_json_ld"):
        factors.append({"signal": "has_json_ld", "contribution": 20, "reason": "JSON-LD structured data present"})
        detected.append("json_ld")
        score += 20
    else:
        penalties.append({"signal": "no_json_ld", "penalty": 20, "reason": "No JSON-LD structured data"})

    relevant = sc.get("has_article_schema") or sc.get("has_product_schema") or sc.get("has_faq_schema")
    if relevant:
        factors.append({"signal": "relevant_schema", "contribution": 25, "reason": "Content-relevant schema type detected"})
        score += 25
        if sc.get("has_faq_schema"):
            detected.append("faq_schema")
        if sc.get("has_article_schema"):
            detected.append("article_schema")
        if sc.get("has_product_schema"):
            detected.append("product_schema")

    if sc.get("has_organization_schema"):
        factors.append({"signal": "org_schema", "contribution": 15, "reason": "Organization schema"})
        detected.append("organization_schema")
        score += 15

    if sc.get("has_breadcrumb"):
        factors.append({"signal": "breadcrumb", "contribution": 10, "reason": "BreadcrumbList schema"})
        detected.append("breadcrumb")
        score += 10

    count = sc.get("schema_count", 0)
    if count >= 3:
        factors.append({"signal": "multiple_schemas", "contribution": 15, "reason": f"{count} schema blocks"})
        score += 15
    elif count >= 2:
        factors.append({"signal": "dual_schema", "contribution": 10, "reason": f"{count} schema blocks"})
        score += 10
    elif count >= 1:
        factors.append({"signal": "single_schema", "contribution": 5, "reason": "1 schema block"})
        score += 5

    faq_count = sc.get("faq_items_count", 0)
    if faq_count >= 3:
        factors.append({"signal": "rich_faq", "contribution": 10, "reason": f"{faq_count} FAQ items"})
        score += 10
    elif faq_count >= 1:
        factors.append({"signal": "has_faq", "contribution": 5, "reason": f"{faq_count} FAQ item(s)"})
        score += 5

    if len(types) >= 3:
        factors.append({"signal": "schema_diversity", "contribution": 5, "reason": f"{len(types)} distinct types"})
        score += 5

    return {
        "score": max(0, min(100, score)),
        "contributing_factors": factors,
        "penalties": penalties,
        "detected_signals": detected,
        "evidence": evidence,
    }


def explain_technical(signals: dict) -> dict:
    t = signals.get("technical", {})
    factors = []
    penalties = []
    detected = []
    evidence = []
    score = 20  # base for being accessible

    factors.append({"signal": "accessible", "contribution": 20, "reason": "Page is accessible and parseable"})

    if t.get("has_canonical"):
        factors.append({"signal": "canonical", "contribution": 15, "reason": "Canonical URL set"})
        detected.append("canonical")
        evidence.append(f"Canonical: {t.get('canonical_url', '')}")
        score += 15

    if not t.get("has_noindex", False):
        factors.append({"signal": "no_noindex", "contribution": 15, "reason": "No noindex directive"})
        detected.append("indexable")
        score += 15
    else:
        penalties.append({"signal": "has_noindex", "penalty": 15, "reason": "Page blocked by noindex"})

    if t.get("has_og_tags"):
        factors.append({"signal": "og_tags", "contribution": 15, "reason": "Open Graph tags present"})
        detected.append("open_graph")
        score += 15

    if t.get("has_twitter_cards"):
        factors.append({"signal": "twitter_cards", "contribution": 10, "reason": "Twitter Card tags present"})
        detected.append("twitter_cards")
        score += 10

    if t.get("has_viewport"):
        factors.append({"signal": "viewport", "contribution": 15, "reason": "Mobile viewport meta tag"})
        detected.append("viewport")
        score += 15

    if t.get("has_lang"):
        factors.append({"signal": "lang_attr", "contribution": 10, "reason": f"Language: {t.get('lang', '')}"})
        detected.append("lang")
        evidence.append(f"Language: {t.get('lang', 'N/A')}")
        score += 10

    return {
        "score": max(0, min(100, score)),
        "contributing_factors": factors,
        "penalties": penalties,
        "detected_signals": detected,
        "evidence": evidence,
    }


def build_explainability(signals: dict) -> dict:
    return {
        "structure": explain_structure(signals),
        "trust": explain_trust(signals),
        "media": explain_media(signals),
        "schema": explain_schema(signals),
        "technical": explain_technical(signals),
    }


def count_total_signals(explainability: dict) -> int:
    total = 0
    for category in explainability.values():
        total += len(category.get("contributing_factors", []))
        total += len(category.get("penalties", []))
    return total
