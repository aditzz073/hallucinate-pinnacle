"""Advanced Audit Service - Phase 5"""
import json
import logging
import os
import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from openai import AsyncOpenAI

from database.connection import (
    audits_collection,
    monitored_pages_collection,
    page_snapshots_collection,
    page_change_logs_collection,
)
from modules.aeoEngine.page_fetch_service import fetch_page_content
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
from modules.aiTestingEngine.query_processor import tokenize_query, detect_intent
from modules.aiTestingEngine.content_matcher import calculate_content_match
from modules.aiTestingEngine.extractability import calculate_extractability
from modules.aiTestingEngine.authority import calculate_authority
from modules.aiTestingEngine.citation_calculator import (
    calculate_intent_match,
    calculate_schema_support,
    calculate_content_depth,
    calculate_citation_probability,
)
from modules.aiTestingEngine.geo_service import run_geo_analysis


logger = logging.getLogger(__name__)

DEFAULT_ENGINES = ["ChatGPT", "Perplexity", "Copilot", "Google SGE"]

SCORING_WEIGHTS = {
    "overall_aeo": {
        "structure": 0.25,
        "trust": 0.20,
        "media": 0.15,
        "schema": 0.25,
        "technical": 0.15,
    },
    "citation_probability": {
        "intent_match": 0.25,
        "extractability": 0.25,
        "authority": 0.20,
        "schema_support": 0.15,
        "content_depth": 0.15,
    },
}


def _rank_recommendation_severity(severity: str) -> int:
    order = {"high": 0, "medium": 1, "low": 2}
    return order.get((severity or "").lower(), 3)


def _extract_key_issues(recommendations: list) -> list[str]:
    sorted_recs = sorted(
        recommendations,
        key=lambda r: (_rank_recommendation_severity(r.get("severity")), r.get("issue", "")),
    )
    return [r.get("issue") for r in sorted_recs if r.get("issue")][:6]


def _infer_category_from_issue(issue: str) -> str:
    issue_lower = (issue or "").lower()
    if any(k in issue_lower for k in ["json-ld", "schema", "faq", "breadcrumb"]):
        return "schema"
    if any(k in issue_lower for k in ["title", "meta", "heading", "h1", "content", "internal link"]):
        return "structure"
    if any(k in issue_lower for k in ["author", "organization", "contact", "trust"]):
        return "trust"
    if any(k in issue_lower for k in ["image", "alt text", "media"]):
        return "media"
    return "technical"


def _normalize_engine_recommendations(engine_recommendations: list | None, recommendations: list | None) -> list:
    normalized = []

    for rec in engine_recommendations or []:
        if not isinstance(rec, dict):
            continue
        engine = rec.get("engine") or rec.get("source") or rec.get("model") or "Unknown"
        action = rec.get("action") or rec.get("issue") or rec.get("recommendation") or ""
        reason = rec.get("reason") or rec.get("detail") or rec.get("impact_explanation") or ""
        category = rec.get("category") or _infer_category_from_issue(action)
        if action:
            normalized.append(
                {
                    "engine": engine,
                    "action": action,
                    "reason": reason,
                    "category": category,
                    "severity": rec.get("severity", "medium"),
                }
            )

    if normalized:
        return normalized

    for rec in recommendations or []:
        issue = rec.get("issue", "")
        normalized.append(
            {
                "engine": "all",
                "action": rec.get("how_to_fix") or issue,
                "reason": rec.get("impact_explanation") or issue,
                "category": _infer_category_from_issue(issue),
                "severity": rec.get("severity", "medium"),
            }
        )

    return normalized


def _gain_range_for_fix(category: str, severity: str, breakdown: dict) -> tuple[int, int]:
    category = (category or "technical").lower()
    severity = (severity or "medium").lower()
    category_score = int((breakdown or {}).get(category, 60) or 60)

    base = {
        "schema": 18,
        "structure": 10,
        "trust": 9,
        "technical": 7,
        "media": 6,
    }.get(category, 6)

    severity_bonus = {"high": 4, "medium": 2, "low": 0}.get(severity, 1)
    score_penalty_bonus = max(0, int((60 - category_score) / 10))
    low = max(2, base + severity_bonus + score_penalty_bonus - 2)
    high = min(30, low + 4)
    return low, high


