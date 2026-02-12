"""GEO - Brand Retention Probability Calculator"""
import re
from urllib.parse import urlparse


def calculate_brand_retention(parsed: dict) -> dict:
    """
    Calculate probability that brand name survives in AI-generated answers.
    
    Evaluates:
    - Brand name frequency
    - Brand presence near definitions
    - Brand tied to claims ("According to Brand X...")
    - Organization schema presence
    - Author schema presence
    
    Returns:
        dict: {brand_retention_probability: int, brand_gaps: list}
    """
    score = 0.0
    gaps = []
    
    # Extract brand name from URL, title, or organization schema
    brand_name = _extract_brand_name(parsed)
    
    if not brand_name:
        return {
            "brand_retention_probability": 0,
            "brand_gaps": [{
                "gap": "No identifiable brand",
                "detail": "Could not determine brand name from URL, title, or schema",
                "severity": "critical"
            }],
            "detected_brand": None
        }
    
    body_text = parsed.get("body_text", "")
    headings = parsed.get("headings", {})
    schema_blocks = parsed.get("schema_blocks", [])
    
    # 1. Brand Frequency (0-25 points)
    frequency_score, frequency_gaps = _score_brand_frequency(brand_name, body_text)
    score += frequency_score
    gaps.extend(frequency_gaps)
    
    # 2. Brand Position Near Definitions (0-25 points)
    position_score, position_gaps = _score_brand_positioning(brand_name, body_text)
    score += position_score
    gaps.extend(position_gaps)
    
    # 3. Brand Attribution Patterns (0-20 points)
    attribution_score, attribution_gaps = _score_brand_attribution(brand_name, body_text)
    score += attribution_score
    gaps.extend(attribution_gaps)
    
    # 4. Organization Schema (0-15 points)
    org_score, org_gaps = _score_organization_schema(parsed, brand_name)
    score += org_score
    gaps.extend(org_gaps)
    
    # 5. Author/Publisher Schema (0-15 points)
    author_score, author_gaps = _score_author_schema(parsed, brand_name)
    score += author_score
    gaps.extend(author_gaps)
    
    return {
        "brand_retention_probability": max(0, min(100, int(round(score)))),
        "brand_gaps": gaps,
        "detected_brand": brand_name
    }


def _extract_brand_name(parsed: dict) -> str:
    """Extract brand name from various sources."""
    
    # 1. Try organization schema
    for schema in parsed.get("schema_blocks", []):
        if isinstance(schema, dict):
            schema_type = schema.get("@type", "")
            if schema_type in ["Organization", "Corporation", "LocalBusiness"] or \
               (isinstance(schema_type, list) and any(t in ["Organization", "Corporation", "LocalBusiness"] for t in schema_type)):
                name = schema.get("name", "")
                if name and len(name) > 1:
                    return name
            
            # Check @graph
            for item in schema.get("@graph", []):
                if isinstance(item, dict):
                    item_type = item.get("@type", "")
                    if item_type in ["Organization", "Corporation", "WebSite"]:
                        name = item.get("name", "")
                        if name and len(name) > 1:
                            return name
    
    # 2. Try URL domain
    url = parsed.get("url", "")
    if url:
        domain = urlparse(url).netloc
        # Remove www. and TLD
        brand_from_domain = domain.replace("www.", "").split(".")[0]
        if brand_from_domain and len(brand_from_domain) > 2:
            return brand_from_domain.capitalize()
    
    # 3. Try title (first word or phrase before separator)
    title = parsed.get("title", "")
    if title:
        # Common separators
        for sep in [' | ', ' - ', ' – ', ' — ', ' : ']:
            if sep in title:
                parts = title.split(sep)
                # Brand is usually first or last
                brand_candidate = parts[-1].strip() if len(parts[-1]) < 30 else parts[0].strip()
                if brand_candidate and len(brand_candidate) > 1:
                    return brand_candidate
    
    return ""


def _score_brand_frequency(brand_name: str, body_text: str) -> tuple:
    """Score how frequently the brand is mentioned."""
    score = 0.0
    gaps = []
    
    text_lower = body_text.lower()
    brand_lower = brand_name.lower()
    
    # Count brand mentions
    brand_count = text_lower.count(brand_lower)
    word_count = len(text_lower.split())
    
    # Calculate mentions per 100 words
    mentions_per_100 = (brand_count / word_count * 100) if word_count > 0 else 0
    
    if brand_count >= 10 and mentions_per_100 >= 1:
        score += 25
    elif brand_count >= 5 and mentions_per_100 >= 0.5:
        score += 18
    elif brand_count >= 3:
        score += 12
        gaps.append({
            "gap": "Low brand frequency",
            "detail": f"Brand '{brand_name}' only mentioned {brand_count} times - increase to 5+ for better retention",
            "severity": "medium"
        })
    elif brand_count >= 1:
        score += 5
        gaps.append({
            "gap": "Minimal brand presence",
            "detail": f"Brand '{brand_name}' barely mentioned ({brand_count} times)",
            "severity": "high"
        })
    else:
        gaps.append({
            "gap": "Brand not mentioned in content",
            "detail": f"Brand '{brand_name}' not found in body text",
            "severity": "critical"
        })
    
    return score, gaps


