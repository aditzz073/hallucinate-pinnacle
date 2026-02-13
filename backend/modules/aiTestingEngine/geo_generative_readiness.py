"""GEO - Generative Readiness Score Calculator"""
import re


def calculate_generative_readiness(parsed: dict) -> dict:
    """
    Calculate how ready content is for AI generative answers.
    
    Score based on:
    - Presence of clear definition blocks OR product descriptions
    - Summary section near top of page OR key product info
    - FAQ structured sections
    - Bullet/numbered lists (features, specs)
    - Logical heading hierarchy
    - Low fluff density
    - Product-specific attributes (for e-commerce pages)
    
    Returns:
        dict: {generative_readiness: int, generative_factors: list}
    """
    score = 0.0
    factors = []
    body_text = parsed.get("body_text", "")
    headings = parsed.get("headings", {})
    faq_items = parsed.get("faq_items", [])
    word_count = parsed.get("word_count", 0)
    
    # Detect if this is a product/e-commerce page
    is_product_page, product_signals = _detect_product_page(parsed, body_text)
    
    if is_product_page:
        factors.append({
            "factor": "Product page detected", 
            "impact": "neutral", 
            "detail": f"E-commerce content type: {', '.join(product_signals)}"
        })
        
        # Use product-specific scoring
        score, product_factors = _score_product_page(parsed, body_text, headings, faq_items, word_count)
        factors.extend(product_factors)
    else:
        # Use traditional informational content scoring
        # 1. Clear Definition Blocks (0-20 points)
        definition_score, definition_factors = _score_definition_blocks(body_text, parsed)
        score += definition_score
        factors.extend(definition_factors)
        
        # 2. Summary Section Near Top (0-20 points)
        summary_score, summary_factors = _score_summary_presence(body_text, headings)
        score += summary_score
        factors.extend(summary_factors)
        
        # 3. FAQ Structured Sections (0-15 points)
        faq_score, faq_factors = _score_faq_sections(faq_items, body_text)
        score += faq_score
        factors.extend(faq_factors)
        
        # 4. Bullet/Numbered Lists (0-15 points)
        list_score, list_factors = _score_list_usage(body_text)
        score += list_score
        factors.extend(list_factors)
        
        # 5. Logical Heading Hierarchy (0-15 points)
        hierarchy_score, hierarchy_factors = _score_heading_hierarchy(headings)
        score += hierarchy_score
        factors.extend(hierarchy_factors)
        
        # 6. Low Fluff Density (0-15 points)
        fluff_score, fluff_factors = _score_fluff_density(body_text, word_count)
        score += fluff_score
        factors.extend(fluff_factors)
    
    return {
        "generative_readiness": max(0, min(100, int(round(score)))),
        "generative_factors": factors
    }


def _detect_product_page(parsed: dict, body_text: str) -> tuple:
    """Detect if this is a product/e-commerce page."""
    signals = []
    text_lower = body_text.lower()
    
    # Check for product-specific keywords
    product_keywords = ['buy', 'price', 'add to cart', 'add to bag', 'shop', 'purchase', 
                        'color', 'size', 'quantity', 'in stock', 'out of stock', 'delivery',
                        'shipping', 'return policy', 'product details', 'specifications',
                        'reviews', 'rating', 'sku', 'model', 'brand']
    
    keyword_matches = sum(1 for kw in product_keywords if kw in text_lower)
    
    if keyword_matches >= 5:
        signals.append("product keywords")
    
    # Check for price patterns
    price_patterns = [r'\$\d+', r'€\d+', r'£\d+', r'\d+\.\d{2}', r'price:', r'was:.*now:']
    if any(re.search(p, text_lower) for p in price_patterns):
        signals.append("pricing")
    
    # Check for product schema
    if parsed.get("json_ld"):
        json_ld = parsed["json_ld"]
        if any(schema.get("@type") in ["Product", "Offer", "ProductCollection"] 
               for schema in (json_ld if isinstance(json_ld, list) else [json_ld])):
            signals.append("product schema")
    
    # Check URL patterns
    url = parsed.get("canonical_url", "")
    product_url_patterns = ['/product/', '/p/', '/item/', '/shop/', '/buy/', '/store/']
    if any(pattern in url.lower() for pattern in product_url_patterns):
        signals.append("product URL")
    
    is_product = len(signals) >= 2
    return is_product, signals