def _difficulty_from_category(category: str, action: str = "") -> str:
    category = (category or "").lower()
    action_lower = (action or "").lower()
    if category == "schema":
        return "medium"
    if category == "technical" and any(k in action_lower for k in ["canonical", "lang", "open graph", "twitter"]):
        return "easy"
    if category == "structure":
        return "easy"
    if category == "trust":
        return "medium"
    if category == "media":
        return "easy"
    return "medium"


def _merge_fixes_fallback(audit_data: dict, engine_recommendations: list) -> list:
    breakdown = audit_data.get("breakdown", {}) or {}
    merged = {}

    for rec in engine_recommendations:
        action = (rec.get("action") or "").strip()
        if not action:
            continue
        key = action.lower()
        entry = merged.get(
            key,
            {
                "action": action,
                "reason": rec.get("reason") or "This issue is reducing AI citation eligibility.",
                "engines_impacted": set(),
                "category": rec.get("category") or "technical",
                "severity": rec.get("severity", "medium"),
            },
        )

        engine = rec.get("engine") or "all"
        if engine == "all":
            entry["engines_impacted"].update(DEFAULT_ENGINES)
        else:
            entry["engines_impacted"].add(engine)

        if _rank_recommendation_severity(rec.get("severity")) < _rank_recommendation_severity(entry.get("severity")):
            entry["severity"] = rec.get("severity", "medium")
        merged[key] = entry

    ranked = []
    for item in merged.values():
        low, high = _gain_range_for_fix(item["category"], item["severity"], breakdown)
        ranked.append(
            {
                "action": item["action"],
                "reason": item["reason"],
                "engines_impacted": sorted(item["engines_impacted"])[:4] or DEFAULT_ENGINES,
                "estimated_gain": f"+{low}-{high} citation probability points",
                "difficulty": _difficulty_from_category(item["category"], item["action"]),
                "category": item["category"],
                "_gain_mid": (low + high) / 2,
            }
        )

    ranked.sort(key=lambda x: x["_gain_mid"], reverse=True)
    final = ranked[:6]
    for idx, item in enumerate(final, start=1):
        item["rank"] = idx
        item.pop("_gain_mid", None)
    return final


def _parse_priority_fixes_json(raw_text: str) -> list:
    text = (raw_text or "").strip()
    if not text:
        return []

    try:
        data = json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return []
        try:
            data = json.loads(match.group(0))
        except Exception:
            return []

    fixes = data.get("priority_fixes", []) if isinstance(data, dict) else []
    if not isinstance(fixes, list):
        return []

    cleaned = []
    for idx, fix in enumerate(fixes[:6], start=1):
        if not isinstance(fix, dict):
            continue
        engines = fix.get("engines_impacted") or DEFAULT_ENGINES
        if not isinstance(engines, list):
            engines = DEFAULT_ENGINES
        difficulty = str(fix.get("difficulty", "medium")).lower()
        if difficulty not in {"easy", "medium", "hard"}:
            difficulty = "medium"

        cleaned.append(
            {
                "rank": idx,
                "action": str(fix.get("action") or "Improve a high-impact AI visibility signal"),
                "reason": str(fix.get("reason") or "This fix addresses a major citation bottleneck."),
                "engines_impacted": [str(e) for e in engines][:4] or DEFAULT_ENGINES,
                "estimated_gain": str(fix.get("estimated_gain") or "+5-8 citation probability points"),
                "difficulty": difficulty,
                "category": str(fix.get("category") or "technical").lower(),
            }
        )

    return cleaned


def _build_priority_fixes_prompt(audit_data: dict, engine_recommendations: list) -> str:
    lines = [
        "You are an expert AEO/GEO optimization consultant.",
        "Create one unified ranked action list called priority_fixes.",
        "Deduplicate overlapping recommendations across engines and signals.",
        "Rank by maximum expected citation probability lift.",
        "Return strict JSON only.",
        "",
        "JSON schema:",
        "{\"priority_fixes\": [{\"rank\": 1, \"action\": \"...\", \"reason\": \"...\", \"engines_impacted\": [\"ChatGPT\"], \"estimated_gain\": \"+8-10 citation probability points\", \"difficulty\": \"easy|medium|hard\", \"category\": \"structure|trust|media|schema|technical\"}]}",
        "",
        "Rules:",
        "- max 6 items",
        "- no duplicate actions",
        "- estimated_gain must reflect scoring weights and current score weaknesses",
        "- reason must be concise and specific",
        "",
        "Scoring weights:",
        json.dumps(SCORING_WEIGHTS),
        "",
        "Audit data:",
        json.dumps(audit_data),
        "",
        "Engine recommendations:",
        json.dumps(engine_recommendations),
    ]
    return "\n".join(lines)


