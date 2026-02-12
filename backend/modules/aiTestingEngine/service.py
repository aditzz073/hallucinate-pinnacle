"""AI Testing Engine Service - Phase 2 Orchestrator"""
from datetime import datetime, timezone

from database.connection import ai_tests_collection
from modules.aeoEngine.html_fetcher import fetch_html
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


async def run_ai_test(url: str, query: str, user_id: str) -> dict:
    # Fetch and parse
    html = await fetch_html(url)
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

    # Step 8: Save result
    engine_scores = {
        "intent_match": intent_match,
        "extractability": extractability,
        "authority": authority,
        "schema_support": schema_support,
        "content_depth": content_depth,
    }

    test_doc = {
        "user_id": user_id,
        "url": url,
        "query": query,
        "intent": intent,
        "citation_probability": citation_prob,
        "engine_scores_json": engine_scores,
        "likely_position": likely_position,
        "why_not_cited": why_not_cited,
        "improvement_suggestions": improvement_suggestions,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await ai_tests_collection.insert_one(test_doc)

    return {
        "id": str(result.inserted_id),
        "url": url,
        "query": query,
        "intent": intent,
        "citation_probability": citation_prob,
        "breakdown": engine_scores,
        "likely_position": likely_position,
        "why_not_cited": why_not_cited,
        "improvement_suggestions": improvement_suggestions,
        "created_at": test_doc["created_at"],
    }


async def get_user_ai_tests(user_id: str, limit: int = 50) -> list:
    cursor = ai_tests_collection.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0, "why_not_cited": 0, "improvement_suggestions": 0},
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
        "created_at": doc["created_at"],
    }
