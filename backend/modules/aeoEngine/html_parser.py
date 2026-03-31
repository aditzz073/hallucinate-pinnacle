"""HTML Parser - Phase 1 Step 2"""
import json
import re
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup


def parse_html(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    parsed_url = urlparse(url)
    base_domain = parsed_url.netloc

    # Title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # Meta description
    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc_tag.get("content", "") if meta_desc_tag else ""

    # Canonical
    canonical_tag = soup.find("link", attrs={"rel": "canonical"})
    canonical = canonical_tag.get("href", "") if canonical_tag else ""

    # Robots meta
    robots_tag = soup.find("meta", attrs={"name": "robots"})
    robots = robots_tag.get("content", "") if robots_tag else ""

    # Heading structure
    headings = {}
    for level in range(1, 7):
        tag_name = f"h{level}"
        found = soup.find_all(tag_name)
        headings[tag_name] = [h.get_text(strip=True) for h in found]

    # Word count (body text)
    body = soup.find("body")
    body_text = body.get_text(separator=" ", strip=True) if body else ""
    words = re.findall(r"\b\w+\b", body_text)
    word_count = len(words)

    # Links
    all_links = soup.find_all("a", href=True)
    internal_links = []
    external_links = []
    for link in all_links:
        href = link.get("href", "")
        abs_url = urljoin(url, href)
        link_domain = urlparse(abs_url).netloc
        if link_domain == base_domain:
            internal_links.append(abs_url)
        elif href.startswith(("http://", "https://")):
            external_links.append(abs_url)

    # Images
    images = soup.find_all("img")
    images_data = []
    for img in images:
        images_data.append({
            "src": img.get("src", ""),
            "alt": img.get("alt", ""),
            "has_alt": bool(img.get("alt", "").strip()),
        })

    # JSON-LD schema blocks
    schema_blocks = []
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(script.string or "{}")
            schema_blocks.append(data)
        except (json.JSONDecodeError, TypeError):
            pass

    # Author presence
    author = ""
    author_meta = soup.find("meta", attrs={"name": "author"})
    if author_meta:
        author = author_meta.get("content", "")
    if not author:
        for schema in schema_blocks:
            if isinstance(schema, dict):
                a = schema.get("author")
                if isinstance(a, dict):
                    author = a.get("name", "")
                elif isinstance(a, str):
                    author = a
                if author:
                    break

    # Organization / contact signals
    has_organization_schema = False
    has_contact_info = False
    for schema in schema_blocks:
        if isinstance(schema, dict):
            st = schema.get("@type", "")
            if isinstance(st, list):
                types = st
            else:
                types = [st]
            for t in types:
                if t.lower() in ("organization", "localbusiness", "corporation"):
                    has_organization_schema = True
                if t.lower() in ("contactpoint",):
                    has_contact_info = True
            if schema.get("contactPoint"):
                has_contact_info = True

    # Contact signals from HTML
    body_lower = body_text.lower() if body_text else ""
    if not has_contact_info:
        has_contact_info = any(
            kw in body_lower
            for kw in ["contact us", "email us", "phone:", "tel:", "support@"]
        )

    # Open Graph
    og_tags = {}
    for og in soup.find_all("meta", attrs={"property": re.compile(r"^og:")}):
        og_tags[og.get("property", "")] = og.get("content", "")

    # Twitter Cards
    twitter_tags = {}
    for tw in soup.find_all("meta", attrs={"name": re.compile(r"^twitter:")}):
        twitter_tags[tw.get("name", "")] = tw.get("content", "")

    # Language
    html_tag = soup.find("html")
    lang = html_tag.get("lang", "") if html_tag else ""

    # Viewport
    viewport_tag = soup.find("meta", attrs={"name": "viewport"})
    has_viewport = viewport_tag is not None

    # FAQ detection
    faq_items = []
    # Check JSON-LD FAQ
    for schema in schema_blocks:
        if isinstance(schema, dict) and schema.get("@type") == "FAQPage":
            main_entity = schema.get("mainEntity", [])
            if isinstance(main_entity, list):
                for item in main_entity:
                    if isinstance(item, dict):
                        q = item.get("name", "")
                        a_obj = item.get("acceptedAnswer", {})
                        a = a_obj.get("text", "") if isinstance(a_obj, dict) else ""
                        faq_items.append({"question": q, "answer": a})
    # Check HTML FAQ patterns
    if not faq_items:
        for details in soup.find_all("details"):
            summary = details.find("summary")
            if summary:
                q = summary.get_text(strip=True)
                a = details.get_text(strip=True).replace(q, "", 1).strip()
                faq_items.append({"question": q, "answer": a})

    # Freshness detection
    last_modified = ""
    # Check meta tags for article:modified_time
    mod_meta = soup.find("meta", attrs={"property": "article:modified_time"})
    if mod_meta:
        last_modified = mod_meta.get("content", "")
    # Check JSON-LD dateModified
    if not last_modified:
        pub_meta = soup.find("meta", attrs={"property": "article:published_time"})
        if pub_meta:
            last_modified = pub_meta.get("content", "")
    if not last_modified:
        for schema in schema_blocks:
            if isinstance(schema, dict):
                dm = schema.get("dateModified") or schema.get("datePublished", "")
                if dm:
                    last_modified = str(dm)
                    break

    # Conversational tone detection
    question_headings = 0
    for level in range(1, 4):
        for h_text in headings.get(f"h{level}", []):
            if h_text.strip().endswith("?") or h_text.lower().startswith(("how ", "what ", "why ", "when ", "where ", "who ", "can ", "do ", "does ", "is ", "are ")):
                question_headings += 1

    # Pronoun density (you/your)
    pronoun_count = 0
    if body_text:
        lower_body = body_text.lower()
        pronoun_count = lower_body.count(" you ") + lower_body.count(" your ") + lower_body.count(" you're ")

    conversational_score = min(100, question_headings * 15 + min(50, pronoun_count * 2))

    # Heading hierarchy depth
    h1_count = len(headings.get("h1", []))
    h2_count = len(headings.get("h2", []))
    h3_count = len(headings.get("h3", []))

    heading_depth = 0
    if h1_count >= 1:
        heading_depth += 1
    if h2_count >= 1:
        heading_depth += 1
    if h3_count >= 1:
        heading_depth += 1

    # Explicit schema type flags
    schema_types_lower = [t.lower() for t in _extract_schema_types(schema_blocks)]
    has_faq_schema = "faqpage" in schema_types_lower
    has_article_schema = any(t in schema_types_lower for t in ("article", "newsarticle", "blogposting", "technicalarticle"))
    has_product_schema = any(t in schema_types_lower for t in ("product", "offer"))
    has_breadcrumb_schema = "breadcrumblist" in schema_types_lower

    return {
        "title": title,
        "meta_description": meta_description,
        "canonical": canonical,
        "robots": robots,
        "headings": headings,
        "word_count": word_count,
        "body_text": body_text,
        "internal_links": len(internal_links),
        "external_links": len(external_links),
        "images": images_data,
        "images_total": len(images_data),
        "images_with_alt": sum(1 for i in images_data if i["has_alt"]),
        "schema_blocks": schema_blocks,
        "schema_types": _extract_schema_types(schema_blocks),
        "schema_present": len(schema_blocks) > 0,
        "has_faq_schema": has_faq_schema,
        "has_article_schema": has_article_schema,
        "has_product_schema": has_product_schema,
        "has_breadcrumb_schema": has_breadcrumb_schema,
        "author": author,
        "has_organization_schema": has_organization_schema,
        "has_contact_info": has_contact_info,
        "og_tags": og_tags,
        "twitter_tags": twitter_tags,
        "lang": lang,
        "has_viewport": has_viewport,
        "faq_items": faq_items,
        "url": url,
        "last_modified": last_modified,
        "conversational_score": conversational_score,
        "question_headings": question_headings,
        "heading_depth": heading_depth,
    }


def _extract_schema_types(schema_blocks: list) -> list:
    types = set()
    for schema in schema_blocks:
        if isinstance(schema, dict):
            st = schema.get("@type", "")
            if isinstance(st, list):
                types.update(st)
            elif st:
                types.add(st)
            # Check @graph
            graph = schema.get("@graph", [])
            if isinstance(graph, list):
                for item in graph:
                    if isinstance(item, dict):
                        gst = item.get("@type", "")
                        if isinstance(gst, list):
                            types.update(gst)
                        elif gst:
                            types.add(gst)
    return list(types)
