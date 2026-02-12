"""Signal Builder - Phase 1 Step 4"""


def build_signals(parsed: dict, page_type: str) -> dict:
    headings = parsed.get("headings", {})
    h1_count = len(headings.get("h1", []))
    h2_count = len(headings.get("h2", []))
    h3_count = len(headings.get("h3", []))

    # Check heading hierarchy: h1 exists, then h2, then h3
    has_hierarchy = h1_count >= 1 and h2_count >= 1

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
            "schema_types": parsed.get("schema_types", []),
            "has_faq_schema": any(
                t.lower() == "faqpage" for t in parsed.get("schema_types", [])
            ),
            "has_article_schema": any(
                t.lower() in ("article", "newsarticle", "blogposting", "technicalarticle")
                for t in parsed.get("schema_types", [])
            ),
            "has_product_schema": any(
                t.lower() in ("product", "offer")
                for t in parsed.get("schema_types", [])
            ),
            "has_organization_schema": parsed.get("has_organization_schema", False),
            "has_breadcrumb": any(
                t.lower() == "breadcrumblist"
                for t in parsed.get("schema_types", [])
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
        "page_type": page_type,
    }
