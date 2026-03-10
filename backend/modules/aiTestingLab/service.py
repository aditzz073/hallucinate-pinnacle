"""AI Testing Lab Service — Multi-Engine Analysis Orchestrator.

HTML fetched, parsed, then immediately deleted (ephemeral content policy).
Only derived analytical metrics are returned; no raw HTML is stored.
"""
import gc
import logging
from datetime import datetime, timezone

from modules.aeoEngine.html_fetcher_hybrid import fetch_html_hybrid
from modules.aeoEngine.html_parser import parse_html
from modules.aiTestingLab.aeo_analyzer import run_aeo_analysis
from modules.aiTestingLab.engine_profiles import ENGINE_PROFILES
from modules.aiTestingLab.engine_readiness import (
    calculate_ai_readiness,
    generate_improvements,
    get_score_grade,
)
from modules.aiTestingLab.query_relevance import evaluate_query_match, get_relevance_feedback
from modules.aiTestingLab.position_estimator import estimate_position

logger = logging.getLogger(__name__)


async def run_ai_testing_lab(query: str, url: str, engines: list) -> dict:
    """Run multi-engine AI citation readiness analysis."""
    fetch_result = await fetch_html_hybrid(url)
    html = fetch_result["html"]

    try:
        parsed = parse_html(html, url)

        relevance = evaluate_query_match(query, parsed)
        relevance_score = relevance["relevance_score"]
        relevance_feedback = get_relevance_feedback(relevance_score, relevance["title_match"])

        aeo_result = run_aeo_analysis(parsed)
        signals = aeo_result["signals"]
        page_info = aeo_result["page_info"]

    finally:
        # CRITICAL: delete HTML from memory immediately (ephemeral content policy)
        del html
        del fetch_result
        gc.collect()

    results = []
    for engine_id in engines:
        if engine_id not in ENGINE_PROFILES:
            continue

        profile = ENGINE_PROFILES[engine_id]
        readiness = calculate_ai_readiness(engine_id, signals, relevance_score)
        improvements = generate_improvements(engine_id, signals, relevance_score)
        position = estimate_position(readiness["readiness_score"])

        results.append({
            "engine_id": engine_id,
            "engine_name": profile["name"],
            "description": profile["description"],
            "readiness_score": readiness["readiness_score"],
            "grade": get_score_grade(readiness["readiness_score"]),
            "position_estimate": position,
            "strengths": readiness["strengths"],
            "weaknesses": readiness["weaknesses"],
            "improvements": improvements,
            "priority_signals": profile["priority_signals"],
            "weights": profile["weights"],
        })

    results.sort(key=lambda r: r["readiness_score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    scores = [r["readiness_score"] for r in results]
    avg_score = int(round(sum(scores) / len(scores))) if scores else 0
    best = results[0] if results else None

    return {
        "query": query,
        "url": url,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "relevance": {**relevance, "feedback": relevance_feedback},
        "page_info": page_info,
        "signals": signals,
        "overall_stats": {
            "average_score": avg_score,
            "best_engine": {
                "name": best["engine_name"],
                "score": best["readiness_score"],
            } if best else None,
            "engines_analyzed": len(results),
        },
        "results": results,
    }


async def get_quick_score(url: str, engine: str) -> dict:
    """Quick readiness check without query context (uses neutral 50% relevance)."""
    fetch_result = await fetch_html_hybrid(url)
    html = fetch_result["html"]

    try:
        parsed = parse_html(html, url)
        aeo_result = run_aeo_analysis(parsed)
        signals = aeo_result["signals"]
        page_info = aeo_result["page_info"]
    finally:
        del html
        del fetch_result
        gc.collect()

    readiness = calculate_ai_readiness(engine, signals, 50)
    profile = ENGINE_PROFILES[engine]

    return {
        "url": url,
        "engine_id": engine,
        "engine_name": profile["name"],
        "readiness_score": readiness["readiness_score"],
        "grade": get_score_grade(readiness["readiness_score"]),
        "signals": signals,
        "page_info": page_info,
    }
