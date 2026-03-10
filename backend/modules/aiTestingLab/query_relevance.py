"""Query relevance evaluator for AI Testing Lab."""


def evaluate_query_match(query: str, parsed_page: dict) -> dict:
    tokens = [
        t.lower().strip(".,?!;:'\"()")
        for t in query.split()
        if len(t) > 2
    ]

    title = parsed_page.get("title", "").lower()
    headings_text = " ".join(
        " ".join(parsed_page.get("headings", {}).get(f"h{i}", []))
        for i in range(1, 4)
    ).lower()
    body = parsed_page.get("body_text", "").lower()

    total = len(tokens) or 1
    title_hits   = sum(1 for t in tokens if t in title)
    heading_hits = sum(1 for t in tokens if t in headings_text)
    body_hits    = sum(1 for t in tokens if t in body)

    title_match   = int((title_hits / total) * 100)
    heading_match = int((heading_hits / total) * 100)
    content_match = int((body_hits / total) * 100)

    relevance_score = int(round(
        title_match * 0.40 + heading_match * 0.35 + content_match * 0.25
    ))

    return {
        "relevance_score": max(0, min(100, relevance_score)),
        "title_match":   title_match,
        "heading_match": heading_match,
        "content_match": content_match,
    }


def get_relevance_feedback(score: int, title_match: int) -> str:
    if score >= 80:
        return "Excellent query relevance — content is highly aligned with the search query."
    if score >= 60:
        return "Good query relevance — most query terms appear in key positions."
    if score >= 40:
        return "Moderate relevance — consider including query terms in the title and headings."
    if title_match < 30:
        return "Low relevance — the page title doesn't reflect the query. Update title and H1."
    return "Low relevance — this page may not be a strong match for the target query."
