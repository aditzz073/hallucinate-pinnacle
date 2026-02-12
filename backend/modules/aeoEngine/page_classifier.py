"""Page Type Classifier - Phase 1 Step 3"""


def classify_page(parsed: dict) -> str:
    schema_types = [t.lower() for t in parsed.get("schema_types", [])]
    title = parsed.get("title", "").lower()
    h1_list = parsed.get("headings", {}).get("h1", [])
    h1_text = " ".join(h1_list).lower()
    body_lower = parsed.get("body_text", "").lower()[:2000]
    word_count = parsed.get("word_count", 0)

    # Schema-based classification (highest confidence)
    schema_map = {
        "product": "product",
        "offer": "product",
        "article": "article",
        "newsarticle": "article",
        "blogposting": "blog",
        "technicalarticle": "article",
        "service": "service",
        "professionalservice": "service",
        "website": "homepage",
    }
    for st in schema_types:
        if st in schema_map:
            return schema_map[st]

    # Heading + keyword patterns
    blog_signals = ["blog", "post", "published", "written by", "reading time"]
    article_signals = ["guide", "how to", "tutorial", "explained", "what is", "why"]
    product_signals = ["price", "buy", "add to cart", "order", "shop", "$", "discount"]
    service_signals = ["our services", "we offer", "solutions", "consulting", "hire"]
    homepage_signals = ["welcome", "home", "about us", "our mission"]

    combined = f"{title} {h1_text} {body_lower}"

    scores = {
        "blog": sum(1 for s in blog_signals if s in combined),
        "article": sum(1 for s in article_signals if s in combined),
        "product": sum(1 for s in product_signals if s in combined),
        "service": sum(1 for s in service_signals if s in combined),
        "homepage": sum(1 for s in homepage_signals if s in combined),
    }

    # Boost article/blog for long content
    if word_count > 800:
        scores["article"] += 1
        scores["blog"] += 1

    best = max(scores, key=scores.get)
    if scores[best] >= 2:
        return best

    # Fallback heuristics
    if word_count > 1500:
        return "article"
    if parsed.get("internal_links", 0) > 20:
        return "homepage"

    return "generic"
