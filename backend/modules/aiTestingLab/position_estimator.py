"""Position estimator for AI Testing Lab."""


def estimate_position(score: int) -> dict:
    if score >= 85:
        return {
            "bucket": "Top 3",
            "confidence": "High",
            "description": "Very likely to appear in AI answers",
            "color": "green",
        }
    if score >= 70:
        return {
            "bucket": "Top 5",
            "confidence": "High",
            "description": "Likely to appear in AI answers",
            "color": "lime",
        }
    if score >= 55:
        return {
            "bucket": "May Appear",
            "confidence": "Medium",
            "description": "Could appear in AI answers",
            "color": "yellow",
        }
    if score >= 40:
        return {
            "bucket": "Low",
            "confidence": "Low",
            "description": "Unlikely to appear in AI answers",
            "color": "orange",
        }
    return {
        "bucket": "Very Low",
        "confidence": "Low",
        "description": "Rarely cited by AI engines",
        "color": "red",
    }
