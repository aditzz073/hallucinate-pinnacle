"""Competitor AI Comparison - Phase 9"""
from modules.aeoEngine.html_fetcher import fetch_html
from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
from modules.aeoEngine.scorer import calculate_all_scores
from modules.aiTestingEngine.query_processor import tokenize_query, detect_intent
from modules.aiTestingEngine.content_matcher import calculate_content_match
from modules.aiTestingEngine.extractability import calculate_extractability
from modules.aiTestingEngine.authority import calculate_authority
from modules.aiTestingEngine.citation_calculator import (
    calculate_intent_match,
    calculate_schema_support,
    calculate_content_depth,
    calculate_citation_probability,
    estimate_position,
)


async def compare_competitors(query: str, primary_url: str, competitor_urls: list) -> dict:
    tokens = tokenize_query(query)
    intent = detect_intent(query)

    all_urls = [primary_url] + competitor_urls
    results = []

    for url in all_urls:
        try:
            analysis = await _analyze_url(url, tokens, intent)
            analysis["is_primary"] = url == primary_url
            results.append(analysis)
        except Exception as e:
            results.append({
                "url": url,
                "is_primary": url == primary_url,
                "error": str(e),
                "citation_probability": 0,
                "aeo_score": 0,
                "breakdown": {},
                "citation_breakdown": {},
            })

    # Sort by citation probability (descending)
    ranked = sorted(results, key=lambda x: x.get("citation_probability", 0), reverse=True)
    ranking_order = [r["url"] for r in ranked]

    # Gap analysis
    primary_result = next((r for r in results if r.get("is_primary")), None)
    gap_analysis = []
    if primary_result and not primary_result.get("error"):
        for comp in results:
            if comp.get("is_primary") or comp.get("error"):
                continue
            gaps = _compute_gaps(primary_result, comp)
            gap_analysis.append({
                "competitor_url": comp["url"],
                "gaps": gaps,
            })

    return {
        "query": query,
        "intent": intent,
        "ranking_order": ranking_order,
        "score_comparison": ranked,
        "gap_analysis": gap_analysis,
        "total_compared": len(all_urls),
    }


async def _analyze_url(url: str, tokens: list, intent: str) -> dict:
    html = await fetch_html(url)
    parsed = parse_html(html, url)
    page_type = classify_page(parsed)
    signals = build_signals(parsed, page_type)
    aeo_scores = calculate_all_scores(signals)

    content_match = calculate_content_match(parsed, tokens, intent)
    extractability = calculate_extractability(parsed, content_match)
    auth = calculate_authority(parsed, signals)
    intent_match = calculate_intent_match(content_match, intent)
    schema_support = calculate_schema_support(parsed, intent)
    content_depth = calculate_content_depth(parsed)
    citation_prob = calculate_citation_probability(
        intent_match, extractability, auth, schema_support, content_depth
    )

    # Enriched metadata for gap analysis
    schema_types = signals.get("schema", {}).get("schema_types", [])
    word_count = signals.get("structure", {}).get("word_count", 0)
    has_author = signals.get("trust", {}).get("has_author", False)
    has_org_schema = signals.get("schema", {}).get("has_organization_schema", False)
    has_faq_schema = signals.get("schema", {}).get("has_faq_schema", False)

    return {
        "url": url,
        "page_type": page_type,
        "aeo_score": aeo_scores["overall_score"],
        "breakdown": aeo_scores["breakdown"],
        "citation_probability": citation_prob,
        "likely_position": estimate_position(citation_prob),
        "citation_breakdown": {
            "intent_match": intent_match,
            "extractability": extractability,
            "authority": auth,
            "schema_support": schema_support,
            "content_depth": content_depth,
        },
        "intelligence": {
            "schema_types": schema_types,
            "word_count": word_count,
            "has_author": has_author,
            "has_organization_schema": has_org_schema,
            "has_faq_schema": has_faq_schema,
        },
    }


