"""Reports Service - Phase 4"""
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from database.connection import (
    audits_collection,
    ai_tests_collection,
    monitored_pages_collection,
    page_snapshots_collection,
    page_change_logs_collection,
)


async def get_overview(user_id: str) -> dict:
    """Dashboard overview stats."""
    total_audits = await audits_collection.count_documents({"user_id": user_id})
    total_ai_tests = await ai_tests_collection.count_documents({"user_id": user_id})
    total_monitored = await monitored_pages_collection.count_documents({"user_id": user_id})

    # Count total changes across all monitored pages
    monitored_pages = await monitored_pages_collection.find(
        {"user_id": user_id}, {"_id": 1}
    ).to_list(length=1000)
    page_ids = [str(p["_id"]) for p in monitored_pages]
    total_changes = 0
    if page_ids:
        total_changes = await page_change_logs_collection.count_documents(
            {"monitored_page_id": {"$in": page_ids}}
        )

    # Average audit score
    avg_score = 0
    if total_audits > 0:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avg": {"$avg": "$overall_score"}}},
        ]
        result = await audits_collection.aggregate(pipeline).to_list(length=1)
        if result:
            avg_score = round(result[0]["avg"], 1)

    # Average citation probability
    avg_citation = 0
    if total_ai_tests > 0:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avg": {"$avg": "$citation_probability"}}},
        ]
        result = await ai_tests_collection.aggregate(pipeline).to_list(length=1)
        if result:
            avg_citation = round(result[0]["avg"], 1)

    # Recent audits (last 5)
    recent_audits = await audits_collection.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0, "signals_json": 0, "recommendations": 0},
    ).sort("created_at", -1).limit(5).to_list(length=5)

    # Recent AI tests (last 5)
    recent_tests = await ai_tests_collection.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0, "why_not_cited": 0, "improvement_suggestions": 0},
    ).sort("created_at", -1).limit(5).to_list(length=5)

    return {
        "summary": {
            "total_audits": total_audits,
            "total_ai_tests": total_ai_tests,
            "total_monitored_pages": total_monitored,
            "total_changes_detected": total_changes,
            "average_aeo_score": avg_score,
            "average_citation_probability": avg_citation,
        },
        "recent_audits": recent_audits,
        "recent_ai_tests": recent_tests,
    }


async def get_trends(user_id: str, url: str = None) -> dict:
    """Score trends over time."""
    # Audit score trends
    audit_filter = {"user_id": user_id}
    if url:
        audit_filter["url"] = url

    audit_cursor = audits_collection.find(
        audit_filter,
        {"_id": 0, "url": 1, "overall_score": 1, "breakdown_json": 1, "created_at": 1},
    ).sort("created_at", 1).limit(100)
    audit_trends = await audit_cursor.to_list(length=100)

    # AI test trends
    test_filter = {"user_id": user_id}
    if url:
        test_filter["url"] = url

    test_cursor = ai_tests_collection.find(
        test_filter,
        {"_id": 0, "url": 1, "query": 1, "citation_probability": 1, "engine_scores_json": 1, "created_at": 1},
    ).sort("created_at", 1).limit(100)
    test_trends = await test_cursor.to_list(length=100)

    # Calculate weekly averages for audits
    weekly_audit = _aggregate_weekly(
        audit_trends, "overall_score", "created_at"
    )

    # Calculate breakdown averages
    breakdown_avg = _calculate_breakdown_average(audit_trends)

    # Snapshot trends for monitored pages
    snapshot_trends = []
    if url:
        page = await monitored_pages_collection.find_one(
            {"user_id": user_id, "url": url}
        )
        if page:
            page_id = str(page["_id"])
            snapshots = await page_snapshots_collection.find(
                {"monitored_page_id": page_id},
                {"_id": 0, "signals_json": 1, "fetched_at": 1},
            ).sort("fetched_at", 1).limit(50).to_list(length=50)
            snapshot_trends = snapshots

    # Calculate deltas
    audit_delta = 0
    if len(audit_trends) >= 2:
        audit_delta = audit_trends[-1]["overall_score"] - audit_trends[-2]["overall_score"]

    test_delta = 0
    if len(test_trends) >= 2:
        test_delta = test_trends[-1]["citation_probability"] - test_trends[-2]["citation_probability"]

    return {
        "audit_trends": audit_trends,
        "test_trends": test_trends,
        "weekly_averages": weekly_audit,
        "breakdown_averages": breakdown_avg,
        "snapshot_trends": snapshot_trends,
        "deltas": {
            "audit_score_delta": audit_delta,
            "citation_probability_delta": test_delta,
        },
    }


