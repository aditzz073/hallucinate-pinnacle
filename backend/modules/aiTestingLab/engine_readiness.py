"""Engine readiness calculator for AI Testing Lab."""
from modules.aiTestingLab.engine_profiles import ENGINE_PROFILES


def calculate_ai_readiness(engine: str, signals: dict, relevance_score: int) -> dict:
    """
    Readiness = (Weighted Signals × 0.50) + (Query Relevance × 0.50)
    """
    profile = ENGINE_PROFILES[engine]
    weights = profile["weights"]

    weighted_signals = sum(signals.get(k, 0) * w for k, w in weights.items())
    readiness_score = max(0, min(100, int(round(weighted_signals * 0.50 + relevance_score * 0.50))))

    strengths = [
        f"Strong {k} ({v}/100)"
        for k, v in signals.items()
        if v >= 70
    ]
    weaknesses = [
        f"Weak {k} ({v}/100) — {profile['name']} weights this at {int(weights.get(k, 0) * 100)}%"
        for k, v in signals.items()
        if v < 50 and weights.get(k, 0) >= 0.15
    ]

    return {
        "readiness_score": readiness_score,
        "strengths": strengths[:3],
        "weaknesses": weaknesses[:3],
    }


def generate_improvements(engine: str, signals: dict, relevance_score: int) -> list:
    profile = ENGINE_PROFILES[engine]
    weights = profile["weights"]

    weak_signals = [
        (k, signals.get(k, 0), weights.get(k, 0))
        for k in weights
        if signals.get(k, 0) < 60
    ]
    weak_signals.sort(key=lambda x: x[2], reverse=True)

    improvement_map = {
        "schema":    "Add JSON-LD structured data (Article, FAQ, or HowTo schema)",
        "trust":     "Add author biography, organization schema, and external citations",
        "structure": "Improve heading hierarchy (H1→H2→H3) and add structured lists",
        "content":   "Expand content depth — target 1500+ words with varied headings",
        "freshness": "Add publish/modified date in both HTML meta and JSON-LD schema",
        "media":     "Add descriptive images with alt text and/or video content",
        "citations": "Increase external links to credible sources (aim for 5+)",
        "technical": "Add canonical URL, meta description, and viewport meta tag",
    }

    improvements = []
    for signal_name, _score, weight in weak_signals[:3]:
        if signal_name in improvement_map:
            improvements.append(
                f"{improvement_map[signal_name]} — {profile['name']} gives this {int(weight * 100)}% weight"
            )

    if relevance_score < 50:
        improvements.append("Align page title and headings more closely with the target query")

    return improvements[:3]


def get_score_grade(score: int) -> str:
    if score >= 90:
        return "A+"
    if score >= 80:
        return "A"
    if score >= 70:
        return "B+"
    if score >= 60:
        return "B"
    if score >= 50:
        return "C"
    if score >= 40:
        return "D"
    return "F"