def _score_brand_positioning(brand_name: str, body_text: str) -> tuple:
    """Score whether brand appears near key content areas."""
    score = 0.0
    gaps = []
    
    text_lower = body_text.lower()
    brand_lower = brand_name.lower()
    
    # Check brand in first 500 characters
    first_500 = text_lower[:500]
    brand_in_opening = brand_lower in first_500
    
    # Check brand near definitions
    definition_patterns = [
        r'\b\w+\s+is\s+(?:a|an|the)\s+\w+',
        r'\b\w+\s+refers\s+to\b',
        r'\b\w+\s+means\b',
    ]
    
    brand_near_definition = False
    for pattern in definition_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            start = max(0, match.start() - 100)
            end = min(len(text_lower), match.end() + 100)
            context = text_lower[start:end]
            if brand_lower in context:
                brand_near_definition = True
                break
        if brand_near_definition:
            break
    
    if brand_in_opening and brand_near_definition:
        score += 25
    elif brand_in_opening:
        score += 15
        gaps.append({
            "gap": "Brand not tied to definitions",
            "detail": "Brand appears early but isn't connected to key explanations",
            "severity": "medium"
        })
    elif brand_near_definition:
        score += 12
        gaps.append({
            "gap": "Brand missing from opening",
            "detail": "Brand should appear in first paragraph for AI to associate it with content",
            "severity": "medium"
        })
    else:
        score += 5
        gaps.append({
            "gap": "Poor brand positioning",
            "detail": "Brand not strategically placed near definitions or in opening",
            "severity": "high"
        })
    
    return score, gaps


def _score_brand_attribution(brand_name: str, body_text: str) -> tuple:
    """Score whether brand is used in attribution patterns."""
    score = 0.0
    gaps = []
    
    text_lower = body_text.lower()
    brand_lower = brand_name.lower()
    
    # Attribution patterns that AI models preserve
    attribution_patterns = [
        f"according to {brand_lower}",
        f"{brand_lower} says",
        f"{brand_lower} states",
        f"{brand_lower} explains",
        f"{brand_lower} recommends",
        f"{brand_lower} suggests",
        f"{brand_lower} reports",
        f"{brand_lower} found",
        f"{brand_lower}'s research",
        f"{brand_lower}'s data",
        f"{brand_lower}'s analysis",
        f"at {brand_lower}",
        f"by {brand_lower}",
    ]
    
    attribution_count = sum(1 for pattern in attribution_patterns if pattern in text_lower)
    
    if attribution_count >= 3:
        score += 20
    elif attribution_count >= 2:
        score += 15
    elif attribution_count >= 1:
        score += 10
        gaps.append({
            "gap": "Limited brand attribution",
            "detail": "Add more 'According to [Brand]...' patterns for AI citation",
            "severity": "low"
        })
    else:
        gaps.append({
            "gap": "No brand attribution patterns",
            "detail": "Use phrases like 'According to [Brand]...' to increase citation likelihood",
            "severity": "high"
        })
    
    return score, gaps


def _score_organization_schema(parsed: dict, brand_name: str) -> tuple:
    """Score organization schema presence."""
    score = 0.0
    gaps = []
    
    has_org_schema = parsed.get("has_organization_schema", False)
    schema_types = [t.lower() for t in parsed.get("schema_types", [])]
    
    # Check for organization-related schemas
    org_schemas = ["organization", "corporation", "localbusiness", "brand"]
    has_any_org = any(s in schema_types for s in org_schemas) or has_org_schema
    
    # Check if schema includes brand name
    brand_in_schema = False
    for schema in parsed.get("schema_blocks", []):
        if isinstance(schema, dict):
            schema_name = str(schema.get("name", "")).lower()
            if brand_name.lower() in schema_name:
                brand_in_schema = True
                break
            # Check @graph
            for item in schema.get("@graph", []):
                if isinstance(item, dict):
                    item_name = str(item.get("name", "")).lower()
                    if brand_name.lower() in item_name:
                        brand_in_schema = True
                        break
    
    if has_any_org and brand_in_schema:
        score += 15
    elif has_any_org:
        score += 10
        gaps.append({
            "gap": "Organization schema incomplete",
            "detail": "Organization schema exists but may not include brand name",
            "severity": "low"
        })
    else:
        gaps.append({
            "gap": "Missing Organization schema",
            "detail": "Add Organization JSON-LD schema to reinforce brand ownership",
            "severity": "high"
        })
    
    return score, gaps


def _score_author_schema(parsed: dict, brand_name: str) -> tuple:
    """Score author/publisher schema presence."""
    score = 0.0
    gaps = []
    
    author = parsed.get("author", "")
    schema_types = [t.lower() for t in parsed.get("schema_types", [])]
    
    # Check for author-related schemas
    has_author_schema = "person" in schema_types or author
    has_publisher = False
    
    for schema in parsed.get("schema_blocks", []):
        if isinstance(schema, dict):
            if schema.get("publisher") or schema.get("author"):
                has_publisher = True
            for item in schema.get("@graph", []):
                if isinstance(item, dict) and (item.get("publisher") or item.get("author")):
                    has_publisher = True
    
    # Check if author/publisher includes brand
    brand_lower = brand_name.lower()
    author_has_brand = brand_lower in author.lower() if author else False
    
    if has_author_schema and has_publisher:
        score += 15
    elif has_author_schema or has_publisher:
        score += 10
        if not author_has_brand:
            gaps.append({
                "gap": "Author not linked to brand",
                "detail": "Connect author attribution to brand organization",
                "severity": "low"
            })
    elif author:
        score += 5
        gaps.append({
            "gap": "Missing author schema",
            "detail": "Add Person schema for author attribution",
            "severity": "medium"
        })
    else:
        gaps.append({
            "gap": "No author or publisher information",
            "detail": "Add author byline and publisher schema for credibility",
            "severity": "high"
        })
    
    return score, gaps
