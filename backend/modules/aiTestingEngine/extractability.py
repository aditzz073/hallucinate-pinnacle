"""Extractability Scorer - Phase 2 Step 3 (Balanced Scoring)"""
import re


def calculate_extractability(parsed: dict, content_match: dict) -> int:
    """
    Calculate extractability score using weighted, non-binary scoring.
    
    Balanced model (0-100):
    - Clear definition-style opening: up to 30 pts
    - Heading alignment with content: up to 20 pts
    - Informational structure: up to 15 pts
    - Concise explanatory paragraphs: up to 15 pts
    - Logical heading structure: up to 10 pts
    - Structured content (lists/segments): up to 10 pts
    """
    score = 0.0
    factors = []
    
    body = parsed.get("body_text", "")
    body_lower = body.lower()
    headings = parsed.get("headings", {})
    word_count = parsed.get("word_count", 0)
    
    # 1. Definition-style opening (0-30 pts) - Graduated scoring
    definition_score, def_factor = _score_definition_opening(body_lower, content_match)
    score += definition_score
    if def_factor:
        factors.append(def_factor)
    
    # 2. Heading semantic alignment (0-20 pts) - Case-insensitive, normalized
    heading_score, heading_factor = _score_heading_alignment(headings, content_match)
    score += heading_score
    if heading_factor:
        factors.append(heading_factor)
    
    # 3. Informational intent alignment (0-15 pts)
    intent_score, intent_factor = _score_informational_structure(parsed, content_match)
    score += intent_score
    if intent_factor:
        factors.append(intent_factor)
    
    # 4. Concise explanatory paragraphs (0-15 pts) - No lists required
    paragraph_score, para_factor = _score_explanatory_paragraphs(body, word_count)
    score += paragraph_score
    if para_factor:
        factors.append(para_factor)
    
    # 5. Logical heading structure (0-10 pts)
    structure_score, struct_factor = _score_heading_structure(headings)
    score += structure_score
    if struct_factor:
        factors.append(struct_factor)
    
    # 6. Structured content - lists/segments (0-10 pts) - Bonus, not required
    list_score, list_factor = _score_structured_content(body, parsed)
    score += list_score
    if list_factor:
        factors.append(list_factor)
    
    final_score = max(0, min(100, int(round(score))))
    
    # Store factors for explainability (accessible via content_match extension)
    content_match["_extractability_factors"] = factors
    content_match["_extractability_score"] = final_score
    
    return final_score


def _score_definition_opening(body_lower: str, content_match: dict) -> tuple:
    """Score definition-style opening paragraph (0-30 pts)."""
    score = 0.0
    factor = None
    
    # Check first 2000 chars for definition patterns
    first_section = body_lower[:2000]
    
    # Strong definition patterns
    strong_patterns = [
        r"\bis\s+(?:a|an|the)\s+\w+",  # "X is a/an/the Y"
        r"\brefers\s+to\b",
        r"\bdefined\s+as\b",
        r"\bcan\s+be\s+described\s+as\b",
    ]
    
    # Weaker but valid explanatory patterns
    weak_patterns = [
        r"\bmeans\b",
        r"\binvolves\b",
        r"\brepresents\b",
        r"\bconsists\s+of\b",
        r"\bincludes\b",
    ]
    
    strong_count = sum(1 for p in strong_patterns if re.search(p, first_section))
    weak_count = sum(1 for p in weak_patterns if re.search(p, first_section))
    
    # Also check content_match for backward compatibility
    has_definition = content_match.get("has_definition", False)
    
    if strong_count >= 2 or (strong_count >= 1 and has_definition):
        score = 30
        factor = {"type": "positive", "reason": "Clear definition paragraph in opening", "points": 30}
    elif strong_count >= 1:
        score = 22
        factor = {"type": "positive", "reason": "Definition-style explanation present", "points": 22}
    elif weak_count >= 2:
        score = 15
        factor = {"type": "partial", "reason": "Explanatory content found, could be clearer", "points": 15}
    elif weak_count >= 1 or has_definition:
        score = 10
        factor = {"type": "partial", "reason": "Some explanatory structure detected", "points": 10}
    else:
        factor = {"type": "missing", "reason": "No clear definition paragraph near top", "points": 0}
    
    return score, factor


