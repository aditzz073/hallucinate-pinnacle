"""Signal Builder - Phase 1 Step 4"""
from datetime import datetime, timezone


def build_signals(parsed: dict, page_type: str) -> dict:
    headings = parsed.get("headings", {})
    h1_count = len(headings.get("h1", []))
    h2_count = len(headings.get("h2", []))
    h3_count = len(headings.get("h3", []))

    # Check heading hierarchy: h1 exists, then h2, then h3
    has_hierarchy = h1_count >= 1 and h2_count >= 1
    heading_depth = parsed.get("heading_depth", 0)
    if heading_depth == 0:
        heading_depth = (1 if h1_count >= 1 else 0) + (1 if h2_count >= 1 else 0) + (1 if h3_count >= 1 else 0)

    # Freshness calculation
    last_modified = parsed.get("last_modified", "")
    days_since_update = -1
    is_stale = False
    if last_modified:
        try:
            mod_date = datetime.fromisoformat(last_modified.replace("Z", "+00:00"))
            days_since_update = (datetime.now(timezone.utc) - mod_date).days
            is_stale = days_since_update > 365
        except Exception:
            pass

    conversational_score = parsed.get("conversational_score", 0)

    # Schema presence
    schema_types = parsed.get("schema_types", [])
    schema_present = parsed.get("schema_present", len(parsed.get("schema_blocks", [])) > 0)

    # Structure score (quick composite for schema+heading quality)
    structure_score = 0
    if has_hierarchy:
        structure_score += 30
    if heading_depth >= 3:
        structure_score += 20
    elif heading_depth >= 2:
        structure_score += 10
    if h1_count == 1:
        structure_score += 20
    if parsed.get("word_count", 0) >= 1000:
        structure_score += 15
    elif parsed.get("word_count", 0) >= 300:
        structure_score += 10
    if schema_present:
        structure_score += 15

    return {
        "structure": {
            "has_title": bool(parsed.get("title")),
            "title_length": len(parsed.get("title", "")),
            "has_meta_description": bool(parsed.get("meta_description")),
            "meta_description_length": len(parsed.get("meta_description", "")),
            "h1_count": h1_count,
            "h2_count": h2_count,
            "h3_count": h3_count,
            "has_heading_hierarchy": has_hierarchy,
            "heading_depth": heading_depth,
            "word_count": parsed.get("word_count", 0),
            "internal_links": parsed.get("internal_links", 0),
            "external_links": parsed.get("external_links", 0),
            "has_canonical": bool(parsed.get("canonical")),
        },
        "trust": {
            "has_author": bool(parsed.get("author")),
            "author": parsed.get("author", ""),
            "has_organization_schema": parsed.get("has_organization_schema", False),
            "has_contact_info": parsed.get("has_contact_info", False),
            "external_links": parsed.get("external_links", 0),
            "word_count": parsed.get("word_count", 0),
            "has_robots_noindex": "noindex" in parsed.get("robots", "").lower(),
        },
        "media": {
            "total_images": parsed.get("images_total", 0),
            "images_with_alt": parsed.get("images_with_alt", 0),
            "alt_coverage": (
                round(parsed["images_with_alt"] / parsed["images_total"] * 100)
                if parsed.get("images_total", 0) > 0
                else 0
            ),
            "has_images": parsed.get("images_total", 0) > 0,
        },
        "schema": {
            "has_json_ld": len(parsed.get("schema_blocks", [])) > 0,
            "schema_count": len(parsed.get("schema_blocks", [])),
            "schema_types": schema_types,
            "schema_present": schema_present,
            "structure_score": min(100, structure_score),
            "has_faq_schema": parsed.get("has_faq_schema", False) or any(
                t.lower() == "faqpage" for t in schema_types
            ),
            "has_article_schema": parsed.get("has_article_schema", False) or any(
                t.lower() in ("article", "newsarticle", "blogposting", "technicalarticle")
                for t in schema_types
            ),
            "has_product_schema": parsed.get("has_product_schema", False) or any(
                t.lower() in ("product", "offer")
                for t in schema_types
            ),
            "has_organization_schema": parsed.get("has_organization_schema", False),
            "has_breadcrumb": parsed.get("has_breadcrumb_schema", False) or any(
                t.lower() == "breadcrumblist"
                for t in schema_types
            ),
            "faq_items_count": len(parsed.get("faq_items", [])),
        },
        "technical": {
            "has_canonical": bool(parsed.get("canonical")),
            "canonical_url": parsed.get("canonical", ""),
            "robots": parsed.get("robots", ""),
            "has_noindex": "noindex" in parsed.get("robots", "").lower(),
            "has_og_tags": len(parsed.get("og_tags", {})) > 0,
            "has_twitter_cards": len(parsed.get("twitter_tags", {})) > 0,
            "has_viewport": parsed.get("has_viewport", False),
            "has_lang": bool(parsed.get("lang")),
            "lang": parsed.get("lang", ""),
        },
        "freshness": {
            "last_modified": last_modified,
            "days_since_update": days_since_update,
            "is_stale": is_stale,
            "conversational_score": conversational_score,
            "question_headings": parsed.get("question_headings", 0),
        },
        "page_type": page_type,
    }

