"""GEO - Summarization Resilience Calculator"""
import re


def calculate_summarization_resilience(parsed: dict) -> dict:
    """
    Calculate how well content survives AI compression/summarization.
    
    Simulates AI compression (reducing to 15-20% of original):
    - Is key definition in first 25% of page?
    - Is brand mentioned near core explanation?
    - Are main ideas repeated clearly?
    - Is information front-loaded?
    
    Returns:
        dict: {summarization_resilience: int, compression_weaknesses: list}
    """
    score = 0.0
    weaknesses = []
    
    body_text = parsed.get("body_text", "")
    title = parsed.get("title", "")
    meta_description = parsed.get("meta_description", "")
    headings = parsed.get("headings", {})
    word_count = parsed.get("word_count", 0)
    
    if word_count == 0:
        return {
            "summarization_resilience": 0,
            "compression_weaknesses": [{"weakness": "No content", "detail": "Page has no content to analyze", "severity": "critical"}]
        }
    
    # 1. Key Definition Position (0-30 points)
    definition_score, definition_weaknesses = _score_definition_position(body_text, word_count)
    score += definition_score
    weaknesses.extend(definition_weaknesses)
    
    # 2. Information Front-Loading (0-25 points)
    frontload_score, frontload_weaknesses = _score_front_loading(body_text, title, meta_description, headings)
    score += frontload_score
    weaknesses.extend(frontload_weaknesses)
    
    # 3. Key Idea Repetition (0-20 points)
    repetition_score, repetition_weaknesses = _score_idea_repetition(body_text, title, headings)
    score += repetition_score
    weaknesses.extend(repetition_weaknesses)
    
    # 4. Filler Content Ratio (0-15 points)
    filler_score, filler_weaknesses = _score_filler_ratio(body_text, word_count)
    score += filler_score
    weaknesses.extend(filler_weaknesses)
    
    # 5. Summary Blocks Presence (0-10 points)
    summary_score, summary_weaknesses = _score_summary_blocks(body_text, headings)
    score += summary_score
    weaknesses.extend(summary_weaknesses)
    
    return {
        "summarization_resilience": max(0, min(100, int(round(score)))),
        "compression_weaknesses": weaknesses
    }


def _score_definition_position(body_text: str, word_count: int) -> tuple:
    """Score whether key definitions appear in first 25% of content."""
    score = 0.0
    weaknesses = []
    
    # Calculate first quarter position
    quarter_length = len(body_text) // 4
    first_quarter = body_text[:quarter_length].lower()
    full_text = body_text.lower()
    
    # Definition patterns
    definition_patterns = [
        r'\b\w+\s+is\s+(?:a|an|the)\s+\w+',
        r'\b\w+\s+refers\s+to\b',
        r'\b\w+\s+means\b',
        r'defined\s+as\b',
    ]
    
    # Check if definitions are in first quarter
    definitions_in_first_quarter = 0
    total_definitions = 0
    
    for pattern in definition_patterns:
        first_q_matches = len(re.findall(pattern, first_quarter))
        total_matches = len(re.findall(pattern, full_text))
        definitions_in_first_quarter += first_q_matches
        total_definitions += total_matches
    
    if total_definitions > 0:
        first_quarter_ratio = definitions_in_first_quarter / total_definitions
        
        if first_quarter_ratio >= 0.5:
            score += 30
        elif first_quarter_ratio >= 0.3:
            score += 20
            weaknesses.append({
                "weakness": "Definitions not front-loaded",
                "detail": "Key definitions should appear in the first 25% of content for AI to extract them",
                "severity": "medium"
            })
        else:
            score += 10
            weaknesses.append({
                "weakness": "Definitions buried in content",
                "detail": "Core definitions appear too late - AI summaries may miss them",
                "severity": "high"
            })
    else:
        weaknesses.append({
            "weakness": "No clear definitions found",
            "detail": "Content lacks clear definition statements that AI can extract",
            "severity": "high"
        })
    
    return score, weaknesses


def _score_front_loading(body_text: str, title: str, meta_description: str, headings: dict) -> tuple:
    """Score how well key information is front-loaded."""
    score = 0.0
    weaknesses = []
    
    # Get key terms from title and H1
    title_lower = title.lower()
    h1_text = ' '.join(headings.get('h1', [])).lower()
    key_terms = set(re.findall(r'\b\w{4,}\b', title_lower + ' ' + h1_text))
    key_terms -= {'this', 'that', 'with', 'from', 'what', 'when', 'where', 'which', 'your', 'will', 'have', 'been'}
    
    if not key_terms:
        return 10, weaknesses
    
    # Check first 500 characters for key term density
    first_500 = body_text[:500].lower()
    first_paragraph_terms = sum(1 for term in key_terms if term in first_500)
    key_term_density = first_paragraph_terms / len(key_terms) if key_terms else 0
    
    if key_term_density >= 0.6:
        score += 25
    elif key_term_density >= 0.4:
        score += 18
        weaknesses.append({
            "weakness": "Incomplete front-loading",
            "detail": "Not all key terms appear in the opening content",
            "severity": "low"
        })
    elif key_term_density >= 0.2:
        score += 10
        weaknesses.append({
            "weakness": "Poor front-loading",
            "detail": "Key terms from title are not prominently featured in opening paragraphs",
            "severity": "medium"
        })
    else:
        score += 5
        weaknesses.append({
            "weakness": "Key information buried",
            "detail": "Opening content doesn't mention key topics from the title",
            "severity": "high"
        })
    
    # Check if meta description content is in first section
    if meta_description:
        meta_words = set(re.findall(r'\b\w{4,}\b', meta_description.lower()))
        meta_words -= {'this', 'that', 'with', 'from'}
        meta_in_first = sum(1 for w in meta_words if w in first_500)
        if meta_in_first >= len(meta_words) * 0.5:
            score += 5
    
    return score, weaknesses