async def get_competitors(user_id: str) -> dict:
    """Compare audits and AI tests across different URLs."""
    # Get all unique URLs from audits
    audit_pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": "$url",
                "latest_score": {"$last": "$overall_score"},
                "latest_breakdown": {"$last": "$breakdown_json"},
                "avg_score": {"$avg": "$overall_score"},
                "audit_count": {"$sum": 1},
                "latest_at": {"$last": "$created_at"},
            }
        },
        {"$sort": {"latest_score": -1}},
    ]
    audit_comparison = await audits_collection.aggregate(audit_pipeline).to_list(length=50)

    # Get AI test comparison
    test_pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": "$url",
                "avg_citation": {"$avg": "$citation_probability"},
                "latest_citation": {"$last": "$citation_probability"},
                "test_count": {"$sum": 1},
                "latest_at": {"$last": "$created_at"},
            }
        },
        {"$sort": {"avg_citation": -1}},
    ]
    test_comparison = await ai_tests_collection.aggregate(test_pipeline).to_list(length=50)

    # Build combined comparison
    url_map = {}
    for a in audit_comparison:
        url = a["_id"]
        url_map[url] = {
            "url": url,
            "aeo_score": a["latest_score"],
            "avg_aeo_score": round(a["avg_score"], 1),
            "aeo_breakdown": a.get("latest_breakdown", {}),
            "audit_count": a["audit_count"],
            "citation_probability": 0,
            "avg_citation": 0,
            "test_count": 0,
        }

    for t in test_comparison:
        url = t["_id"]
        if url in url_map:
            url_map[url]["citation_probability"] = round(t["latest_citation"], 1)
            url_map[url]["avg_citation"] = round(t["avg_citation"], 1)
            url_map[url]["test_count"] = t["test_count"]
        else:
            url_map[url] = {
                "url": url,
                "aeo_score": 0,
                "avg_aeo_score": 0,
                "aeo_breakdown": {},
                "audit_count": 0,
                "citation_probability": round(t["latest_citation"], 1),
                "avg_citation": round(t["avg_citation"], 1),
                "test_count": t["test_count"],
            }

    comparison_list = sorted(
        url_map.values(),
        key=lambda x: x["aeo_score"],
        reverse=True,
    )

    return {
        "comparison": comparison_list,
        "total_urls": len(comparison_list),
    }


def _aggregate_weekly(items: list, score_key: str, date_key: str) -> list:
    """Group items by week and calculate averages."""
    if not items:
        return []

    weekly = {}
    for item in items:
        date_str = item.get(date_key, "")
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            week_start = dt - timedelta(days=dt.weekday())
            week_key = week_start.strftime("%Y-%m-%d")
        except (ValueError, AttributeError):
            continue

        if week_key not in weekly:
            weekly[week_key] = {"total": 0, "count": 0}
        weekly[week_key]["total"] += item.get(score_key, 0)
        weekly[week_key]["count"] += 1

    return [
        {
            "week": k,
            "average": round(v["total"] / v["count"], 1),
            "count": v["count"],
        }
        for k, v in sorted(weekly.items())
    ]


def _calculate_breakdown_average(audit_trends: list) -> dict:
    """Average breakdown scores across all audits."""
    if not audit_trends:
        return {
            "structure": 0,
            "trust": 0,
            "media": 0,
            "schema": 0,
            "technical": 0,
        }

    totals = {"structure": 0, "trust": 0, "media": 0, "schema": 0, "technical": 0}
    count = 0
    for audit in audit_trends:
        bd = audit.get("breakdown_json", {})
        if bd:
            for key in totals:
                totals[key] += bd.get(key, 0)
            count += 1

    if count == 0:
        return totals

    return {k: round(v / count, 1) for k, v in totals.items()}
