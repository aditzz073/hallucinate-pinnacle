"""AI Content Compiler - Phase 6
Converts parsed DOM into semantic AI-ready blocks."""
import re


def compile_semantic_blocks(parsed: dict) -> dict:
    body = parsed.get("body_text", "")
    headings = parsed.get("headings", {})
    faq_items = parsed.get("faq_items", [])
    schema_types = [t.lower() for t in parsed.get("schema_types", [])]

    blocks = []

    # Definition blocks
    definitions = _extract_definitions(body)
    for d in definitions:
        blocks.append({
            "type": "DefinitionBlock",
            "content": d["text"],
            "word_count": len(d["text"].split()),
            "has_schema": "definedterm" in schema_types,
            "extractability_score": _score_extractability_block("definition", d["text"], schema_types),
        })

    # FAQ blocks
    faqs = []
    for item in faq_items:
        text = f"Q: {item['question']} A: {item['answer']}"
        faqs.append({
            "type": "FAQBlock",
            "content": text,
            "word_count": len(text.split()),
            "has_schema": "faqpage" in schema_types,
            "extractability_score": _score_extractability_block("faq", text, schema_types),
        })
    blocks.extend(faqs)

    # Summary blocks
    summaries = _extract_summaries(body)
    for s in summaries:
        blocks.append({
            "type": "SummaryBlock",
            "content": s["text"],
            "word_count": len(s["text"].split()),
            "has_schema": False,
            "extractability_score": _score_extractability_block("summary", s["text"], schema_types),
        })

    # List blocks
    lists = _extract_lists(body)
    for lst in lists:
        blocks.append({
            "type": "ListBlock",
            "content": lst["text"],
            "word_count": len(lst["text"].split()),
            "has_schema": "itemlist" in schema_types,
            "extractability_score": _score_extractability_block("list", lst["text"], schema_types),
        })

    # Comparison blocks
    comparisons = _extract_comparisons(body, headings)
    for c in comparisons:
        blocks.append({
            "type": "ComparisonBlock",
            "content": c["text"],
            "word_count": len(c["text"].split()),
            "has_schema": False,
            "extractability_score": _score_extractability_block("comparison", c["text"], schema_types),
        })

    # Authority blocks
    authority_statements = _extract_authority(body, parsed)
    for a in authority_statements:
        blocks.append({
            "type": "AuthorityBlock",
            "content": a["text"],
            "word_count": len(a["text"].split()),
            "has_schema": "organization" in schema_types or parsed.get("has_organization_schema", False),
            "extractability_score": _score_extractability_block("authority", a["text"], schema_types),
        })

    # Build semantic tree
    semantic_tree = {
        "definitions": [b for b in blocks if b["type"] == "DefinitionBlock"],
        "faqs": [b for b in blocks if b["type"] == "FAQBlock"],
        "summaries": [b for b in blocks if b["type"] == "SummaryBlock"],
        "comparisons": [b for b in blocks if b["type"] == "ComparisonBlock"],
        "authority_statements": [b for b in blocks if b["type"] == "AuthorityBlock"],
        "lists": [b for b in blocks if b["type"] == "ListBlock"],
    }

    # Calculate AI Compilation Readiness
    readiness = _calculate_readiness(semantic_tree, parsed)

    return {
        "compilation_readiness": readiness,
        "semantic_breakdown": semantic_tree,
        "total_blocks": len(blocks),
        "blocks": blocks,
    }


def _extract_definitions(body: str) -> list:
    """Find definition-like sentences."""
    defs = []
    patterns = [
        r"([A-Z][^.]*?\b(?:is|are|refers to|defined as|means)\b[^.]+\.)",
    ]
    first_chunk = body[:3000]
    for p in patterns:
        matches = re.findall(p, first_chunk)
        for m in matches[:3]:
            if 10 < len(m.split()) < 80:
                defs.append({"text": m.strip()})
    return defs


