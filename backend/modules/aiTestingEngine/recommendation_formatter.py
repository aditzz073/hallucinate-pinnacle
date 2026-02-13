"""Copilot Recommendation Formatter - Transforms generic recommendations into strategic advisory messages."""


def format_citation_gap(gap: dict) -> dict:
    """
    Transform a citation gap into copilot-style advisory message.
    Preserves original structure, only enhances messaging.
    """
    gap_type = gap.get("gap", "").lower()
    detail = gap.get("detail", "")
    
    # Map generic gaps to copilot-style messages
    transformations = {
        "weak intent alignment": {
            "gap": "Content-Query Alignment Gap",
            "detail": f"Your content structure doesn't match how users phrase this type of query. AI systems prioritize pages that directly mirror search intent. {detail}",
            "impact": "High",
            "action": "Restructure your opening to directly address the query pattern."
        },
        "consider adding faq section": {
            "gap": "Missing Extractable Q&A Content",
            "detail": "Your page addresses relevant questions but lacks structured FAQ markup. AI systems favor Q&A formatted content because it maps directly to user queries.",
            "impact": "Medium",
            "action": "Add a 3-5 question FAQ section with FAQPage schema markup."
        },
        "no summary section": {
            "gap": "No Pre-Compressed Summary Available",
            "detail": "AI systems look for pre-written summaries to quote directly. Without one, they must compress your content themselves, risking key message loss.",
            "impact": "Medium",
            "action": "Add a 'Key Takeaways' section with 3-5 bullet points in the top 25% of your page."
        },
        "low authority signals": {
            "gap": "Weak Trust Indicators",
            "detail": f"Your page lacks signals that establish credibility. AI systems weight authority when selecting sources to cite. {detail}",
            "impact": "High",
            "action": "Add author credentials, organization schema, and verifiable contact information."
        },
        "missing author attribution": {
            "gap": "Anonymous Content",
            "detail": "Content without clear authorship is treated as less authoritative. AI systems prefer citing attributed sources.",
            "impact": "Medium",
            "action": "Add an author byline with credentials and link to author profile."
        },
        "limited structured data": {
            "gap": "Missing Semantic Context",
            "detail": f"Without structured data, AI systems must infer your content's purpose. This reduces citation confidence. {detail}",
            "impact": "High",
            "action": "Implement Article, HowTo, or FAQ JSON-LD schema appropriate to your content type."
        },
        "content could be expanded": {
            "gap": "Insufficient Content Depth",
            "detail": f"Your content may be too thin for AI systems to consider authoritative on this topic. {detail}",
            "impact": "Medium",
            "action": "Expand with additional sections, examples, or supporting details."
        },
        "extractability needs improvement": {
            "gap": "Low AI Extraction Readiness",
            "detail": "Your core explanation isn't clearly front-loaded or structured, making it harder for AI systems to extract a concise answer.",
            "impact": "High",
            "action": "Add a 2-3 sentence definition-style summary near the top of the page."
        },
        "content structure could be clearer": {
            "gap": "Unclear Content Architecture",
            "detail": "AI systems scan for predictable content patterns. Your structure makes key information harder to locate and extract.",
            "impact": "Medium",
            "action": "Add definition paragraphs, use descriptive headings, and organize into clear sections."
        },
        "definition paragraph needed": {
            "gap": "Missing Direct Answer",
            "detail": "For definition-style queries, AI systems look for explicit '[Topic] is...' statements. Your page lacks this pattern.",
            "impact": "High",
            "action": "Add a clear definition statement in the first paragraph: '[Topic] is a [category] that [explanation].'"
        },
        "headings don't match query": {
            "gap": "Heading-Query Mismatch",
            "detail": "Your headings don't reflect the terms users search for. AI systems use headings to quickly assess content relevance.",
            "impact": "Medium",
            "action": "Include query-related keywords in your H1 and H2 headings."
        },
    }
    
    # Find matching transformation (fuzzy match on gap type)
    for key, transform in transformations.items():
        if key in gap_type:
            return {
                "gap": transform["gap"],
                "detail": transform["detail"],
                "impact": transform["impact"],
                "action": transform["action"],
            }
    
    # Fallback: return enhanced version of original
    return {
        "gap": gap.get("gap", "Issue Detected"),
        "detail": detail if detail else "This factor may be limiting your AI citation potential.",
        "impact": "Medium",
        "action": "Review and address the identified issue to improve AI discoverability.",
    }


