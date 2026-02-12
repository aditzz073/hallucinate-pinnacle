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
    """Generate gaps explaining why page might not be cited."""
    gaps = []

    if intent_match < 50:
        gaps.append({
            "gap": "Weak intent alignment",
            "detail": f"Query intent '{intent}' poorly matched by page content. Only {intent_match}% intent match.",
        })

    if not content_match.get("has_faq") and "faqpage" not in [t.lower() for t in parsed.get("schema_types", [])]:
        gaps.append({
            "gap": "Missing FAQ schema",
            "detail": "No FAQ content or FAQPage schema detected. FAQ sections are highly extractable by AI engines.",
        })

    if not content_match.get("has_summary"):
        gaps.append({
            "gap": "No summary block",
            "detail": "No summary, TL;DR, or key takeaways section found. These help AI engines extract concise answers.",
        })

    if authority < 40:
        gaps.append({
            "gap": "Low authority signals",
            "detail": f"Authority score is only {authority}/100. Missing author, organization, or citation signals.",
        })

    if not parsed.get("author"):
        gaps.append({
            "gap": "No author attribution",
            "detail": "Content lacks author information, which is a key trust signal for AI citations.",
        })

    if schema_support < 30:
        gaps.append({
            "gap": "Insufficient structured data",
            "detail": f"Schema support is only {schema_support}/100. Add relevant JSON-LD markup.",
        })

    if content_depth < 40:
        gaps.append({
            "gap": "Content lacks depth",
            "detail": f"Content depth score is {content_depth}/100. Consider expanding with more detail and sections.",
        })

    if extractability < 40:
        gaps.append({
            "gap": "Low extractability",
            "detail": f"Extractability score is {extractability}/100. Content isn't structured for easy AI extraction.",
        })

    if not content_match.get("has_definition") and intent == "definition":
        gaps.append({
            "gap": "No clear definition block",
            "detail": "For definition queries, a clear 'X is...' statement in the first paragraph is crucial.",
        })

    if content_match.get("heading_relevance", 0) < 30:
        gaps.append({
            "gap": "Low heading relevance",
            "detail": "Query terms are not reflected in page headings. Headings should include target keywords.",
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