def _score_idea_repetition(body_text: str, title: str, headings: dict) -> tuple:
    """Score whether main ideas are reinforced throughout content."""
    score = 0.0
    weaknesses = []
    
    # Extract main topic words from title
    title_words = set(re.findall(r'\b\w{4,}\b', title.lower()))
    title_words -= {'this', 'that', 'with', 'from', 'what', 'your', 'will', 'have', 'been', 'best', 'guide', 'complete'}
    
    if not title_words:
        return 10, weaknesses
    
    # Check repetition across sections
    text_lower = body_text.lower()
    text_length = len(text_lower)
    
    # Split into thirds
    third = text_length // 3
    first_third = text_lower[:third]
    middle_third = text_lower[third:2*third]
    last_third = text_lower[2*third:]
    
    # Count key term occurrences in each section
    first_count = sum(first_third.count(term) for term in title_words)
    middle_count = sum(middle_third.count(term) for term in title_words)
    last_count = sum(last_third.count(term) for term in title_words)
    
    # Good: terms appear in all sections
    sections_with_terms = sum(1 for c in [first_count, middle_count, last_count] if c > 0)
    
    if sections_with_terms == 3 and min(first_count, middle_count, last_count) >= 1:
        score += 20
    elif sections_with_terms >= 2:
        score += 14
        weaknesses.append({
            "weakness": "Inconsistent topic reinforcement",
            "detail": "Main topics not mentioned consistently throughout all sections",
            "severity": "low"
        })
    else:
        score += 6
        weaknesses.append({
            "weakness": "Topic only mentioned once",
            "detail": "Main ideas are not repeated - AI may lose them in compression",
            "severity": "medium"
        })
    
    return score, weaknesses


def _score_filler_ratio(body_text: str, word_count: int) -> tuple:
    """Score ratio of substantive vs filler content."""
    score = 0.0
    weaknesses = []
    
    # Common filler phrases that add no value for AI extraction
    filler_phrases = [
        r'in order to', r'as a matter of fact', r'at the end of the day',
        r'it goes without saying', r'needless to say', r'for what it\'s worth',
        r'to be honest', r'the fact of the matter is', r'at this point in time',
        r'in this day and age', r'when all is said and done', r'in the final analysis',
        r'for all intents and purposes', r'by and large', r'more or less',
        r'as you can see', r'as mentioned', r'as stated', r'as we know',
    ]
    
    text_lower = body_text.lower()
    filler_count = sum(len(re.findall(phrase, text_lower)) for phrase in filler_phrases)
    
    # Calculate density
    filler_density = filler_count / (word_count / 100) if word_count > 0 else 0
    
    if filler_density < 1:
        score += 15
    elif filler_density < 2:
        score += 10
        weaknesses.append({
            "weakness": "Some filler content",
            "detail": "Content contains filler phrases that won't survive compression",
            "severity": "low"
        })
    elif filler_density < 4:
        score += 5
        weaknesses.append({
            "weakness": "High filler content",
            "detail": "Too many filler phrases dilute core message",
            "severity": "medium"
        })
    else:
        weaknesses.append({
            "weakness": "Excessive filler content",
            "detail": "Content is bloated with filler - core message will be lost in AI summarization",
            "severity": "high"
        })
    
    return score, weaknesses


def _score_summary_blocks(body_text: str, headings: dict) -> tuple:
    """Score presence of summary/conclusion blocks."""
    score = 0.0
    weaknesses = []
    
    text_lower = body_text.lower()
    all_headings = ' '.join([' '.join(headings.get(f'h{i}', [])) for i in range(1, 5)]).lower()
    
    # Check for summary-style sections
    summary_indicators = ['summary', 'conclusion', 'key takeaways', 'takeaways', 
                          'in summary', 'to summarize', 'key points', 'bottom line']
    
    has_summary_heading = any(ind in all_headings for ind in summary_indicators)
    has_summary_content = any(ind in text_lower for ind in summary_indicators)
    
    if has_summary_heading:
        score += 10
    elif has_summary_content:
        score += 5
        weaknesses.append({
            "weakness": "No dedicated summary section",
            "detail": "Adding a 'Key Takeaways' section improves survival in AI compression",
            "severity": "low"
        })
    else:
        weaknesses.append({
            "weakness": "Missing summary/conclusion",
            "detail": "No summary section - AI has no pre-compressed version to use",
            "severity": "medium"
        })
    
    return score, weaknesses
