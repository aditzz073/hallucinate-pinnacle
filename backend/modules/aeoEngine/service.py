"""AEO Engine Service - Phase 1 Orchestrator with Ephemeral Content Processing"""
from datetime import datetime, timezone
import logging
import gc

from database.connection import audits_collection
from modules.aeoEngine.html_fetcher_hybrid import fetch_html_hybrid
from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
from modules.aeoEngine.scorer import calculate_all_scores
from modules.aeoEngine.recommender import generate_recommendations

logger = logging.getLogger(__name__)


async def run_audit(url: str, user_id: str = None) -> dict:
    """
    Run AEO audit with strict no-storage policy for HTML content.
    
    Content Flow (Ephemeral):
    1. Fetch HTML → in-memory only
    2. Parse → extract structured signals
    3. Score → calculate metrics
    4. Delete HTML from memory
    5. Store ONLY derived metrics
    
    NEVER persists raw HTML or rendered DOM.
    """
    # Step 1: Fetch HTML (hybrid: raw with intelligent headless fallback)
    # HTML stored in memory only
    fetch_result = await fetch_html_hybrid(url)
    html = fetch_result["html"]
    
    # Log fetch method for monitoring (NO HTML CONTENT)
    logger.info(f"Audit for {url}: method={fetch_result['method']}, "
               f"used_headless={fetch_result['used_headless']}, "
               f"render_time_ms={fetch_result['render_time_ms']}")

    try:
        # Step 2: Parse HTML → extract structured signals only
        parsed = parse_html(html, url)

        # Step 3: Classify page type
        page_type = classify_page(parsed)

        # Step 4: Build signal object (derived metrics only)
        signals = build_signals(parsed, page_type)

        # Step 5: Calculate scores
        scores = calculate_all_scores(signals)

        # Step 6: Generate recommendations
        recommendations = generate_recommendations(signals, scores)

    finally:
        # CRITICAL: Explicitly delete HTML from memory after processing
        # Enforce ephemeral content policy
        del html
        del fetch_result
        gc.collect()  # Suggest garbage collection

    # Step 7: Save audit (only for authenticated users)
    # Store ONLY derived analytical metrics, NEVER raw HTML
    audit_id = None
    created_at = datetime.now(timezone.utc).isoformat()
    
    if user_id:
        audit_doc = {
            "user_id": user_id,
            "url": url,
            "overall_score": scores["overall_score"],
            "breakdown_json": scores["breakdown"],
            "signals_json": signals,  # Structured signals only, no raw HTML
            "recommendations": recommendations,
            "page_type": page_type,
            "created_at": created_at,
            # Store fetch metadata for analytics (NO HTML CONTENT)
            "fetch_metadata": {
                "method": fetch_result["method"],
                "used_headless": fetch_result["used_headless"],
                "render_time_ms": fetch_result["render_time_ms"],
                "content_stats": fetch_result["content_stats"],  # Stats only, no content
            },
        }
        result = await audits_collection.insert_one(audit_doc)
        audit_id = str(result.inserted_id)

    return {
        "id": audit_id,
        "url": url,
        "page_type": page_type,
        "overall_score": scores["overall_score"],
        "breakdown": scores["breakdown"],
        "signals": signals,  # Structured metrics only
        "recommendations": recommendations,
        "created_at": created_at,
    }


async def get_user_audits(user_id: str, limit: int = 50) -> list:
    cursor = audits_collection.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0, "signals_json": 0},
    ).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def get_audit_detail(audit_id: str, user_id: str) -> dict:
    from bson import ObjectId

    doc = await audits_collection.find_one(
        {"_id": ObjectId(audit_id), "user_id": user_id},
    )
    if not doc:
        return None
    return {
        "id": str(doc["_id"]),
        "url": doc["url"],
        "page_type": doc.get("page_type", "generic"),
        "overall_score": doc["overall_score"],
        "breakdown": doc["breakdown_json"],
        "signals": doc.get("signals_json", {}),
        "recommendations": doc.get("recommendations", []),
        "created_at": doc["created_at"],
    }