def _score_heading_alignment(headings: dict, content_match: dict) -> tuple:
    """Score heading semantic alignment (0-20 pts)."""
    score = 0.0
    factor = None
    
    heading_relevance = content_match.get("heading_relevance", 0)
    
    # Graduated scoring instead of binary
    if heading_relevance >= 80:
        score = 20
        factor = {"type": "positive", "reason": "Headings strongly aligned with query", "points": 20}
    elif heading_relevance >= 50:
        score = 15
        factor = {"type": "positive", "reason": "Good heading-query alignment", "points": 15}
    elif heading_relevance >= 30:
        score = 10
        factor = {"type": "partial", "reason": "Moderate heading relevance", "points": 10}
    elif heading_relevance >= 10:
        score = 5
        factor = {"type": "partial", "reason": "Some heading alignment detected", "points": 5}
    else:
        factor = {"type": "missing", "reason": "Query not reflected in headings", "points": 0}
    
    return score, factor


def _score_informational_structure(parsed: dict, content_match: dict) -> tuple:
    """Score informational intent alignment (0-15 pts)."""
    score = 0.0
    factor = None
    
    has_summary = content_match.get("has_summary", False)
    has_faq = content_match.get("has_faq", False)
    faq_count = len(parsed.get("faq_items", []))
    
    # Summary or FAQ contributes, but neither is required
    if has_summary and faq_count >= 3:
        score = 15
        factor = {"type": "positive", "reason": "Summary section and FAQ present", "points": 15}
    elif has_summary:
        score = 12
        factor = {"type": "positive", "reason": "Summary/overview section found", "points": 12}
    elif faq_count >= 3:
        score = 12
        factor = {"type": "positive", "reason": f"FAQ section with {faq_count} items", "points": 12}
    elif has_faq:
        score = 8
        factor = {"type": "partial", "reason": "Basic FAQ section present", "points": 8}
    else:
        # Don't penalize - just no bonus
        score = 3  # Small base credit for any structured content
        factor = {"type": "neutral", "reason": "No summary/FAQ (optional for well-structured prose)", "points": 3}
    
    return score, factor


def _score_explanatory_paragraphs(body: str, word_count: int) -> tuple:
    """Score concise explanatory paragraphs under 120 words (0-15 pts)."""
    score = 0.0
    factor = None
    
    if word_count == 0:
        return 0, {"type": "missing", "reason": "No content", "points": 0}
    
    # Split into paragraphs
    paragraphs = [p.strip() for p in body.split('\n\n') if p.strip()]
    if not paragraphs:
        paragraphs = [p.strip() for p in body.split('\n') if len(p.strip()) > 50]
    
    # Count concise paragraphs (under 120 words but substantive - over 20 words)
    concise_paragraphs = 0
    for p in paragraphs:
        word_len = len(p.split())
        if 20 <= word_len <= 120:
            concise_paragraphs += 1
    
    # Calculate average sentence length
    sentences = re.split(r'[.!?]+', body)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    avg_sentence_len = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 50
    
    # Score based on conciseness
    if concise_paragraphs >= 5 and avg_sentence_len <= 20:
        score = 15
        factor = {"type": "positive", "reason": "Well-structured concise paragraphs", "points": 15}
    elif concise_paragraphs >= 3:
        score = 12
        factor = {"type": "positive", "reason": f"{concise_paragraphs} concise explanatory paragraphs", "points": 12}
    elif concise_paragraphs >= 1 or avg_sentence_len <= 25:
        score = 8
        factor = {"type": "partial", "reason": "Readable paragraph structure", "points": 8}
    elif word_count >= 300:
        score = 4
        factor = {"type": "partial", "reason": "Content present but could be more concise", "points": 4}
    else:
        factor = {"type": "missing", "reason": "Content too sparse or poorly structured", "points": 0}
    
    return score, factor


