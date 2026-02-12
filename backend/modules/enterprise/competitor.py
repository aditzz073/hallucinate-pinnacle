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
    }


def _compute_gaps(primary: dict, competitor: dict) -> list:
    """Compare primary vs competitor and find where primary is weaker."""
    gaps = []
    p_cb = primary.get("citation_breakdown", {})
    c_cb = competitor.get("citation_breakdown", {})

    for key in ["intent_match", "extractability", "authority", "schema_support", "content_depth"]:
        p_val = p_cb.get(key, 0)
        c_val = c_cb.get(key, 0)
        if c_val > p_val + 5:
            gaps.append({
                "dimension": key.replace("_", " ").title(),
                "your_score": p_val,
                "competitor_score": c_val,
                "gap": c_val - p_val,
                "recommendation": f"Competitor outperforms on {key.replace('_', ' ')} by {c_val - p_val} points",
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
