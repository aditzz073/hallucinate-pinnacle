"""Advanced Audit Service - Phase 5"""
from datetime import datetime, timezone

from database.connection import (
    audits_collection,
    monitored_pages_collection,
    page_snapshots_collection,
    page_change_logs_collection,
)
from modules.aeoEngine.html_fetcher import fetch_html
from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
from modules.aeoEngine.scorer import calculate_all_scores
from modules.aeoEngine.recommender import generate_recommendations
from modules.advancedAudit.explainability import (
    build_explainability,
    count_total_signals,
    SCORING_VERSION,
)


async def run_advanced_audit(url: str, user_id: str) -> dict:
    html = await fetch_html(url)
    parsed = parse_html(html, url)
    page_type = classify_page(parsed)
    signals = build_signals(parsed, page_type)
    scores = calculate_all_scores(signals)
    recommendations = generate_recommendations(signals, scores)

    # Explainability layer
    explainability = build_explainability(signals)
    total_signals = count_total_signals(explainability)

    # Historical intelligence
    historical = await _build_historical_intelligence(url, user_id, recommendations)

    now = datetime.now(timezone.utc).isoformat()

    # Audit integrity metadata
    audit_integrity = {
        "deterministic": True,
        "last_analyzed_at": now,
        "scoring_version": SCORING_VERSION,
        "total_signals_evaluated": total_signals,
    }

    # Save
    audit_doc = {
        "user_id": user_id,
        "url": url,
        "overall_score": scores["overall_score"],
        "breakdown_json": scores["breakdown"],
        "signals_json": signals,
        "recommendations": recommendations,
        "page_type": page_type,
        "advanced": True,
        "created_at": now,
    }
    result = await audits_collection.insert_one(audit_doc)

    return {
        "id": str(result.inserted_id),
        "url": url,
        "page_type": page_type,
        "overall_score": scores["overall_score"],
        "breakdown": scores["breakdown"],
        "explainability": explainability,
        "signals": signals,
        "recommendations": recommendations,
        "historical_intelligence": historical,
        "audit_integrity": audit_integrity,
        "created_at": now,
    }


async def _build_historical_intelligence(url: str, user_id: str, recommendations: list) -> list:
    """Attach historical context to each recommendation if monitoring data exists."""
    # Find monitored page for this URL
    page = await monitored_pages_collection.find_one(
        {"user_id": user_id, "url": url}
    )
    if not page:
        return [
            {**rec, "historical": {"is_new_issue": True, "first_detected_at": None, "last_seen_at": None, "change_explanation": "No monitoring history available"}}
            for rec in recommendations
        ]

    page_id = str(page["_id"])

    # Get change logs for this page
    change_logs = await page_change_logs_collection.find(
        {"monitored_page_id": page_id}
    ).sort("detected_at", 1).to_list(length=500)

    # Get snapshots
    snapshots = await page_snapshots_collection.find(
        {"monitored_page_id": page_id}
    ).sort("fetched_at", 1).to_list(length=100)

    # Map signal names from change logs
    signal_history = {}
    for log in change_logs:
        name = log["signal_name"]
        if name not in signal_history:
            signal_history[name] = {"first": log["detected_at"], "last": log["detected_at"], "changes": []}
        signal_history[name]["last"] = log["detected_at"]
        signal_history[name]["changes"].append(log)

    enriched = []
    first_snapshot_at = snapshots[0]["fetched_at"] if snapshots else None

    for rec in recommendations:
        issue = rec.get("issue", "").lower()

        # Try to map recommendation to a signal name
        related_signal = _map_issue_to_signal(issue)
        history_entry = signal_history.get(related_signal)

        if history_entry:
            enriched.append({
                **rec,
                "historical": {
                    "is_new_issue": False,
                    "first_detected_at": history_entry["first"],
                    "last_seen_at": history_entry["last"],
                    "change_explanation": f"This signal has changed {len(history_entry['changes'])} time(s) since monitoring began",
                },
            })
        else:
            enriched.append({
                **rec,
                "historical": {
                    "is_new_issue": True,
                    "first_detected_at": first_snapshot_at,
                    "last_seen_at": None,
                    "change_explanation": "Issue present since first snapshot; no changes detected",
                },
            })

    return enriched


def _map_issue_to_signal(issue: str) -> str:
    """Map a recommendation issue text to a tracked signal name."""
    mapping = {
        "title": "has_title",
        "meta description": "has_meta_description",
        "h1": "h1_count",
        "heading hierarchy": "has_heading_hierarchy",
        "content": "word_count",
        "internal links": "internal_links",
        "author": "has_author",
        "organization schema": "has_organization_schema",
        "contact": "has_contact_info",
        "images": "total_images",
        "alt text": "images_with_alt",
        "json-ld": "has_json_ld",
        "structured data": "has_json_ld",
        "faq": "has_faq_schema",
        "breadcrumb": "has_breadcrumb",
        "canonical": "has_canonical",
        "noindex": "has_noindex",
        "open graph": "has_og_tags",
        "lang": "has_lang",
        "viewport": "has_viewport",
    }
    issue_lower = issue.lower()
    for keyword, signal in mapping.items():
        if keyword in issue_lower:
            return signal
    return ""