def _score_product_page(parsed: dict, body_text: str, headings: dict, faq_items: list, word_count: int) -> tuple:
    """Score product pages with e-commerce-appropriate criteria."""
    score = 0.0
    factors = []
    text_lower = body_text.lower()
    
    # 1. Product Title & Brand (0-20 points)
    title = parsed.get("title", "")
    h1_headings = headings.get("h1", [])
    
    if title and len(title) > 10:
        score += 10
        factors.append({"factor": "Product title present", "impact": "positive", "detail": f"Title: {title[:50]}..."})
    
    # Check for brand mentions
    brand_indicators = ['nike', 'adidas', 'apple', 'samsung', 'brand:', 'by ']
    has_brand = any(indicator in text_lower for indicator in brand_indicators)
    if has_brand or len(h1_headings) > 0:
        score += 10
        factors.append({"factor": "Brand/product name clear", "impact": "positive", "detail": "Product identity well-defined"})
    
    # 2. Product Description (0-20 points)
    description = parsed.get("meta_description", "")
    
    if word_count > 300:
        score += 20
        factors.append({"factor": "Comprehensive product description", "impact": "positive", "detail": f"{word_count} words of content"})
    elif word_count > 150:
        score += 15
        factors.append({"factor": "Good product description", "impact": "positive", "detail": f"{word_count} words"})
    elif word_count > 50:
        score += 10
        factors.append({"factor": "Basic description present", "impact": "neutral", "detail": "Adequate content for product page"})
    elif word_count > 20:
        score += 5
        factors.append({"factor": "Minimal description", "impact": "neutral", "detail": f"{word_count} words - typical for image-heavy product pages"})
    else:
        factors.append({"factor": "Thin product description", "impact": "negative", "detail": "Very limited text content"})
    
    # 3. Product Features/Specs (0-15 points)
    spec_keywords = ['features', 'specifications', 'specs', 'details', 'includes', 'dimensions', 
                     'material', 'weight', 'color options', 'size']
    spec_mentions = sum(1 for kw in spec_keywords if kw in text_lower)
    
    # Check for lists (features are often in lists)
    list_score, _ = _score_list_usage(body_text)
    
    if spec_mentions >= 3 and list_score > 5:
        score += 15
        factors.append({"factor": "Detailed specifications", "impact": "positive", "detail": f"{spec_mentions} spec sections with structured lists"})
    elif spec_mentions >= 2:
        score += 10
        factors.append({"factor": "Product features present", "impact": "positive", "detail": "Some specifications provided"})
    elif spec_mentions >= 1:
        score += 5
        factors.append({"factor": "Minimal specs", "impact": "neutral", "detail": "Limited specification details"})
    else:
        factors.append({"factor": "Missing product specifications", "impact": "negative", "detail": "No clear features or specs listed"})
    
    # 4. Reviews/Ratings (0-15 points)
    review_keywords = ['review', 'rating', 'star', 'customer', 'testimonial', 'feedback']
    has_reviews = any(kw in text_lower for kw in review_keywords)
    
    if has_reviews:
        score += 15
        factors.append({"factor": "Customer reviews present", "impact": "positive", "detail": "Social proof available for AI to reference"})
    else:
        score += 5
        factors.append({"factor": "No reviews visible", "impact": "neutral", "detail": "Missing customer feedback"})
    
    # 5. Structured Data (0-15 points)
    json_ld = parsed.get("json_ld", {})
    has_product_schema = False
    
    if json_ld:
        schemas = json_ld if isinstance(json_ld, list) else [json_ld]
        for schema in schemas:
            if schema.get("@type") in ["Product", "Offer"]:
                has_product_schema = True
                break
    
    if has_product_schema:
        score += 15
        factors.append({"factor": "Product schema markup", "impact": "positive", "detail": "Structured data helps AI understand product info"})
    else:
        factors.append({"factor": "Missing product schema", "impact": "negative", "detail": "No structured data for product"})
    
    # 6. FAQ or Support Info (0-15 points)
    faq_score, faq_factors = _score_faq_sections(faq_items, body_text)
    score += faq_score
    factors.extend(faq_factors)
    
    return score, factors