def _fallback_skip_reason(audit_data: dict) -> str:
    url = audit_data.get("url", "This page")
    overall = int(audit_data.get("overall_score", 0) or 0)
    breakdown = audit_data.get("breakdown", {}) or {}
    issues = audit_data.get("key_issues", []) or []

    weakest = sorted(
        [
            ("structure", breakdown.get("structure", 0)),
            ("trust", breakdown.get("trust", 0)),
            ("media", breakdown.get("media", 0)),
            ("schema", breakdown.get("schema", 0)),
            ("technical", breakdown.get("technical", 0)),
        ],
        key=lambda x: x[1],
    )[:2]
    weak_labels = " and ".join([w[0] for w in weakest])
    issue_text = ", ".join(issues[:2]) if issues else "missing machine-readable trust and structure signals"

    return (
        f"{url} is being skipped by AI engines mainly because its weakest areas are {weak_labels}. "
        f"The audit points to {issue_text} as the core blockers, which makes the page harder for AI systems to parse and trust for generated answers. "
        f"Even if some parts of the page perform well, an overall AEO score of {overall}/100 keeps citation confidence below competitive pages. "
        "Until these high-impact gaps are fixed, this URL is likely to stay underrepresented in AI-driven results."
    )


def _build_skip_reason_prompt(audit_data: dict) -> str:
    breakdown = audit_data.get("breakdown", {}) or {}
    lines = [
        "You are a senior AI visibility consultant writing for a non-technical business user.",
        "Write exactly one paragraph, 3-4 sentences, plain English, no bullets, no jargon.",
        "The paragraph must explain why AI engines are skipping or underranking the page.",
        "Be direct, confident, and specific about likely causes and impact.",
        "",
        f"URL: {audit_data.get('url', '')}",
        f"Search query: {audit_data.get('query') or 'Not provided'}",
        f"Overall AEO score: {audit_data.get('overall_score', 0)}",
        f"Structure score: {breakdown.get('structure', 0)}",
        f"Trust score: {breakdown.get('trust', 0)}",
        f"Media score: {breakdown.get('media', 0)}",
        f"Schema score: {breakdown.get('schema', 0)}",
        f"Technical score: {breakdown.get('technical', 0)}",
        f"Citation Probability %: {audit_data.get('citation_probability', 0)}",
        f"GEO Score: {audit_data.get('geo_score', 0)}",
        f"Key penalties/issues: {', '.join(audit_data.get('key_issues', [])) or 'None provided'}",
        "",
        "Output constraints:",
        "- Only the paragraph text, no heading",
        "- 3-4 sentences max",
        "- No markdown",
    ]
    return "\n".join(lines)


