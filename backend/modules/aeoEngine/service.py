"""AEO Engine Service - Phase 1 Orchestrator"""
from datetime import datetime, timezone

from database.connection import audits_collection
from modules.aeoEngine.html_fetcher import fetch_html
from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
from modules.aeoEngine.scorer import calculate_all_scores
from modules.aeoEngine.recommender import generate_recommendations


async def run_audit(url: str, user_id: str = None) -> dict:
    # Step 1: Fetch HTML
    html = await fetch_html(url)

    # Step 2: Parse HTML
    parsed = parse_html(html, url)

    # Step 3: Classify page type
    page_type = classify_page(parsed)

    # Step 4: Build signal object
    signals = build_signals(parsed, page_type)

    # Step 5: Calculate scores
    scores = calculate_all_scores(signals)

    # Step 6: Generate recommendations
    recommendations = generate_recommendations(signals, scores)

    # Step 7: Save audit (only for authenticated users)
    audit_id = None
    created_at = datetime.now(timezone.utc).isoformat()
    
    if user_id:
        audit_doc = {
            "user_id": user_id,
            "url": url,
            "overall_score": scores["overall_score"],
            "breakdown_json": scores["breakdown"],
            "signals_json": signals,
            "recommendations": recommendations,
            "page_type": page_type,
            "created_at": created_at,
        }
        result = await audits_collection.insert_one(audit_doc)
        audit_id = str(result.inserted_id)

    return {
        "id": audit_id,
        "url": url,
        "page_type": page_type,
        "overall_score": scores["overall_score"],
        "breakdown": scores["breakdown"],
        "signals": signals,
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