def _extract_summaries(body: str) -> list:
    """Find summary/takeaway blocks."""
    summaries = []
    triggers = ["in summary", "to summarize", "key takeaways", "tldr", "tl;dr", "in conclusion", "bottom line", "at a glance"]
    body_lower = body.lower()
    for trigger in triggers:
        idx = body_lower.find(trigger)
        if idx >= 0:
            chunk = body[idx:idx + 500]
            sentences = chunk.split(".")
            text = ". ".join(sentences[:3]).strip()
            if len(text) > 20:
                summaries.append({"text": text})
                break
    return summaries


def _extract_lists(body: str) -> list:
    """Find structured list content."""
    lists = []
    list_items = re.findall(r"(?:^|\n)\s*(?:\d+[\.\)]\s+|\-\s+|\*\s+|•\s+)(.+)", body)
    if len(list_items) >= 3:
        text = "\n".join(f"- {item.strip()}" for item in list_items[:10])
        lists.append({"text": text})
    return lists


def _extract_comparisons(body: str, headings: dict) -> list:
    """Find comparison content."""
    comps = []
    comp_keywords = ["vs", "versus", "compared to", "comparison", "difference between", "better than"]
    body_lower = body.lower()
    for kw in comp_keywords:
        idx = body_lower.find(kw)
        if idx >= 0:
            start = max(0, idx - 100)
            chunk = body[start:idx + 300]
            sentences = chunk.split(".")
            text = ". ".join(s.strip() for s in sentences if s.strip())[:300]
            if len(text) > 30:
                comps.append({"text": text.strip()})
                break
    # Check headings for comparison patterns
    for level in range(1, 4):
        for h in headings.get(f"h{level}", []):
            h_lower = h.lower()
            if any(kw in h_lower for kw in comp_keywords):
                comps.append({"text": f"[Heading] {h}"})
                break
    return comps[:2]


def _extract_authority(body: str, parsed: dict) -> list:
    """Find authority-establishing statements."""
    stmts = []
    if parsed.get("author"):
        stmts.append({"text": f"Content authored by {parsed['author']}"})

    authority_patterns = [
        r"(?:founded in|established in|since)\s+\d{4}",
        r"(?:certified|accredited|licensed|award-winning)",
        r"(?:years of experience|industry expert|leading provider)",
    ]
    body_lower = body.lower()[:3000]
    for p in authority_patterns:
        match = re.search(p, body_lower)
        if match:
            start = max(0, match.start() - 50)
            chunk = body[start:match.end() + 100]
            stmts.append({"text": chunk.strip()[:200]})

    return stmts[:3]


def _score_extractability_block(block_type: str, text: str, schema_types: list) -> int:
    """Score how extractable a single block is."""
    base_scores = {
        "definition": 70,
        "faq": 80,
        "summary": 75,
        "list": 65,
        "comparison": 60,
        "authority": 50,
    }
    score = base_scores.get(block_type, 40)

    wc = len(text.split())
    if 20 <= wc <= 100:
        score += 15  # ideal length
    elif wc < 20:
        score -= 10  # too short
    elif wc > 200:
        score -= 5  # verbose

    if block_type == "faq" and "faqpage" in schema_types:
        score += 15
    elif block_type == "definition" and any(t in schema_types for t in ["article", "technicalarticle"]):
        score += 10

    return max(0, min(100, score))


def _calculate_readiness(tree: dict, parsed: dict) -> int:
    """Calculate AI Compilation Readiness 0-100."""
    score = 0

    # Clear definitions
    if tree["definitions"]:
        score += 20
    # FAQ formatting
    if tree["faqs"]:
        score += 25
        if len(tree["faqs"]) >= 3:
            score += 5
    # Summary presence
    if tree["summaries"]:
        score += 20
    # Structured lists
    if tree["lists"]:
        score += 15
    # Authority reinforcement
    if tree["authority_statements"]:
        score += 15

    return max(0, min(100, score))
