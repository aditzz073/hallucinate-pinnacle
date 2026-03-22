"""Strategy Simulation Service - Phase 7
Simulates content optimization impact without modifying real page."""
import copy

from modules.aeoEngine.page_fetch_service import fetch_page_content
from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
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

STRATEGIES = {
    "addFAQ": {
        "label": "Add FAQ Section",
        "description": "Simulate adding a structured FAQ section with schema markup",
    },
    "addSummary": {
        "label": "Add Summary Block",
        "description": "Simulate adding a key takeaways / summary section",
    },
    "addSchema": {
        "label": "Add Structured Data",
        "description": "Simulate adding comprehensive JSON-LD schema markup",
    },
    "improveAuthority": {
        "label": "Improve Authority Signals",
        "description": "Simulate adding author, organization, and citation signals",
    },
}


async def simulate_strategy(url: str, query: str, strategy: str, user_id: str) -> dict:
    if strategy not in STRATEGIES:
        raise ValueError(f"Unknown strategy: {strategy}. Options: {list(STRATEGIES.keys())}")

    # Fetch and parse real page
    fetch_result = await fetch_page_content(url, requester_id=user_id)
    if not fetch_result.get("success"):
        raise ValueError(fetch_result.get("error") or "Unable to fetch content")
    html = fetch_result["html"]
    parsed = parse_html(html, url)
    page_type = classify_page(parsed)
    signals = build_signals(parsed, page_type)

    # Calculate original scores
    tokens = tokenize_query(query)
    intent = detect_intent(query)
    content_match = calculate_content_match(parsed, tokens, intent)

    orig_extractability = calculate_extractability(parsed, content_match)
    orig_authority = calculate_authority(parsed, signals)
    orig_intent_match = calculate_intent_match(content_match, intent)
    orig_schema_support = calculate_schema_support(parsed, intent)
    orig_content_depth = calculate_content_depth(parsed)
    orig_probability = calculate_citation_probability(
        orig_intent_match, orig_extractability, orig_authority, orig_schema_support, orig_content_depth
    )

    # Clone and apply hypothetical adjustments
    sim_parsed = copy.deepcopy(parsed)
    sim_signals = copy.deepcopy(signals)
    sim_content_match = copy.deepcopy(content_match)

    adjustments = _apply_strategy(strategy, sim_parsed, sim_signals, sim_content_match)

    # Recalculate with simulated data
    sim_extractability = calculate_extractability(sim_parsed, sim_content_match)
    sim_authority = calculate_authority(sim_parsed, sim_signals)
    sim_intent_match = calculate_intent_match(sim_content_match, intent)
    sim_schema_support = calculate_schema_support(sim_parsed, intent)
    sim_content_depth = calculate_content_depth(sim_parsed)
    sim_probability = calculate_citation_probability(
        sim_intent_match, sim_extractability, sim_authority, sim_schema_support, sim_content_depth
    )

    delta = sim_probability - orig_probability

    return {
        "url": url,
        "query": query,
        "strategy": strategy,
        "strategy_label": STRATEGIES[strategy]["label"],
        "strategy_description": STRATEGIES[strategy]["description"],
        "original_probability": orig_probability,
        "simulated_probability": sim_probability,
        "improvement_delta": delta,
        "original_position": estimate_position(orig_probability),
        "simulated_position": estimate_position(sim_probability),
        "original_breakdown": {
            "intent_match": orig_intent_match,
            "extractability": orig_extractability,
            "authority": orig_authority,
            "schema_support": orig_schema_support,
            "content_depth": orig_content_depth,
        },
        "simulated_breakdown": {
            "intent_match": sim_intent_match,
            "extractability": sim_extractability,
            "authority": sim_authority,
            "schema_support": sim_schema_support,
            "content_depth": sim_content_depth,
        },
        "adjustments_applied": adjustments,
        "explanation": _build_explanation(strategy, delta, orig_probability, sim_probability),
    }