def _compute_gaps(primary: dict, competitor: dict) -> list:
    """Compare primary vs competitor and find where primary is weaker."""
    gaps = []
    p_cb = primary.get("citation_breakdown", {})
    c_cb = competitor.get("citation_breakdown", {})

    # Citation dimension gaps
    dimension_labels = {
        "intent_match": "Intent Match",
        "extractability": "Content Extractability",
        "authority": "Domain Authority",
        "schema_support": "Schema Support",
        "content_depth": "Content Depth",
    }

    for key, label in dimension_labels.items():
        p_val = p_cb.get(key, 0)
        c_val = c_cb.get(key, 0)
        if c_val > p_val + 5:
            gap_val = c_val - p_val
            why = _explain_gap(key, gap_val, primary, competitor)
            gaps.append({
                "dimension": label,
                "your_score": p_val,
                "competitor_score": c_val,
                "gap": gap_val,
                "recommendation": f"Competitor outperforms on {label.lower()} by {gap_val} points",
                "why_competitor_wins": why,
            })

    # AEO breakdown gaps
    p_bd = primary.get("breakdown", {})
    c_bd = competitor.get("breakdown", {})
    for dim in ["structure", "trust", "media", "schema", "technical", "freshness"]:
        p_val = p_bd.get(dim, 0)
        c_val = c_bd.get(dim, 0)
        if c_val > p_val + 10:
            gaps.append({
                "dimension": f"AEO: {dim.title()}",
                "your_score": p_val,
                "competitor_score": c_val,
                "gap": c_val - p_val,
                "recommendation": f"Competitor has stronger {dim} signals",
            })

    # Schema type comparison
    p_intel = primary.get("intelligence", {})
    c_intel = competitor.get("intelligence", {})
    p_schemas = set(t.lower() for t in p_intel.get("schema_types", []))
    c_schemas = set(t.lower() for t in c_intel.get("schema_types", []))
    missing_schemas = c_schemas - p_schemas
    if missing_schemas:
        gaps.append({
            "dimension": "Missing Schema Types",
            "your_score": len(p_schemas),
            "competitor_score": len(c_schemas),
            "gap": len(missing_schemas),
            "recommendation": f"Add schema types: {', '.join(missing_schemas)}",
            "missing_schema_types": list(missing_schemas),
        })

    # Content depth comparison
    p_wc = p_intel.get("word_count", 0)
    c_wc = c_intel.get("word_count", 0)
    if c_wc > p_wc * 1.5 and c_wc - p_wc > 200:
        gaps.append({
            "dimension": "Content Depth (Word Count)",
            "your_score": p_wc,
            "competitor_score": c_wc,
            "gap": c_wc - p_wc,
            "recommendation": f"Competitor has {c_wc - p_wc} more words of content",
            "content_depth_gap": True,
        })

    # Authority signals
    authority_gaps = []
    if not p_intel.get("has_author") and c_intel.get("has_author"):
        authority_gaps.append("Author attribution")
    if not p_intel.get("has_organization_schema") and c_intel.get("has_organization_schema"):
        authority_gaps.append("Organization schema")
    if authority_gaps:
        gaps.append({
            "dimension": "Authority Signals",
            "your_score": 0,
            "competitor_score": len(authority_gaps),
            "gap": len(authority_gaps),
            "recommendation": f"Missing authority signals: {', '.join(authority_gaps)}",
            "authority_signals": authority_gaps,
        })

    p_aeo = primary.get("aeo_score", 0)
    c_aeo = competitor.get("aeo_score", 0)
    if c_aeo > p_aeo + 5:
        gaps.append({
            "dimension": "Overall AEO",
            "your_score": p_aeo,
            "competitor_score": c_aeo,
            "gap": c_aeo - p_aeo,
            "recommendation": f"Competitor has {c_aeo - p_aeo} point AEO advantage",
        })

    return gaps


def _explain_gap(dimension: str, gap: int, primary: dict, competitor: dict) -> str:
    """Generate a human-readable explanation for why a competitor wins on a dimension."""
    p_intel = primary.get("intelligence", {})
    c_intel = competitor.get("intelligence", {})

    explanations = {
        "intent_match": "Competitor content better matches the search query intent with more relevant keywords and structure.",
        "extractability": "Competitor content is more structured and easier for AI to extract key facts from.",
        "authority": "Competitor has stronger authority signals (author, organization schema, external validations).",
        "schema_support": f"Competitor uses {len(c_intel.get('schema_types', []))} schema types vs your {len(p_intel.get('schema_types', []))}.",
        "content_depth": f"Competitor has {c_intel.get('word_count', 0)} words vs your {p_intel.get('word_count', 0)} words.",
    }
    return explanations.get(dimension, f"Competitor outperforms by {gap} points on {dimension}.")

