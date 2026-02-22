"""AI Testing Engine Service - Phase 2 Orchestrator with GEO Integration and Ephemeral Content Processing"""
from datetime import datetime, timezone
import logging
import gc

from database.connection import ai_tests_collection
from modules.aeoEngine.html_fetcher_hybrid import fetch_html_hybrid
from modules.aeoEngine.html_parser import parse_html
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
    generate_why_not_cited,
    generate_improvement_suggestions,
)
from modules.aiTestingEngine.geo_service import run_geo_analysis
from modules.aiTestingEngine.recommendation_formatter import (
    format_citation_gap,
    format_citation_suggestion,
    format_geo_recommendations,
)

logger = logging.getLogger(__name__)


async def run_ai_test(url: str, query: str, user_id: str = None) -> dict:
    """
    Run AI Citation Test with strict no-storage policy for HTML content.
    
    Content Flow (Ephemeral):
    1. Fetch HTML → in-memory only
    2. Parse → extract structured signals
    3. Calculate citation & GEO metrics
    4. Delete HTML from memory
    5. Store ONLY derived metrics
    
    NEVER persists raw HTML or rendered DOM.
    """
    # Fetch and parse (hybrid: raw with intelligent headless fallback)
    # HTML stored in memory only
    fetch_result = await fetch_html_hybrid(url)
    html = fetch_result["html"]
    
    # Extract metadata before processing (NO HTML CONTENT)
    fetch_metadata = {
        "method": fetch_result["method"],
        "used_headless": fetch_result["used_headless"],
        "render_time_ms": fetch_result["render_time_ms"],
        "content_stats": fetch_result["content_stats"],  # Stats only, no content
    }
    
    # Log fetch method for monitoring (NO HTML CONTENT)
    logger.info(f"AI Test for {url}: method={fetch_metadata['method']}, "
               f"used_headless={fetch_metadata['used_headless']}, "
               f"render_time_ms={fetch_metadata['render_time_ms']}")
    
    try:
        # Parse HTML → extract structured signals only
        parsed = parse_html(html, url)

        # Step 1: Query processing
        tokens = tokenize_query(query)
        intent = detect_intent(query)

        # Step 2: Content matching
        content_match = calculate_content_match(parsed, tokens, intent)

        # Step 3: Extractability
        extractability = calculate_extractability(parsed, content_match)

        # Step 4: Authority
        authority = calculate_authority(parsed, {})

        # Step 5: Citation probability
        intent_match = calculate_intent_match(content_match, intent)
        schema_support = calculate_schema_support(parsed, intent)
        content_depth = calculate_content_depth(parsed)
        citation_prob = calculate_citation_probability(
            intent_match, extractability, authority, schema_support, content_depth
        )

        # Step 6: Position estimation
        likely_position = estimate_position(citation_prob)

        # Step 7: Why not cited
        why_not_cited = generate_why_not_cited(
            parsed, content_match, intent,
            intent_match, extractability, authority, schema_support, content_depth,
        )
        improvement_suggestions = generate_improvement_suggestions(why_not_cited, intent)
        
        # Format recommendations into copilot-style advisory messages
        formatted_gaps = [format_citation_gap(g) for g in why_not_cited]
        formatted_suggestions = [format_citation_suggestion(s, intent) for s in improvement_suggestions]

        # NEW: Step 8 - GEO Analysis
        geo_result = run_geo_analysis(parsed)
        
        # Format GEO insights with impact levels
        formatted_geo_insights = format_geo_recommendations(geo_result.get("geo_insights"))

        # Step 9: Compile scores (derived metrics only)
        engine_scores = {
            "intent_match": intent_match,
            "extractability": extractability,
            "authority": authority,
            "schema_support": schema_support,
            "content_depth": content_depth,
        }
        
        geo_scores = {
            "generative_readiness": geo_result["generative_readiness"],
            "summarization_resilience": geo_result["summarization_resilience"],
            "brand_retention_probability": geo_result["brand_retention_probability"],
        }
    
    finally:
        # CRITICAL: Explicitly delete HTML from memory after processing
        # Enforce ephemeral content policy - HTML must not persist
        del html
        del fetch_result
        gc.collect()  # Suggest garbage collection to free memory

    created_at = datetime.now(timezone.utc).isoformat()
    test_id = None

    # Step 10: Save result (only for authenticated users)
    if user_id:
        test_doc = {
            "user_id": user_id,
            "url": url,
            "query": query,
            "intent": intent,
            "citation_probability": citation_prob,
            "engine_scores_json": engine_scores,
            "likely_position": likely_position,
            "why_not_cited": formatted_gaps,
            "improvement_suggestions": formatted_suggestions,
            # GEO fields
            "geo_score": geo_result["geo_score"],
            "geo_scores_json": geo_scores,
            "detected_brand": geo_result.get("detected_brand"),
            "geo_breakdown_json": geo_result.get("geo_breakdown"),
            "geo_insights_json": formatted_geo_insights,
            "created_at": created_at,
            # Store fetch metadata for analytics
            "fetch_metadata": {
                "method": fetch_result["method"],
                "used_headless": fetch_result["used_headless"],
                "render_time_ms": fetch_result["render_time_ms"],
                "content_stats": fetch_result["content_stats"],
            },
        }
        result = await ai_tests_collection.insert_one(test_doc)
        test_id = str(result.inserted_id)

    return {
        "id": test_id,
        "url": url,
        "query": query,
        "intent": intent,
        # Citation metrics
        "citation_probability": citation_prob,
        "breakdown": engine_scores,
        "likely_position": likely_position,
        "why_not_cited": formatted_gaps,
        "improvement_suggestions": formatted_suggestions,
        # GEO metrics
        "geo_score": geo_result["geo_score"],
        "generative_readiness": geo_result["generative_readiness"],
        "summarization_resilience": geo_result["summarization_resilience"],
        "brand_retention_probability": geo_result["brand_retention_probability"],
        "detected_brand": geo_result.get("detected_brand"),
        "geo_insights": formatted_geo_insights,
        "created_at": created_at,
    }


async def get_user_ai_tests(user_id: str, limit: int = 50) -> list:
    cursor = ai_tests_collection.find(
        {"user_id": user_id},
        {
            "_id": 0, 
            "user_id": 0, 
            "why_not_cited": 0, 
            "improvement_suggestions": 0,
            "geo_breakdown_json": 0,
            "geo_insights_json": 0,
        },
    ).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def get_ai_test_detail(test_id: str, user_id: str) -> dict:
    from bson import ObjectId

    doc = await ai_tests_collection.find_one(
        {"_id": ObjectId(test_id), "user_id": user_id},
    )
    if not doc:
        return None
    return {
        "id": str(doc["_id"]),
        "url": doc["url"],
        "query": doc["query"],
        "intent": doc.get("intent", ""),
        "citation_probability": doc["citation_probability"],
        "breakdown": doc["engine_scores_json"],
        "likely_position": doc.get("likely_position", ""),
        "why_not_cited": doc.get("why_not_cited", []),
        "improvement_suggestions": doc.get("improvement_suggestions", []),
        # GEO fields
        "geo_score": doc.get("geo_score", 0),
        "generative_readiness": doc.get("geo_scores_json", {}).get("generative_readiness", 0),
        "summarization_resilience": doc.get("geo_scores_json", {}).get("summarization_resilience", 0),
        "brand_retention_probability": doc.get("geo_scores_json", {}).get("brand_retention_probability", 0),
        "detected_brand": doc.get("detected_brand"),
        "geo_insights": doc.get("geo_insights_json"),
        "created_at": doc["created_at"],
    }
