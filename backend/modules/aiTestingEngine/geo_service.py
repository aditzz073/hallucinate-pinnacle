"""GEO (Generative Engine Optimization) Service - Main Orchestrator"""
from modules.aiTestingEngine.geo_generative_readiness import calculate_generative_readiness
from modules.aiTestingEngine.geo_summarization_resilience import calculate_summarization_resilience
from modules.aiTestingEngine.geo_brand_retention import calculate_brand_retention


def calculate_geo_score(
    generative_readiness: int,
    summarization_resilience: int,
    brand_retention: int
) -> int:
    """
    Calculate overall GEO score using weighted model.
    
    Weights:
    - Generative Readiness: 40%
    - Summarization Resilience: 30%
    - Brand Retention Probability: 30%
    
    Returns:
        int: GEO score (0-100)
    """
    weighted = (
        generative_readiness * 0.40 +
        summarization_resilience * 0.30 +
        brand_retention * 0.30
    )
    return max(0, min(100, int(round(weighted))))


def run_geo_analysis(parsed: dict) -> dict:
    """
    Run complete GEO analysis on parsed HTML content.
    
    Returns comprehensive GEO metrics including:
    - Individual scores (generative readiness, summarization resilience, brand retention)
    - Overall GEO score
    - Strengths and weaknesses
    - Improvement suggestions
    """
    
    # Calculate individual GEO components
    readiness_result = calculate_generative_readiness(parsed)
    resilience_result = calculate_summarization_resilience(parsed)
    brand_result = calculate_brand_retention(parsed)
    
    generative_readiness = readiness_result["generative_readiness"]
    summarization_resilience = resilience_result["summarization_resilience"]
    brand_retention = brand_result["brand_retention_probability"]
    
    # Calculate overall GEO score
    geo_score = calculate_geo_score(
        generative_readiness,
        summarization_resilience,
        brand_retention
    )
    
    # Generate insights
    geo_insights = generate_geo_insights(
        readiness_result,
        resilience_result,
        brand_result,
        geo_score
    )
    
    return {
        "geo_score": geo_score,
        "generative_readiness": generative_readiness,
        "summarization_resilience": summarization_resilience,
        "brand_retention_probability": brand_retention,
        "detected_brand": brand_result.get("detected_brand"),
        "geo_breakdown": {
            "generative_factors": readiness_result["generative_factors"],
            "compression_weaknesses": resilience_result["compression_weaknesses"],
            "brand_gaps": brand_result["brand_gaps"],
        },
        "geo_insights": geo_insights,
    }


def generate_geo_insights(
    readiness_result: dict,
    resilience_result: dict,
    brand_result: dict,
    geo_score: int
) -> dict:
    """Generate strengths, weaknesses, and improvement suggestions for GEO."""
    
    strengths = []
    weaknesses = []
    suggestions = []
    
    # Analyze generative readiness factors
    for factor in readiness_result.get("generative_factors", []):
        if factor["impact"] == "positive":
            strengths.append({
                "area": "Generative Readiness",
                "strength": factor["factor"],
                "detail": factor["detail"]
            })
        elif factor["impact"] == "negative":
            weaknesses.append({
                "area": "Generative Readiness",
                "weakness": factor["factor"],
                "detail": factor["detail"]
            })
    
    # Analyze compression weaknesses
    for weakness in resilience_result.get("compression_weaknesses", []):
        weaknesses.append({
            "area": "Summarization",
            "weakness": weakness["weakness"],
            "detail": weakness["detail"],
            "severity": weakness.get("severity", "medium")
        })
    
    # Analyze brand gaps
    for gap in brand_result.get("brand_gaps", []):
        weaknesses.append({
            "area": "Brand Retention",
            "weakness": gap["gap"],
            "detail": gap["detail"],
            "severity": gap.get("severity", "medium")
        })
    
    # Generate improvement suggestions based on weaknesses
    suggestions = _generate_improvement_suggestions(
        readiness_result,
        resilience_result,
        brand_result
    )
    
    # Sort weaknesses by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    weaknesses.sort(key=lambda x: severity_order.get(x.get("severity", "medium"), 2))
    
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_suggestions": suggestions
    }


