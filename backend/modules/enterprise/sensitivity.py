"""Behavior Sensitivity Engine - Phase 9
Adjustable scoring weights based on focus mode."""


MODES = {
    "default": {
        "label": "Balanced",
        "description": "Standard balanced scoring weights",
        "weights": {
            "intent_match": 0.25,
            "extractability": 0.25,
            "authority": 0.20,
            "schema_support": 0.15,
            "content_depth": 0.15,
        },
    },
    "authorityFocused": {
        "label": "Authority Focused",
        "description": "Emphasizes author trust, organization signals, and citations",
        "weights": {
            "intent_match": 0.15,
            "extractability": 0.15,
            "authority": 0.40,
            "schema_support": 0.15,
            "content_depth": 0.15,
        },
    },
    "structureFocused": {
        "label": "Structure Focused",
        "description": "Emphasizes content structure, schema markup, and extractability",
        "weights": {
            "intent_match": 0.15,
            "extractability": 0.30,
            "authority": 0.10,
            "schema_support": 0.30,
            "content_depth": 0.15,
        },
    },
    "conversationalFocused": {
        "label": "Conversational Focused",
        "description": "Emphasizes intent matching, FAQ content, and natural language alignment",
        "weights": {
            "intent_match": 0.35,
            "extractability": 0.30,
            "authority": 0.10,
            "schema_support": 0.10,
            "content_depth": 0.15,
        },
    },
}


def get_mode_weights(mode: str) -> dict:
    if mode not in MODES:
        raise ValueError(f"Unknown mode: {mode}. Options: {list(MODES.keys())}")
    return MODES[mode]


def calculate_with_mode(scores: dict, mode: str) -> dict:
    """Calculate citation probability with custom weights."""
    mode_config = get_mode_weights(mode)
    weights = mode_config["weights"]

    probability = (
        scores.get("intent_match", 0) * weights["intent_match"]
        + scores.get("extractability", 0) * weights["extractability"]
        + scores.get("authority", 0) * weights["authority"]
        + scores.get("schema_support", 0) * weights["schema_support"]
        + scores.get("content_depth", 0) * weights["content_depth"]
    )

    return {
        "citation_probability": max(0, min(100, int(round(probability)))),
        "mode": mode,
        "mode_label": mode_config["label"],
        "mode_description": mode_config["description"],
        "weights_used": weights,
    }
