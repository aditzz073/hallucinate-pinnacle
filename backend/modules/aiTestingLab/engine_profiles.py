"""Engine profiles for AI Testing Lab — defines per-engine weights and characteristics."""

ENGINE_PROFILES = {
    "chatgpt": {
        "name": "ChatGPT",
        "weights": {
            "structure": 0.25,
            "trust": 0.20,
            "content": 0.20,
            "schema": 0.15,
            "citations": 0.10,
            "freshness": 0.05,
            "media": 0.03,
            "technical": 0.02,
        },
        "priority_signals": [
            "Clear content structure",
            "Authoritative sources",
            "Comprehensive coverage",
            "Logical information hierarchy",
        ],
        "description": "Prioritizes well-structured, comprehensive content from authoritative sources",
    },
    "perplexity": {
        "name": "Perplexity",
        "weights": {
            "schema": 0.25,
            "content": 0.20,
            "structure": 0.15,
            "trust": 0.15,
            "citations": 0.10,
            "freshness": 0.10,
            "media": 0.03,
            "technical": 0.02,
        },
        "priority_signals": [
            "Rich structured data",
            "Clear citations and sources",
            "Content depth",
            "Up-to-date information",
        ],
        "description": "Craves structured data with strong citations and detailed sources",
    },
    "google_sge": {
        "name": "Google SGE",
        "weights": {
            "schema": 0.30,
            "trust": 0.20,
            "freshness": 0.15,
            "structure": 0.15,
            "content": 0.10,
            "citations": 0.05,
            "media": 0.03,
            "technical": 0.02,
        },
        "priority_signals": [
            "Comprehensive schema markup",
            "Strong E-E-A-T signals",
            "Fresh updated content",
            "Canonical URLs",
        ],
        "description": "Demands schema markup, E-E-A-T signals, and fresh content",
    },
    "copilot": {
        "name": "Microsoft Copilot",
        "weights": {
            "schema": 0.25,
            "structure": 0.20,
            "content": 0.15,
            "trust": 0.15,
            "freshness": 0.10,
            "media": 0.08,
            "citations": 0.05,
            "technical": 0.02,
        },
        "priority_signals": [
            "Clear product/service info",
            "Well-implemented schema",
            "Visual content",
            "Straightforward navigation",
        ],
        "description": "Prefers clear product/service data with schema and visual content",
    },
}
# Each engine's weights sum to 1.0
