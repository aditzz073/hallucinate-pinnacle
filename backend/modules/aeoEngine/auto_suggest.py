"""Auto-Suggest Optimization Options
Analyze signals and scores to generate top prioritized suggestions."""


# Impact weights per severity
SEVERITY_WEIGHT = {"high": 3, "medium": 2, "low": 1}

# Mapping from recommendation issues to actionable suggestion labels
SUGGESTION_LABELS = {
    "Missing page title": "Add a descriptive page title",
    "Missing meta description": "Add a meta description",
    "Missing H1 heading": "Add a clear H1 heading",
    "Multiple H1 headings": "Consolidate to a single H1",
    "Weak heading hierarchy": "Improve heading structure (H1 → H2 → H3)",
    "Thin content": "Expand content depth (800+ words)",
    "Content could be deeper": "Add more detail and examples",
    "No internal links": "Add internal links to related pages",
    "No author attribution": "Add author attribution",
    "Missing Organization schema": "Add Organization JSON-LD schema",
    "No contact information detected": "Add contact information",
    "No images on page": "Add relevant images with alt text",
    "Images missing alt text": "Add alt text to all images",
    "No structured data (JSON-LD)": "Add JSON-LD structured data",
    "No FAQ content or schema": "Add FAQ schema",
    "Missing BreadcrumbList schema": "Add BreadcrumbList schema",
    "Missing canonical tag": "Add canonical tag",
    "Page has noindex directive": "Remove noindex directive",
    "Missing Open Graph tags": "Add Open Graph meta tags",
    "Missing lang attribute": "Add lang attribute to HTML",
    "Title too long": "Shorten page title to 30-60 characters",
    "Title too short": "Expand page title to 30-60 characters",
    "Content is outdated": "Update content with fresh information",
    "Lacks conversational tone": "Add conversational Q&A structure",
}


def generate_suggestions(signals: dict, scores: dict, recommendations: list, max_suggestions: int = 5) -> list:
    """Generate top prioritized optimization suggestions.

    Each suggestion includes a label, expected impact, and the scoring
    dimension it primarily affects.
    """
    scored_suggestions = []
    breakdown = scores.get("breakdown", {})

    for rec in recommendations:
        issue = rec.get("issue", "")
        severity = rec.get("severity", "low")
        weight = SEVERITY_WEIGHT.get(severity, 1)

        # Find the scoring dimension most affected
        dimension = _find_dimension(issue, signals)
        dimension_score = breakdown.get(dimension, 50) if breakdown else 50

        # Lower dimension scores = higher priority (more room for improvement)
        gap_bonus = max(0, (100 - dimension_score) / 20)
        priority = weight * 10 + gap_bonus

        label = SUGGESTION_LABELS.get(issue, issue)

        scored_suggestions.append({
            "suggestion": label,
            "impact": severity.capitalize(),
            "priority_score": round(priority, 1),
            "dimension": dimension.replace("_", " ").title() if dimension else "General",
        })

    # Sort by priority (highest first), then deduplicate
    scored_suggestions.sort(key=lambda x: x["priority_score"], reverse=True)

    # Deduplicate by suggestion text
    seen = set()
    unique = []
    for s in scored_suggestions:
        if s["suggestion"] not in seen:
            seen.add(s["suggestion"])
            unique.append(s)

    return unique[:max_suggestions]


def _find_dimension(issue: str, signals: dict) -> str:
    """Map an issue to the most relevant scoring dimension."""
    issue_lower = issue.lower()

    structure_keywords = ["title", "heading", "h1", "content", "word", "internal link", "hierarchy"]
    trust_keywords = ["author", "organization", "contact", "noindex"]
    media_keywords = ["image", "alt text", "media"]
    schema_keywords = ["schema", "json-ld", "faq", "breadcrumb", "structured data"]
    technical_keywords = ["canonical", "og", "open graph", "twitter", "lang", "viewport"]
    freshness_keywords = ["outdated", "fresh", "conversational", "updated"]

    for kw in schema_keywords:
        if kw in issue_lower:
            return "schema"
    for kw in structure_keywords:
        if kw in issue_lower:
            return "structure"
    for kw in trust_keywords:
        if kw in issue_lower:
            return "trust"
    for kw in media_keywords:
        if kw in issue_lower:
            return "media"
    for kw in technical_keywords:
        if kw in issue_lower:
            return "technical"
    for kw in freshness_keywords:
        if kw in issue_lower:
            return "freshness"

    return "structure"
