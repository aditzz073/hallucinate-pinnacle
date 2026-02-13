"""Content Matcher - Phase 2 Step 2 (With Semantic Normalization)"""
import re


# Semantic equivalents for common terms
SEMANTIC_EQUIVALENTS = {
    "ecommerce": ["e-commerce", "e commerce", "electronic commerce", "online commerce", "online shopping"],
    "ai": ["artificial intelligence", "a.i.", "machine intelligence"],
    "ml": ["machine learning", "m.l."],
    "seo": ["search engine optimization", "s.e.o."],
    "crm": ["customer relationship management", "c.r.m."],
    "saas": ["software as a service", "s.a.a.s."],
    "api": ["application programming interface", "a.p.i."],
    "ui": ["user interface", "u.i."],
    "ux": ["user experience", "u.x."],
    "b2b": ["business to business", "b-to-b", "business-to-business"],
    "b2c": ["business to consumer", "b-to-c", "business-to-consumer"],
    # Product-related expansions
    "shoes": ["footwear", "sneakers", "boots", "sandals"],
    "women": ["womens", "woman", "female", "ladies", "lady"],
    "men": ["mens", "man", "male", "gentleman"],
    "kids": ["children", "child", "youth", "junior"],
    "clothing": ["apparel", "clothes", "wear", "garments"],
    "laptop": ["notebook", "computer", "pc"],
    "phone": ["smartphone", "mobile", "cellphone"],
}


def _normalize_text(text: str) -> str:
    """Normalize text for semantic matching."""
    text = text.lower()
    # Normalize common variations
    text = re.sub(r'e[\-\s]?commerce', 'ecommerce', text)
    text = re.sub(r'a\.?i\.?(?:\s|$)', 'artificial intelligence ', text)
    text = re.sub(r'machine\s+learning', 'machinelearning', text)
    text = re.sub(r'[\-_]', ' ', text)  # Replace hyphens/underscores with spaces
    return text


def _expand_tokens_with_equivalents(tokens: list) -> list:
    """Expand tokens with semantic equivalents for better matching."""
    expanded = set(tokens)
    for token in tokens:
        token_lower = token.lower()
        # Check if token is a key
        if token_lower in SEMANTIC_EQUIVALENTS:
            expanded.update(SEMANTIC_EQUIVALENTS[token_lower])
        # Check if token is in any equivalent list
        for key, equivalents in SEMANTIC_EQUIVALENTS.items():
            if token_lower in equivalents or token_lower == key:
                expanded.add(key)
                expanded.update(equivalents)
    return list(expanded)


def calculate_content_match(parsed: dict, tokens: list, intent: str) -> dict:
    headings = parsed.get("headings", {})
    all_headings_text = ""
    for level in range(1, 7):
        for h in headings.get(f"h{level}", []):
            all_headings_text += " " + h.lower()
    
    # Normalize texts
    body_lower = _normalize_text(parsed.get("body_text", ""))
    title_lower = _normalize_text(parsed.get("title", ""))
    meta_lower = _normalize_text(parsed.get("meta_description", ""))
    headings_lower = _normalize_text(all_headings_text)
    
    # Expand tokens with semantic equivalents
    expanded_tokens = _expand_tokens_with_equivalents(tokens)
    
    # Heading relevance: % of query tokens (or equivalents) found in headings
    heading_matches = sum(1 for t in expanded_tokens if t.lower() in headings_lower)
    # Use original token count for percentage (more generous)
    heading_relevance = (heading_matches / len(tokens) * 100) if tokens else 0
    # Cap at 100 but allow > 100% matches to give max score
    heading_relevance = min(100, heading_relevance)
    
    # Keyword overlap: % of tokens in body (use expanded for better recall)
    body_matches = sum(1 for t in expanded_tokens if t.lower() in body_lower)
    keyword_overlap = (body_matches / len(tokens) * 100) if tokens else 0
    keyword_overlap = min(100, keyword_overlap)
    
    # Title relevance
    title_matches = sum(1 for t in expanded_tokens if t.lower() in title_lower)
    title_relevance = (title_matches / len(tokens) * 100) if tokens else 0
    title_relevance = min(100, title_relevance)
    
    # Meta relevance
    meta_matches = sum(1 for t in expanded_tokens if t.lower() in meta_lower)
    meta_relevance = (meta_matches / len(tokens) * 100) if tokens else 0
    meta_relevance = min(100, meta_relevance)
    
    # FAQ presence and relevance
    faq_items = parsed.get("faq_items", [])
    has_faq = len(faq_items) > 0
    faq_relevance = 0
    if has_faq and tokens:
        for item in faq_items:
            q_lower = _normalize_text(item.get("question", ""))
            matches = sum(1 for t in expanded_tokens if t.lower() in q_lower)
            faq_relevance = max(faq_relevance, matches / len(tokens) * 100)
    faq_relevance = min(100, faq_relevance)
    
    # Definition block detection (expanded patterns)
    has_definition = False
    definition_patterns = [
        r"\bis\s+(?:a|an|the)\s+\w+",
        r"\brefers\s+to\b",
        r"\bdefined\s+as\b",
        r"\bmeans\b",
        r"\bcan\s+be\s+described\s+as\b",
        r"\binvolves\b",
        r"\brepresents\b",
    ]
    first_paragraphs = body_lower[:2000]  # Extended from 1500
    for p in definition_patterns:
        if re.search(p, first_paragraphs):
            has_definition = True
            break
    
    # Summary block detection (expanded signals)
    has_summary = False
    summary_signals = [
        "in summary", "to summarize", "key takeaways", "takeaways",
        "tldr", "tl;dr", "overview", "at a glance", "in brief",
        "summary", "key points", "main points", "highlights",
        "bottom line", "in conclusion", "to conclude"
    ]
    for s in summary_signals:
        if s in body_lower:
            has_summary = True
            break
    
    # Also check headings for summary indicators
    if not has_summary:
        for s in ["summary", "overview", "takeaways", "conclusion", "key points"]:
            if s in headings_lower:
                has_summary = True
                break
    
    return {
        "heading_relevance": heading_relevance,
        "keyword_overlap": keyword_overlap,
        "title_relevance": title_relevance,
        "meta_relevance": meta_relevance,
        "has_faq": has_faq,
        "faq_relevance": faq_relevance,
        "has_definition": has_definition,
        "has_summary": has_summary,
        # New fields for explainability
        "tokens_used": tokens,
        "tokens_expanded": len(expanded_tokens),
    }
