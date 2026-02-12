"""Citation Probability Calculator - Phase 2 Steps 5-7"""


def calculate_intent_match(content_match: dict, intent: str) -> int:
    """Score how well the page matches the query intent."""
    score = 0.0

    # Base relevance from keyword overlap
    keyword_overlap = content_match.get("keyword_overlap", 0)
    score += keyword_overlap * 0.3

    # Heading relevance bonus
    heading_rel = content_match.get("heading_relevance", 0)
    score += heading_rel * 0.25

    # Title relevance
    title_rel = content_match.get("title_relevance", 0)
    score += title_rel * 0.25

    # Intent-specific bonuses
    if intent == "definition" and content_match.get("has_definition"):
        score += 20
    elif intent == "list" and content_match.get("has_faq"):
        score += 15
    elif intent == "informational":
        score += content_match.get("meta_relevance", 0) * 0.1
        if content_match.get("has_summary"):
            score += 10
    elif intent == "comparison":
        score += heading_rel * 0.1
    elif intent == "transactional":
        score += title_rel * 0.1

    return max(0, min(100, int(round(score))))


def calculate_schema_support(parsed: dict, intent: str) -> int:
    """Score schema relevance for the query intent."""
    score = 0.0
    schema_types = [t.lower() for t in parsed.get("schema_types", [])]

    if not schema_types:
        return 0

    # Base: has any schema
    score += 20

    # Intent-matched schema
    intent_schema_map = {
        "definition": ["article", "technicalarticle", "definedterm"],
        "list": ["faqpage", "itemlist", "howto"],
        "comparison": ["article", "review", "product"],
        "transactional": ["product", "offer", "service"],
        "informational": ["article", "newsarticle", "blogposting", "howto", "faqpage"],
    }
    relevant = intent_schema_map.get(intent, [])
    matched = sum(1 for st in schema_types if st in relevant)
    if matched >= 2:
        score += 40
    elif matched >= 1:
        score += 25

    # FAQ schema bonus (always valuable)
    if "faqpage" in schema_types:
        score += 20

    # Breadcrumb
    if "breadcrumblist" in schema_types:
        score += 10

    # Multiple schemas
    if len(schema_types) >= 3:
        score += 10

    return max(0, min(100, int(round(score))))


def calculate_content_depth(parsed: dict) -> int:
    """Score content depth."""
    score = 0.0
    wc = parsed.get("word_count", 0)
    headings = parsed.get("headings", {})

    # Word count
    if wc >= 3000:
        score += 35
    elif wc >= 2000:
        score += 30
    elif wc >= 1000:
        score += 22
    elif wc >= 500:
        score += 15
    elif wc >= 300:
        score += 8

    # Heading depth
    h2_count = len(headings.get("h2", []))
    h3_count = len(headings.get("h3", []))
    if h2_count >= 5:
        score += 20
    elif h2_count >= 3:
        score += 15
    elif h2_count >= 1:
        score += 8
    if h3_count >= 3:
        score += 10
    elif h3_count >= 1:
        score += 5

    # Images indicate thoroughness
    img_count = parsed.get("images_total", 0)
    if img_count >= 5:
        score += 15
    elif img_count >= 2:
        score += 10
    elif img_count >= 1:
        score += 5

    # External links (references)
    ext = parsed.get("external_links", 0)
    if ext >= 3:
        score += 15
    elif ext >= 1:
        score += 8

    # FAQ adds depth
    if len(parsed.get("faq_items", [])) >= 1:
        score += 5

    return max(0, min(100, int(round(score))))


def calculate_citation_probability(
    intent_match: int,
    extractability: int,
    authority: int,
    schema_support: int,
    content_depth: int,
) -> int:
    """Weighted citation probability formula."""
    weighted = (
        intent_match * 0.25
        + extractability * 0.25
        + authority * 0.20
        + schema_support * 0.15
        + content_depth * 0.15
    )
    return max(0, min(100, int(round(weighted))))


def estimate_position(citation_probability: int) -> str:
    if citation_probability >= 90:
        return "Top 3"
    elif citation_probability >= 70:
        return "Top 5"
    elif citation_probability >= 50:
        return "Top 10"
    else:
        return "Low likelihood"


