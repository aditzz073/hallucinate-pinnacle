"""Change Detector - Phase 3"""


# Signal names to track and their impact classification
TRACKED_SIGNALS = {
    "has_title": {"category": "structure", "impact_map": {True: "positive", False: "negative"}},
    "h1_count": {"category": "structure", "impact_fn": "heading_count"},
    "has_meta_description": {"category": "structure", "impact_map": {True: "positive", False: "negative"}},
    "has_heading_hierarchy": {"category": "structure", "impact_map": {True: "positive", False: "negative"}},
    "word_count": {"category": "structure", "impact_fn": "word_count"},
    "has_author": {"category": "trust", "impact_map": {True: "positive", False: "negative"}},
    "has_organization_schema": {"category": "trust", "impact_map": {True: "positive", False: "negative"}},
    "has_contact_info": {"category": "trust", "impact_map": {True: "positive", False: "negative"}},
    "has_json_ld": {"category": "schema", "impact_map": {True: "positive", False: "negative"}},
    "has_faq_schema": {"category": "schema", "impact_map": {True: "positive", False: "negative"}},
    "has_article_schema": {"category": "schema", "impact_map": {True: "positive", False: "negative"}},
    "has_breadcrumb": {"category": "schema", "impact_map": {True: "positive", False: "negative"}},
    "schema_count": {"category": "schema", "impact_fn": "more_is_better"},
    "has_canonical": {"category": "technical", "impact_map": {True: "positive", False: "negative"}},
    "has_noindex": {"category": "technical", "impact_map": {True: "negative", False: "positive"}},
    "has_og_tags": {"category": "technical", "impact_map": {True: "positive", False: "negative"}},
    "has_viewport": {"category": "technical", "impact_map": {True: "positive", False: "negative"}},
    "has_lang": {"category": "technical", "impact_map": {True: "positive", False: "negative"}},
    "total_images": {"category": "media", "impact_fn": "more_is_better"},
    "images_with_alt": {"category": "media", "impact_fn": "more_is_better"},
    "alt_coverage": {"category": "media", "impact_fn": "more_is_better"},
}


def _get_signal_value(signals: dict, key: str):
    """Extract a signal value from nested signals dict."""
    for category in ["structure", "trust", "media", "schema", "technical"]:
        if category in signals and key in signals[category]:
            return signals[category][key]
    return None


def _classify_impact(key: str, old_val, new_val) -> str:
    """Deterministic impact classification."""
    config = TRACKED_SIGNALS.get(key, {})

    impact_map = config.get("impact_map")
    if impact_map:
        # Boolean signals
        if new_val in impact_map:
            return impact_map[new_val]
        return "neutral"

    impact_fn = config.get("impact_fn", "")

    if impact_fn == "word_count":
        if old_val and new_val:
            old_v = old_val if isinstance(old_val, (int, float)) else 0
            new_v = new_val if isinstance(new_val, (int, float)) else 0
            if old_v > 0 and new_v < old_v * 0.7:
                return "negative"  # >30% drop
            elif new_v > old_v * 1.2:
                return "positive"  # >20% increase
        return "neutral"

    if impact_fn == "heading_count":
        old_v = old_val if isinstance(old_val, (int, float)) else 0
        new_v = new_val if isinstance(new_val, (int, float)) else 0
        if new_v == 1 and old_v != 1:
            return "positive"
        elif old_v == 1 and new_v != 1:
            return "negative"
        return "neutral"

    if impact_fn == "more_is_better":
        old_v = old_val if isinstance(old_val, (int, float)) else 0
        new_v = new_val if isinstance(new_val, (int, float)) else 0
        if new_v > old_v:
            return "positive"
        elif new_v < old_v:
            return "negative"
        return "neutral"

    return "neutral"


def detect_changes(prev_signals: dict, curr_signals: dict) -> list:
    """Compare two signal snapshots and return change log entries."""
    changes = []

    for key in TRACKED_SIGNALS:
        old_val = _get_signal_value(prev_signals, key)
        new_val = _get_signal_value(curr_signals, key)

        if old_val is None and new_val is None:
            continue

        if old_val != new_val:
            impact = _classify_impact(key, old_val, new_val)
            changes.append({
                "signal_name": key,
                "previous_value": str(old_val) if old_val is not None else "none",
                "current_value": str(new_val) if new_val is not None else "none",
                "impact": impact,
            })

    return changes