def _generate_improvement_suggestions(
    readiness_result: dict,
    resilience_result: dict,
    brand_result: dict
) -> list:
    """Generate actionable GEO improvement suggestions."""
    
    suggestions = []
    
    # Track which issues we've addressed to avoid duplicates
    addressed = set()
    
    # Analyze generative readiness gaps
    for factor in readiness_result.get("generative_factors", []):
        if factor["impact"] == "negative":
            factor_name = factor["factor"].lower()
            
            if "definition" in factor_name and "definition" not in addressed:
                suggestions.append({
                    "issue": "Missing clear definitions",
                    "why_it_matters_for_generation": "AI engines extract 'X is...' statements to form direct answers. Without clear definitions, your content is less likely to be quoted.",
                    "how_to_fix": "Add clear definition statements in the first paragraph using patterns like '[Topic] is a [category] that [explanation].' or '[Topic] refers to [explanation].'"
                })
                addressed.add("definition")
            
            if "summary" in factor_name and "summary" not in addressed:
                suggestions.append({
                    "issue": "No summary section at top",
                    "why_it_matters_for_generation": "AI engines prefer content with pre-written summaries they can directly use or adapt. Content without summaries requires more compression.",
                    "how_to_fix": "Add a 'Key Takeaways', 'Summary', or 'TL;DR' section within the first 25% of your page. Use 3-5 bullet points highlighting main insights."
                })
                addressed.add("summary")
            
            if "faq" in factor_name and "faq" not in addressed:
                suggestions.append({
                    "issue": "No FAQ section",
                    "why_it_matters_for_generation": "FAQ sections are highly extractable by AI because they're already in question-answer format. They're often used for direct quotations.",
                    "how_to_fix": "Add an FAQ section with 3-5 common questions. Include FAQPage JSON-LD schema markup for each Q&A pair."
                })
                addressed.add("faq")
            
            if "list" in factor_name and "list" not in addressed:
                suggestions.append({
                    "issue": "Minimal list usage",
                    "why_it_matters_for_generation": "Bullet points and numbered lists are preferred by AI for generating structured answers. They're easier to extract than paragraphs.",
                    "how_to_fix": "Convert key information into bullet points or numbered lists. Aim for at least 2-3 list sections per page."
                })
                addressed.add("list")
            
            if "heading" in factor_name and "heading" not in addressed:
                suggestions.append({
                    "issue": "Poor heading hierarchy",
                    "why_it_matters_for_generation": "AI uses headings to understand content structure and find relevant sections. Poor hierarchy makes content harder to navigate and extract.",
                    "how_to_fix": "Structure content with one H1 (page title), multiple H2s (main sections), and H3s (subsections). Include target keywords in headings."
                })
                addressed.add("heading")
            
            if "fluff" in factor_name and "fluff" not in addressed:
                suggestions.append({
                    "issue": "High fluff density",
                    "why_it_matters_for_generation": "Filler words and phrases get stripped during AI compression. If your core message is buried in fluff, it may be lost entirely.",
                    "how_to_fix": "Remove filler phrases like 'basically', 'actually', 'in order to', 'at the end of the day'. Write direct, concise sentences."
                })
                addressed.add("fluff")
    
    # Analyze compression weaknesses
    for weakness in resilience_result.get("compression_weaknesses", []):
        weakness_name = weakness["weakness"].lower()
        
        if "front-load" in weakness_name and "frontload" not in addressed:
            suggestions.append({
                "issue": "Key information not front-loaded",
                "why_it_matters_for_generation": "AI often uses only the first portion of content. If your main points are buried, they won't make it into generated answers.",
                "how_to_fix": "Put your most important information in the first paragraph. The first 500 characters should contain your key message and main keywords."
            })
            addressed.add("frontload")
        
        if "buried" in weakness_name and "buried" not in addressed:
            suggestions.append({
                "issue": "Definitions buried in content",
                "why_it_matters_for_generation": "AI compression reduces content to 15-20%. Definitions placed late in content are likely to be cut.",
                "how_to_fix": "Move core definitions to the opening paragraph. Start with 'What is [topic]?' answered immediately."
            })
            addressed.add("buried")
    
    # Analyze brand retention gaps
    for gap in brand_result.get("brand_gaps", []):
        gap_name = gap["gap"].lower()
        
        if "frequency" in gap_name and "brand_frequency" not in addressed:
            suggestions.append({
                "issue": "Low brand frequency",
                "why_it_matters_for_generation": "If your brand name appears infrequently, AI may generate answers without attribution. Frequency reinforces association.",
                "how_to_fix": "Mention your brand name naturally throughout content, aiming for at least once per major section. Don't keyword stuff—keep it natural."
            })
            addressed.add("brand_frequency")
        
        if "attribution" in gap_name and "attribution" not in addressed:
            suggestions.append({
                "issue": "No brand attribution patterns",
                "why_it_matters_for_generation": "Phrases like 'According to [Brand]...' are highly likely to be preserved in AI-generated content because they provide source attribution.",
                "how_to_fix": "Use attribution phrases: 'According to [Your Brand]...', '[Brand] recommends...', '[Brand]'s research shows...'. Add 2-3 such phrases per page."
            })
            addressed.add("attribution")
        
        if "organization schema" in gap_name and "org_schema" not in addressed:
            suggestions.append({
                "issue": "Missing Organization schema",
                "why_it_matters_for_generation": "Organization schema helps AI understand content ownership. It reinforces that this content comes from your brand.",
                "how_to_fix": "Add Organization JSON-LD schema with name, logo, URL, and description. Link it to your content via publisher property."
            })
            addressed.add("org_schema")
        
        if "author" in gap_name and "author_info" not in addressed:
            suggestions.append({
                "issue": "No author attribution",
                "why_it_matters_for_generation": "Author information adds credibility and ownership. AI may cite content more readily when authorship is clear.",
                "how_to_fix": "Add author byline with name and credentials. Include Person schema and link author to organization."
            })
            addressed.add("author_info")
        
        if "positioning" in gap_name and "brand_position" not in addressed:
            suggestions.append({
                "issue": "Poor brand positioning",
                "why_it_matters_for_generation": "Brand should appear near key definitions and explanations so AI associates your brand with the answer.",
                "how_to_fix": "Place brand name within 100 characters of key definitions. Example: '[Brand] defines [topic] as...' or 'According to [Brand], [topic] is...'"
            })
            addressed.add("brand_position")
    
    # Sort by importance (based on which area the suggestion addresses)
    priority_map = {
        "Missing clear definitions": 1,
        "No summary section at top": 2,
        "No brand attribution patterns": 3,
        "Key information not front-loaded": 4,
        "No FAQ section": 5,
        "Missing Organization schema": 6,
        "Low brand frequency": 7,
        "Poor heading hierarchy": 8,
        "Minimal list usage": 9,
        "High fluff density": 10,
        "No author attribution": 11,
    }
    
    suggestions.sort(key=lambda x: priority_map.get(x["issue"], 99))
    
    return suggestions[:8]  # Return top 8 most important suggestions