def _score_definition_blocks(body_text: str, parsed: dict) -> tuple:
    """Score presence of clear definition patterns."""
    score = 0.0
    factors = []
    text_lower = body_text.lower()
    
    # Definition patterns: "X is", "X refers to", "X means", "defined as"
    definition_patterns = [
        r'\b\w+\s+is\s+(?:a|an|the)\s+\w+',
        r'\b\w+\s+refers\s+to\b',
        r'\b\w+\s+means\b',
        r'defined\s+as\b',
        r'is\s+known\s+as\b',
        r'can\s+be\s+described\s+as\b',
    ]
    
    definition_count = 0
    for pattern in definition_patterns:
        matches = re.findall(pattern, text_lower)
        definition_count += len(matches)
    
    if definition_count >= 5:
        score += 20
        factors.append({"factor": "Strong definition blocks", "impact": "positive", "detail": f"{definition_count} definition patterns found"})
    elif definition_count >= 3:
        score += 15
        factors.append({"factor": "Good definition blocks", "impact": "positive", "detail": f"{definition_count} definition patterns found"})
    elif definition_count >= 1:
        score += 8
        factors.append({"factor": "Some definitions present", "impact": "neutral", "detail": f"{definition_count} definition patterns found"})
    else:
        factors.append({"factor": "Missing clear definitions", "impact": "negative", "detail": "No clear 'X is...' or definition patterns found"})
    
    # Check for definition in first paragraph
    first_500 = body_text[:500].lower()
    if any(re.search(p, first_500) for p in definition_patterns[:2]):
        score += 5
        factors.append({"factor": "Definition in opening", "impact": "positive", "detail": "Clear definition appears early in content"})
    
    return score, factors


