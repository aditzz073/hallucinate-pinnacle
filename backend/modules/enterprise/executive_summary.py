"""Executive Summary Generator - Phase 9
Deterministic structured summary, no external AI calls."""
from database.connection import (
    audits_collection,
    ai_tests_collection,
    monitored_pages_collection,
    page_change_logs_collection,
)


async def generate_executive_summary(user_id: str) -> dict:
    # Gather data
    audits = await audits_collection.find(
        {"user_id": user_id},
        {"_id": 0, "url": 1, "overall_score": 1, "breakdown_json": 1, "recommendations": 1, "created_at": 1},
    ).sort("created_at", -1).limit(50).to_list(length=50)

    ai_tests = await ai_tests_collection.find(
        {"user_id": user_id},
        {"_id": 0, "url": 1, "citation_probability": 1, "engine_scores_json": 1, "created_at": 1},
    ).sort("created_at", -1).limit(50).to_list(length=50)

    monitored = await monitored_pages_collection.find(
        {"user_id": user_id}, {"_id": 1, "url": 1}
    ).to_list(length=100)
    page_ids = [str(p["_id"]) for p in monitored]

    total_changes = 0
    negative_changes = 0
    if page_ids:
        total_changes = await page_change_logs_collection.count_documents(
            {"monitored_page_id": {"$in": page_ids}}
        )
        negative_changes = await page_change_logs_collection.count_documents(
            {"monitored_page_id": {"$in": page_ids}, "impact": "negative"}
        )

    # Calculate overall health
    overall_health = _calculate_health(audits, ai_tests)

    # Key weaknesses
    key_weaknesses = _identify_weaknesses(audits, ai_tests)

    # Highest impact improvement
    highest_impact = _find_highest_impact(audits)

    # Competitive standing
    competitive_standing = _assess_competitive_standing(audits, ai_tests)

    return {
        "overall_health": overall_health,
        "key_weaknesses": key_weaknesses,
        "highest_impact_improvement": highest_impact,
        "competitive_standing": competitive_standing,
        "data_coverage": {
            "total_audits": len(audits),
            "total_ai_tests": len(ai_tests),
            "monitored_pages": len(monitored),
            "total_changes": total_changes,
            "negative_changes": negative_changes,
        },
    }


def _calculate_health(audits: list, ai_tests: list) -> dict:
    if not audits and not ai_tests:
        return {
            "status": "insufficient_data",
            "score": 0,
            "summary": "Not enough data to assess health. Run audits and AI tests to get started.",
        }

    avg_aeo = sum(a["overall_score"] for a in audits) / len(audits) if audits else 0
    avg_citation = sum(t["citation_probability"] for t in ai_tests) / len(ai_tests) if ai_tests else 0

    combined = (avg_aeo * 0.5 + avg_citation * 0.5) if audits and ai_tests else (avg_aeo or avg_citation)

    if combined >= 70:
        status = "strong"
        summary = f"Your AI discoverability is strong. Average AEO score: {avg_aeo:.0f}, Average citation probability: {avg_citation:.0f}%."
    elif combined >= 45:
        status = "moderate"
        summary = f"Your AI discoverability has room for improvement. AEO: {avg_aeo:.0f}, Citation: {avg_citation:.0f}%."
    else:
        status = "weak"
        summary = f"Your AI discoverability needs significant work. AEO: {avg_aeo:.0f}, Citation: {avg_citation:.0f}%."

    return {
        "status": status,
        "score": round(combined, 1),
        "average_aeo_score": round(avg_aeo, 1),
        "average_citation_probability": round(avg_citation, 1),
        "summary": summary,
    }