def generate_why_not_cited(
    parsed: dict, content_match: dict, intent: str,
    intent_match: int, extractability: int, authority: int,
    schema_support: int, content_depth: int,
) -> list:
    """
    Generate gaps explaining why page might not be cited.
    Uses balanced thresholds and specific explanations.
    """
    gaps = []

    # Intent alignment - only flag if significantly misaligned
    if intent_match < 40:
        gaps.append({
            "gap": "Weak intent alignment",
            "detail": f"Query intent '{intent}' not well matched by content structure. Consider restructuring opening to match '{intent}' queries.",
        })

    # FAQ - only suggest for list/informational intents, not required for all content
    if intent in ("list", "informational") and not content_match.get("has_faq"):
        faq_count = len(parsed.get("faq_items", []))
        if faq_count == 0:
            gaps.append({
                "gap": "Consider adding FAQ section",
                "detail": "For this query type, FAQ sections are highly extractable. Consider adding common Q&As.",
            })

    # Summary - suggest but don't require
    if not content_match.get("has_summary") and content_depth >= 40:
        gaps.append({
            "gap": "No summary section",
            "detail": "Adding a 'Key Takeaways' or summary section helps AI engines extract concise answers.",
        })

    # Authority - lower threshold, more specific feedback
    if authority < 30:
        gaps.append({
            "gap": "Low authority signals",
            "detail": f"Authority indicators are limited ({authority}/100). Consider adding author info or organization schema.",
        })

    # Author - only flag if no author AND low authority
    if not parsed.get("author") and authority < 50:
        gaps.append({
            "gap": "Missing author attribution",
            "detail": "Adding author information increases content credibility for AI citations.",
        })

    # Schema - lower threshold, specific suggestion
    if schema_support < 20:
        gaps.append({
            "gap": "Limited structured data",
            "detail": "Adding JSON-LD schema (Article, HowTo, or FAQ) helps AI understand content context.",
        })

    # Content depth - only flag if very low
    if content_depth < 30:
        gaps.append({
            "gap": "Content could be expanded",
            "detail": f"Content depth is {content_depth}/100. Consider adding more sections or examples.",
        })

    # Extractability - use specific factors from new scoring
    if extractability < 30:
        # Get specific factors if available
        extract_factors = content_match.get("_extractability_factors", [])
        missing_factors = [f for f in extract_factors if f.get("type") == "missing"]
        
        if missing_factors:
            main_issue = missing_factors[0]["reason"]
            gaps.append({
                "gap": "Extractability needs improvement",
                "detail": f"{main_issue}. Structure content with clear definitions and headings.",
            })
        else:
            gaps.append({
                "gap": "Content structure could be clearer",
                "detail": "Consider adding definition paragraphs, clearer headings, or structured sections.",
            })

    # Definition block - only for definition intent
    if not content_match.get("has_definition") and intent == "definition":
        gaps.append({
            "gap": "Definition paragraph needed",
            "detail": "For 'what is' queries, add a clear '[Topic] is a...' statement in the first paragraph.",
        })

    # Heading relevance - only flag if very low
    if content_match.get("heading_relevance", 0) < 20:
        gaps.append({
            "gap": "Headings don't match query",
            "detail": "Include query-related terms in H1/H2 headings for better AI alignment.",
        })

    return gaps


def generate_improvement_suggestions(gaps: list, intent: str) -> list:
    suggestions = []

    gap_types = {g["gap"] for g in gaps}

    if "Weak intent alignment" in gap_types:
        suggestions.append({
            "suggestion": "Align content with query intent",
            "priority": "high",
            "detail": f"Restructure content to better serve '{intent}' queries. Match headings and opening paragraphs to the query pattern.",
        })

    if "Missing FAQ schema" in gap_types:
        suggestions.append({
            "suggestion": "Add FAQ section with schema markup",
            "priority": "high",
            "detail": "Create a Q&A section addressing common questions and add FAQPage JSON-LD schema.",
        })

    if "No summary block" in gap_types:
        suggestions.append({
            "suggestion": "Add a summary or key takeaways section",
            "priority": "medium",
            "detail": "Add a 'Key Takeaways' or 'Summary' section that AI engines can easily extract.",
        })

    if "Low authority signals" in gap_types:
        suggestions.append({
            "suggestion": "Strengthen authority signals",
            "priority": "high",
            "detail": "Add author byline, organization schema, external citations, and contact information.",
        })

    if "Insufficient structured data" in gap_types:
        suggestions.append({
            "suggestion": "Implement comprehensive structured data",
            "priority": "high",
            "detail": "Add JSON-LD schema relevant to your content type (Article, Product, HowTo, FAQ).",
        })

    if "Content lacks depth" in gap_types:
        suggestions.append({
            "suggestion": "Expand content depth",
            "priority": "medium",
            "detail": "Add more sections, examples, data points, and explanations to increase content comprehensiveness.",
        })

    if "Low extractability" in gap_types:
        suggestions.append({
            "suggestion": "Improve content extractability",
            "priority": "medium",
            "detail": "Use bullet points, numbered lists, clear definitions, and structured headings for easy extraction.",
        })

    if "Low heading relevance" in gap_types:
        suggestions.append({
            "suggestion": "Optimize headings for target queries",
            "priority": "medium",
            "detail": "Include target keywords naturally in H1, H2, and H3 headings.",
        })

    return suggestions