def _score_summary_presence(body_text: str, headings: dict) -> tuple:
    """Score presence of summary/overview sections."""
    score = 0.0
    factors = []
    text_lower = body_text.lower()
    
    # Check for summary-related keywords in headings
    summary_keywords = ['summary', 'overview', 'key takeaways', 'takeaways', 'key points', 
                        'highlights', 'tldr', 'tl;dr', 'in brief', 'at a glance', 'bottom line']
    
    all_headings = []
    for level in ['h1', 'h2', 'h3']:
        all_headings.extend([h.lower() for h in headings.get(level, [])])
    
    has_summary_heading = any(kw in ' '.join(all_headings) for kw in summary_keywords)
    
    # Check for summary content patterns
    summary_in_text = any(kw in text_lower for kw in summary_keywords)
    
    # Check if summary is near the top (first 25% of content)
    first_quarter = text_lower[:len(text_lower)//4]
    summary_near_top = any(kw in first_quarter for kw in summary_keywords[:5])
    
    if has_summary_heading and summary_near_top:
        score += 20
        factors.append({"factor": "Summary section at top", "impact": "positive", "detail": "Clear summary/overview section found near page top"})
    elif has_summary_heading:
        score += 12
        factors.append({"factor": "Summary section present", "impact": "positive", "detail": "Summary section exists but not prominently placed"})
    elif summary_in_text:
        score += 6
        factors.append({"factor": "Summary content found", "impact": "neutral", "detail": "Summary-like content exists without dedicated section"})
    else:
        factors.append({"factor": "No summary section", "impact": "negative", "detail": "Missing summary, overview, or key takeaways section"})
    
    return score, factors


def _score_faq_sections(faq_items: list, body_text: str) -> tuple:
    """Score FAQ presence and quality."""
    score = 0.0
    factors = []
    text_lower = body_text.lower()
    
    # Count structured FAQ items
    faq_count = len(faq_items)
    
    # Check for FAQ patterns in text
    question_patterns = text_lower.count('?')
    has_faq_heading = 'faq' in text_lower or 'frequently asked' in text_lower or 'common questions' in text_lower
    
    if faq_count >= 5:
        score += 15
        factors.append({"factor": "Comprehensive FAQ section", "impact": "positive", "detail": f"{faq_count} FAQ items with structured markup"})
    elif faq_count >= 3:
        score += 12
        factors.append({"factor": "Good FAQ section", "impact": "positive", "detail": f"{faq_count} FAQ items found"})
    elif faq_count >= 1:
        score += 8
        factors.append({"factor": "Basic FAQ present", "impact": "neutral", "detail": f"{faq_count} FAQ items found"})
    elif has_faq_heading and question_patterns >= 3:
        score += 5
        factors.append({"factor": "FAQ-like content", "impact": "neutral", "detail": "Q&A style content without proper structure"})
    else:
        factors.append({"factor": "No FAQ section", "impact": "negative", "detail": "Missing FAQ or Q&A section"})
    
    return score, factors


def _score_list_usage(body_text: str) -> tuple:
    """Score usage of bullet and numbered lists."""
    score = 0.0
    factors = []
    
    # Look for list indicators
    bullet_patterns = [
        r'^\s*[\-\•\*]\s+\w+',  # Bullet points
        r'^\s*\d+[\.\)]\s+\w+',  # Numbered lists
    ]
    
    # Count list-like patterns
    lines = body_text.split('\n')
    list_items = 0
    for line in lines:
        for pattern in bullet_patterns:
            if re.match(pattern, line):
                list_items += 1
                break
    
    # Also check for common list markers in text
    list_markers = body_text.count('• ') + body_text.count('- ') + body_text.count('* ')
    list_items = max(list_items, list_markers)
    
    if list_items >= 10:
        score += 15
        factors.append({"factor": "Extensive list usage", "impact": "positive", "detail": f"{list_items} list items found - excellent for AI extraction"})
    elif list_items >= 5:
        score += 12
        factors.append({"factor": "Good list usage", "impact": "positive", "detail": f"{list_items} list items found"})
    elif list_items >= 2:
        score += 6
        factors.append({"factor": "Some lists present", "impact": "neutral", "detail": f"{list_items} list items found"})
    else:
        factors.append({"factor": "Minimal list usage", "impact": "negative", "detail": "Content lacks bullet points or numbered lists"})
    
    return score, factors


def _score_heading_hierarchy(headings: dict) -> tuple:
    """Score logical heading structure."""
    score = 0.0
    factors = []
    
    h1_count = len(headings.get('h1', []))
    h2_count = len(headings.get('h2', []))
    h3_count = len(headings.get('h3', []))
    h4_count = len(headings.get('h4', []))
    
    total_headings = h1_count + h2_count + h3_count + h4_count
    
    # Ideal: 1 H1, multiple H2s, some H3s
    hierarchy_good = h1_count == 1 and h2_count >= 2
    
    if hierarchy_good and h3_count >= 2:
        score += 15
        factors.append({"factor": "Excellent heading hierarchy", "impact": "positive", "detail": f"Well-structured: 1 H1, {h2_count} H2s, {h3_count} H3s"})
    elif hierarchy_good:
        score += 12
        factors.append({"factor": "Good heading structure", "impact": "positive", "detail": f"Clear structure: 1 H1, {h2_count} H2s"})
    elif h2_count >= 2:
        score += 8
        factors.append({"factor": "Adequate headings", "impact": "neutral", "detail": f"{h2_count} H2 headings found"})
    elif total_headings >= 2:
        score += 4
        factors.append({"factor": "Basic heading structure", "impact": "neutral", "detail": f"{total_headings} total headings"})
    else:
        factors.append({"factor": "Poor heading hierarchy", "impact": "negative", "detail": "Content lacks proper heading structure"})
    
    return score, factors


def _score_fluff_density(body_text: str, word_count: int) -> tuple:
    """Score content conciseness (low fluff = better for AI)."""
    score = 0.0
    factors = []
    
    if word_count == 0:
        factors.append({"factor": "No content", "impact": "negative", "detail": "Page has no readable content"})
        return 0, factors
    
    # Fluff indicators: excessive adverbs, filler words, redundant phrases
    fluff_words = [
        'actually', 'basically', 'really', 'very', 'just', 'simply', 
        'literally', 'honestly', 'definitely', 'absolutely', 'completely',
        'obviously', 'clearly', 'essentially', 'virtually', 'practically',
        'incredibly', 'extremely', 'totally', 'utterly', 'quite'
    ]
    
    text_lower = body_text.lower()
    words = re.findall(r'\b\w+\b', text_lower)
    
    fluff_count = sum(1 for w in words if w in fluff_words)
    fluff_ratio = fluff_count / len(words) if words else 0
    
    # Calculate average sentence length (shorter = more direct)
    sentences = re.split(r'[.!?]+', body_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
    
    # Score based on fluff ratio
    if fluff_ratio < 0.01:
        score += 10
        factors.append({"factor": "Very concise content", "impact": "positive", "detail": "Minimal filler words"})
    elif fluff_ratio < 0.02:
        score += 7
        factors.append({"factor": "Concise content", "impact": "positive", "detail": "Low fluff density"})
    elif fluff_ratio < 0.03:
        score += 4
        factors.append({"factor": "Moderate fluff", "impact": "neutral", "detail": "Some filler words present"})
    else:
        factors.append({"factor": "High fluff density", "impact": "negative", "detail": f"{fluff_count} filler words detected"})
    
    # Score based on sentence length
    if avg_sentence_length <= 15:
        score += 5
        factors.append({"factor": "Direct sentences", "impact": "positive", "detail": f"Avg {int(avg_sentence_length)} words/sentence"})
    elif avg_sentence_length <= 20:
        score += 3
        factors.append({"factor": "Readable sentences", "impact": "neutral", "detail": f"Avg {int(avg_sentence_length)} words/sentence"})
    elif avg_sentence_length > 25:
        factors.append({"factor": "Long sentences", "impact": "negative", "detail": f"Avg {int(avg_sentence_length)} words/sentence - harder for AI to extract"})
    
    return score, factors