def _identify_weaknesses(audits: list, ai_tests: list) -> list:
    weaknesses = []

    if audits:
        # Aggregate breakdown scores
        totals = {"structure": 0, "trust": 0, "media": 0, "schema": 0, "technical": 0}
        for a in audits:
            bd = a.get("breakdown_json", {})
            for k in totals:
                totals[k] += bd.get(k, 0)
        count = len(audits)
        avgs = {k: round(v / count, 1) for k, v in totals.items()}

        # Find weakest categories
        sorted_cats = sorted(avgs.items(), key=lambda x: x[1])
        for cat, avg in sorted_cats[:3]:
            if avg < 50:
                weaknesses.append({
                    "category": cat,
                    "average_score": avg,
                    "severity": "high" if avg < 30 else "medium",
                    "description": f"{cat.title()} is your weakest area at {avg}/100 average",
                })

    if ai_tests:
        # Aggregate citation breakdowns
        dim_totals = {"intent_match": 0, "extractability": 0, "authority": 0, "schema_support": 0, "content_depth": 0}
        for t in ai_tests:
            es = t.get("engine_scores_json", {})
            for k in dim_totals:
                dim_totals[k] += es.get(k, 0)
        count = len(ai_tests)
        dim_avgs = {k: round(v / count, 1) for k, v in dim_totals.items()}

        sorted_dims = sorted(dim_avgs.items(), key=lambda x: x[1])
        for dim, avg in sorted_dims[:2]:
            if avg < 40:
                weaknesses.append({
                    "category": dim.replace("_", " ").title(),
                    "average_score": avg,
                    "severity": "high" if avg < 20 else "medium",
                    "description": f"{dim.replace('_', ' ').title()} averages {avg}/100 across AI tests",
                })

    # Count most common recommendation issues
    if audits:
        issue_counts = {}
        for a in audits:
            for rec in a.get("recommendations", []):
                if rec.get("severity") == "high":
                    issue = rec.get("issue", "")
                    issue_counts[issue] = issue_counts.get(issue, 0) + 1
        top_issues = sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        for issue, count in top_issues:
            weaknesses.append({
                "category": "Recurring Issue",
                "average_score": 0,
                "severity": "high",
                "description": f'"{issue}" found in {count}/{len(audits)} audits',
            })

    return weaknesses[:8]


def _find_highest_impact(audits: list) -> dict:
    if not audits:
        return {
            "recommendation": "Run your first audit to get improvement suggestions",
            "estimated_impact": "unknown",
            "category": "none",
        }

    # Find the most common high-severity recommendation
    issue_counts = {}
    issue_details = {}
    for a in audits:
        for rec in a.get("recommendations", []):
            if rec.get("severity") in ("high", "medium"):
                issue = rec["issue"]
                issue_counts[issue] = issue_counts.get(issue, 0) + 1
                issue_details[issue] = rec

    if not issue_counts:
        return {
            "recommendation": "All major issues addressed. Focus on expanding content depth.",
            "estimated_impact": "moderate",
            "category": "content",
        }

    top_issue = max(issue_counts, key=issue_counts.get)
    detail = issue_details[top_issue]

    return {
        "recommendation": detail.get("how_to_fix", ""),
        "issue": top_issue,
        "severity": detail.get("severity", ""),
        "estimated_impact": "high" if issue_counts[top_issue] > len(audits) * 0.5 else "moderate",
        "affected_audits": f"{issue_counts[top_issue]}/{len(audits)}",
        "category": _categorize_issue(top_issue),
    }


def _categorize_issue(issue: str) -> str:
    issue_lower = issue.lower()
    if any(kw in issue_lower for kw in ["schema", "json-ld", "structured data"]):
        return "schema"
    if any(kw in issue_lower for kw in ["author", "organization", "contact", "trust"]):
        return "trust"
    if any(kw in issue_lower for kw in ["title", "h1", "heading", "meta", "content"]):
        return "structure"
    if any(kw in issue_lower for kw in ["image", "alt", "media"]):
        return "media"
    return "technical"


def _assess_competitive_standing(audits: list, ai_tests: list) -> dict:
    if not audits:
        return {"status": "unknown", "summary": "No data to assess competitive standing."}

    urls = set(a["url"] for a in audits)
    url_scores = {}
    for a in audits:
        u = a["url"]
        if u not in url_scores:
            url_scores[u] = []
        url_scores[u].append(a["overall_score"])

    url_avgs = {u: sum(scores) / len(scores) for u, scores in url_scores.items()}

    if len(url_avgs) < 2:
        avg = list(url_avgs.values())[0] if url_avgs else 0
        return {
            "status": "single_url",
            "summary": f"Only one URL analyzed (score: {avg:.0f}). Add competitor URLs for comparison.",
            "urls_analyzed": len(url_avgs),
        }

    sorted_urls = sorted(url_avgs.items(), key=lambda x: x[1], reverse=True)
    best = sorted_urls[0]
    worst = sorted_urls[-1]

    return {
        "status": "comparative",
        "urls_analyzed": len(url_avgs),
        "best_performing": {"url": best[0], "avg_score": round(best[1], 1)},
        "worst_performing": {"url": worst[0], "avg_score": round(worst[1], 1)},
        "score_spread": round(best[1] - worst[1], 1),
        "summary": f"Analyzed {len(url_avgs)} URLs. Best: {round(best[1], 1)}, Worst: {round(worst[1], 1)}, Spread: {round(best[1] - worst[1], 1)} points.",
    }