def _score_heading_structure(headings: dict) -> tuple:
    """Score logical heading hierarchy (0-10 pts)."""
    score = 0.0
    factor = None
    
    h1_count = len(headings.get("h1", []))
    h2_count = len(headings.get("h2", []))
    h3_count = len(headings.get("h3", []))
    
    # Ideal: 1 H1, multiple H2s, some H3s
    has_good_h1 = h1_count == 1
    has_good_h2 = h2_count >= 2
    has_h3 = h3_count >= 1
    
    if has_good_h1 and has_good_h2 and has_h3:
        score = 10
        factor = {"type": "positive", "reason": "Excellent heading hierarchy (H1→H2→H3)", "points": 10}
    elif has_good_h2:
        score = 7
        factor = {"type": "positive", "reason": f"Good structure with {h2_count} H2 sections", "points": 7}
    elif h2_count >= 1:
        score = 4
        factor = {"type": "partial", "reason": "Basic heading structure", "points": 4}
    elif h1_count >= 1:
        score = 2
        factor = {"type": "partial", "reason": "Has main heading only", "points": 2}
    else:
        factor = {"type": "missing", "reason": "Poor or missing heading hierarchy", "points": 0}
    
    return score, factor


def _score_structured_content(body: str, parsed: dict) -> tuple:
    """Score structured content like lists (0-10 pts) - Bonus, not required."""
    score = 0.0
    factor = None
    
    # Check for list patterns
    list_patterns = re.findall(r"(?:^|\n)\s*(?:\d+[\.\)]\s|\-\s|\*\s|•\s)", body)
    list_count = len(list_patterns)
    
    # Also check for FAQ as structured content
    faq_count = len(parsed.get("faq_items", []))
    
    if list_count >= 5 or faq_count >= 5:
        score = 10
        factor = {"type": "positive", "reason": "Well-structured lists/sections for easy extraction", "points": 10}
    elif list_count >= 3 or faq_count >= 3:
        score = 7
        factor = {"type": "positive", "reason": "Good use of lists/structured content", "points": 7}
    elif list_count >= 1 or faq_count >= 1:
        score = 4
        factor = {"type": "partial", "reason": "Some structured content present", "points": 4}
    else:
        # No penalty - prose can be highly extractable too
        score = 2  # Small base for any content
        factor = {"type": "neutral", "reason": "Prose format (lists optional)", "points": 2}
    
    return score, factor


def get_extractability_explanation(content_match: dict, score: int) -> dict:
    """
    Generate explainability output for extractability score.
    
    Returns:
        dict: {contributingFactors, penalties, whyScoreWasGiven}
    """
    factors = content_match.get("_extractability_factors", [])
    
    contributing = [f for f in factors if f["type"] in ("positive", "partial")]
    penalties = [f for f in factors if f["type"] == "missing" and f["points"] == 0]
    
    # Generate clear explanation
    if score >= 70:
        explanation = "Content is highly extractable for AI with clear structure and definitions."
    elif score >= 50:
        explanation = "Content has good extractability with room for improvement in structure."
    elif score >= 30:
        explanation = "Content is moderately extractable. Consider adding clearer definitions or structure."
    else:
        explanation = "Content structure makes AI extraction difficult. Add definition paragraphs and clearer headings."
    
    return {
        "contributingFactors": [
            {"factor": f["reason"], "points": f["points"]} 
            for f in contributing
        ],
        "penalties": [
            {"issue": f["reason"]} 
            for f in penalties
        ],
        "whyScoreWasGiven": explanation
    }