def format_citation_suggestion(suggestion: dict, intent: str = "") -> dict:
    """
    Transform a citation suggestion into copilot-style advisory message.
    Preserves original structure, only enhances messaging.
    """
    suggestion_type = suggestion.get("suggestion", "").lower()
    priority = suggestion.get("priority", "medium")
    detail = suggestion.get("detail", "")
    
    # Map priority to impact
    impact_map = {"high": "High", "medium": "Medium", "low": "Low"}
    impact = impact_map.get(priority, "Medium")
    
    transformations = {
        "align content with query intent": {
            "suggestion": "Restructure Content for Query Alignment",
            "detail": f"Your content's structure doesn't match how AI interprets '{intent}' queries. Pages that mirror query intent are prioritized in AI-generated answers.",
            "impact": impact,
            "action": "Rewrite your opening paragraph and headings to directly address the query pattern. Lead with the answer, not background."
        },
        "add faq section with schema markup": {
            "suggestion": "Implement FAQ Section with Schema",
            "detail": "FAQ sections are among the most extractable content types for AI. The question-answer format maps directly to how AI generates responses.",
            "impact": impact,
            "action": "Create 3-5 questions your audience commonly asks. Add FAQPage JSON-LD schema for each Q&A pair."
        },
        "add a summary or key takeaways section": {
            "suggestion": "Add Pre-Written Summary Section",
            "detail": "AI systems prefer content with ready-made summaries they can quote directly. Without one, your key messages may be lost in compression.",
            "impact": impact,
            "action": "Add a 'Key Takeaways' or 'Summary' section with 3-5 bullet points. Place it in the top third of your page."
        },
        "strengthen authority signals": {
            "suggestion": "Establish Content Authority",
            "detail": "AI systems weight source credibility heavily. Your page currently lacks the trust signals needed to compete for citations.",
            "impact": impact,
            "action": "Add author byline with credentials, Organization schema, external citations from authoritative sources, and clear contact information."
        },
        "implement comprehensive structured data": {
            "suggestion": "Add Semantic Markup",
            "detail": "Structured data helps AI systems understand your content's purpose and context. Without it, AI must guess—reducing citation likelihood.",
            "impact": impact,
            "action": "Implement JSON-LD schema appropriate to your content: Article for editorial, HowTo for guides, FAQ for Q&A, Product for commerce."
        },
        "add organization schema": {
            "suggestion": "Implement Organization Schema",
            "detail": "Organization schema establishes your brand's identity and authority. AI systems use this to attribute information correctly.",
            "impact": impact,
            "action": "Add Organization JSON-LD with name, logo, URL, and description. Link it to your content via the publisher property."
        },
        "improve heading structure": {
            "suggestion": "Optimize Heading Hierarchy",
            "detail": "AI systems rely on heading structure to navigate and extract content. Poor hierarchy makes your key points harder to find.",
            "impact": impact,
            "action": "Use exactly one H1 (page title), 3-5 H2s for major sections, and H3s for subsections. Include target keywords in headings."
        },
    }
    
    # Find matching transformation
    for key, transform in transformations.items():
        if key in suggestion_type:
            return {
                "suggestion": transform["suggestion"],
                "detail": transform["detail"],
                "priority": priority,
                "impact": transform["impact"],
                "action": transform["action"],
            }
    
    # Fallback: enhance original
    return {
        "suggestion": suggestion.get("suggestion", "Recommendation"),
        "detail": detail if detail else "Addressing this could improve your AI citation potential.",
        "priority": priority,
        "impact": impact,
        "action": detail if detail else "Review and implement the suggested improvement.",
    }


def format_geo_suggestion(suggestion: dict) -> dict:
    """
    Enhance GEO suggestion with impact level.
    GEO suggestions are already well-formatted, just add impact assessment.
    """
    issue = suggestion.get("issue", "").lower()
    
    # Map issues to impact levels
    high_impact = ["definition", "front-load", "brand attribution", "buried"]
    medium_impact = ["summary", "faq", "organization schema", "frequency"]
    low_impact = ["list", "heading", "fluff", "author"]
    
    impact = "Medium"
    if any(h in issue for h in high_impact):
        impact = "High"
    elif any(l in issue for l in low_impact):
        impact = "Low"
    
    return {
        **suggestion,
        "impact": impact
    }


def format_all_recommendations(gaps: list, suggestions: list, intent: str = "") -> dict:
    """
    Format all recommendations into copilot-style advisory messages.
    
    Returns:
        dict: {gaps: [...], suggestions: [...]}
    """
    formatted_gaps = [format_citation_gap(g) for g in gaps]
    formatted_suggestions = [format_citation_suggestion(s, intent) for s in suggestions]
    
    return {
        "gaps": formatted_gaps,
        "suggestions": formatted_suggestions,
    }


def format_geo_recommendations(geo_insights: dict) -> dict:
    """
    Format GEO insights with impact levels.
    
    Returns:
        dict: Enhanced geo_insights with impact levels on suggestions
    """
    if not geo_insights:
        return geo_insights
    
    formatted_suggestions = [
        format_geo_suggestion(s) 
        for s in geo_insights.get("improvement_suggestions", [])
    ]
    
    return {
        **geo_insights,
        "improvement_suggestions": formatted_suggestions,
    }