async def generate_ai_skip_reason(audit_data: dict) -> str:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return _fallback_skip_reason(audit_data)

    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip() or "gpt-4.1-mini"
    client = AsyncOpenAI(api_key=api_key)
    prompt = _build_skip_reason_prompt(audit_data)

    try:
        completion = await client.chat.completions.create(
            model=model,
            temperature=0.4,
            max_tokens=220,
            messages=[
                {
                    "role": "system",
                    "content": "You produce concise executive-quality analysis paragraphs.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
        text = (completion.choices[0].message.content or "").strip()
        if not text:
            return _fallback_skip_reason(audit_data)

        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
        if len(sentences) > 4:
            text = ". ".join(sentences[:4]).strip() + "."
        return text
    except Exception as exc:
        logger.warning("AI skip reason generation failed, using fallback: %s", exc)
        return _fallback_skip_reason(audit_data)


async def generate_priority_fixes(audit_data: dict, engine_recommendations: list) -> list:
    normalized_engine_recs = _normalize_engine_recommendations(
        engine_recommendations,
        audit_data.get("recommendations", []),
    )
    fallback = _merge_fixes_fallback(audit_data, normalized_engine_recs)

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return fallback

    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip() or "gpt-4.1-mini"
    client = AsyncOpenAI(api_key=api_key)
    prompt = _build_priority_fixes_prompt(audit_data, normalized_engine_recs)

    try:
        completion = await client.chat.completions.create(
            model=model,
            temperature=0.2,
            max_tokens=900,
            messages=[
                {
                    "role": "system",
                    "content": "You are precise and output valid JSON only.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
        raw = completion.choices[0].message.content or ""
        parsed = _parse_priority_fixes_json(raw)
        return parsed or fallback
    except Exception as exc:
        logger.warning("Priority fixes generation failed, using fallback: %s", exc)
        return fallback


def _compute_citation_probability(parsed: dict, query: str | None) -> int:
    query_text = (query or parsed.get("title") or "page content analysis").strip()
    tokens = tokenize_query(query_text)
    intent = detect_intent(query_text)
    content_match = calculate_content_match(parsed, tokens, intent)
    extractability = calculate_extractability(parsed, content_match)
    authority = calculate_authority(parsed, {})
    intent_match = calculate_intent_match(content_match, intent)
    schema_support = calculate_schema_support(parsed, intent)
    content_depth = calculate_content_depth(parsed)
    return calculate_citation_probability(
        intent_match,
        extractability,
        authority,
        schema_support,
        content_depth,
    )


async def run_advanced_audit(url: str, user_id: str, query: str | None = None) -> dict:
    fetch_result = await fetch_page_content(url, requester_id=user_id)
    if not fetch_result.get("success"):
        raise ValueError(fetch_result.get("error") or "Unable to fetch content")
    html = fetch_result["html"]
    parsed = parse_html(html, url)
    page_type = classify_page(parsed)
    signals = build_signals(parsed, page_type)
    scores = calculate_all_scores(signals)
    recommendations = generate_recommendations(signals, scores)
    citation_probability = _compute_citation_probability(parsed, query)
    geo_result = run_geo_analysis(parsed)
    geo_score = geo_result.get("geo_score", 0)

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
        "query": query,
        "overall_score": scores["overall_score"],
        "breakdown_json": scores["breakdown"],
        "signals_json": signals,
        "citation_probability": citation_probability,
        "geo_score": geo_score,
        "recommendations": recommendations,
        "page_type": page_type,
        "advanced": True,
        "created_at": now,
    }
    result = await audits_collection.insert_one(audit_doc)

    return {
        "id": str(result.inserted_id),
        "url": url,
        "query": query,
        "page_type": page_type,
        "overall_score": scores["overall_score"],
        "breakdown": scores["breakdown"],
        "citation_probability": citation_probability,
        "geo_score": geo_score,
        "ai_skip_reason": None,
        "priority_fixes": [],
        "explainability": explainability,
        "signals": signals,
        "recommendations": recommendations,
        "historical_intelligence": historical,
        "audit_integrity": audit_integrity,
        "created_at": now,
    }


async def get_ai_skip_reason_for_audit(audit_id: str, user_id: str, query: str | None = None) -> str:
    try:
        object_id = ObjectId(audit_id)
    except InvalidId:
        raise ValueError("Advanced audit not found")

    doc = await audits_collection.find_one({"_id": object_id, "user_id": user_id, "advanced": True})
    if not doc:
        raise ValueError("Advanced audit not found")

    key_issues = _extract_key_issues(doc.get("recommendations", []))
    audit_data = {
        "url": doc.get("url", ""),
        "query": query or doc.get("query"),
        "overall_score": doc.get("overall_score", 0),
        "breakdown": doc.get("breakdown_json", {}),
        "citation_probability": doc.get("citation_probability", 0),
        "geo_score": doc.get("geo_score", 0),
        "key_issues": key_issues,
    }

    return await generate_ai_skip_reason(audit_data)


async def get_priority_fixes_for_audit(audit_id: str, user_id: str, engine_recommendations: list | None = None) -> list:
    try:
        object_id = ObjectId(audit_id)
    except InvalidId:
        raise ValueError("Advanced audit not found")

    doc = await audits_collection.find_one({"_id": object_id, "user_id": user_id, "advanced": True})
    if not doc:
        raise ValueError("Advanced audit not found")

    audit_data = {
        "url": doc.get("url", ""),
        "query": doc.get("query"),
        "overall_score": doc.get("overall_score", 0),
        "breakdown": doc.get("breakdown_json", {}),
        "citation_probability": doc.get("citation_probability", 0),
        "geo_score": doc.get("geo_score", 0),
        "key_issues": _extract_key_issues(doc.get("recommendations", [])),
        "recommendations": doc.get("recommendations", []),
    }

    return await generate_priority_fixes(audit_data, engine_recommendations or [])


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