def _apply_strategy(strategy: str, parsed: dict, signals: dict, content_match: dict) -> list:
    """Apply hypothetical changes to cloned data. Returns list of adjustments."""
    adjustments = []

    if strategy == "addFAQ":
        # Simulate adding 5 FAQ items with schema
        parsed["faq_items"] = parsed.get("faq_items", []) + [
            {"question": f"Simulated FAQ {i+1}", "answer": f"Simulated answer {i+1}"}
            for i in range(5)
        ]
        parsed["schema_types"] = list(set(parsed.get("schema_types", []) + ["FAQPage"]))
        parsed["schema_blocks"] = parsed.get("schema_blocks", []) + [{"@type": "FAQPage"}]
        signals["schema"]["has_faq_schema"] = True
        signals["schema"]["has_json_ld"] = True
        signals["schema"]["schema_count"] = signals["schema"].get("schema_count", 0) + 1
        signals["schema"]["faq_items_count"] = len(parsed["faq_items"])
        content_match["has_faq"] = True
        content_match["faq_relevance"] = 60
        adjustments = [
            "Added 5 FAQ items with FAQPage schema",
            "Increased extractability via structured Q&A",
            "Added FAQPage JSON-LD schema type",
        ]

    elif strategy == "addSummary":
        content_match["has_summary"] = True
        content_match["has_definition"] = True
        # Boost heading count for better structure
        parsed["headings"] = parsed.get("headings", {})
        h2_list = parsed["headings"].get("h2", [])
        if "Summary" not in h2_list:
            parsed["headings"]["h2"] = h2_list + ["Summary", "Key Takeaways"]
        adjustments = [
            "Added summary/key takeaways section",
            "Added definition block in opening paragraph",
            "Added H2 headings for Summary and Key Takeaways",
        ]

    elif strategy == "addSchema":
        parsed["schema_types"] = list(set(parsed.get("schema_types", []) + [
            "Article", "BreadcrumbList", "Organization", "FAQPage",
        ]))
        parsed["schema_blocks"] = parsed.get("schema_blocks", []) + [
            {"@type": "Article"}, {"@type": "BreadcrumbList"}, {"@type": "Organization"},
        ]
        signals["schema"]["has_json_ld"] = True
        signals["schema"]["has_article_schema"] = True
        signals["schema"]["has_breadcrumb"] = True
        signals["schema"]["has_organization_schema"] = True
        signals["schema"]["schema_count"] = max(signals["schema"].get("schema_count", 0), 4)
        parsed["has_organization_schema"] = True
        adjustments = [
            "Added Article JSON-LD schema",
            "Added BreadcrumbList schema",
            "Added Organization schema",
            "Comprehensive structured data coverage",
        ]

    elif strategy == "improveAuthority":
        parsed["author"] = parsed.get("author") or "Expert Author"
        parsed["has_organization_schema"] = True
        parsed["has_contact_info"] = True
        parsed["external_links"] = max(parsed.get("external_links", 0), 5)
        signals["trust"]["has_author"] = True
        signals["trust"]["has_organization_schema"] = True
        signals["trust"]["has_contact_info"] = True
        signals["trust"]["external_links"] = max(signals["trust"].get("external_links", 0), 5)
        adjustments = [
            "Added author attribution",
            "Added Organization schema",
            "Added contact information",
            "Added 5+ external citations/references",
        ]

    return adjustments


def _build_explanation(strategy: str, delta: int, orig: int, simulated: int) -> str:
    if delta > 15:
        impact = "significant"
    elif delta > 5:
        impact = "moderate"
    elif delta > 0:
        impact = "marginal"
    else:
        impact = "minimal"

    label = STRATEGIES[strategy]["label"]
    return (
        f"Applying '{label}' would result in a {impact} improvement. "
        f"Citation probability moves from {orig}% to {simulated}% (+{delta} points). "
        f"This strategy primarily affects the scoring dimensions most related to {strategy.replace('add', '').replace('improve', '').lower()} signals."
    )
