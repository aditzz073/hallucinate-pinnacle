"""Recommendation Generator - Phase 1 Step 6"""


def generate_recommendations(signals: dict, scores: dict) -> list:
    recs = []
    s = signals.get("structure", {})
    t = signals.get("trust", {})
    m = signals.get("media", {})
    sc = signals.get("schema", {})
    tech = signals.get("technical", {})

    # Structure recommendations
    if not s.get("has_title"):
        recs.append({
            "issue": "Missing page title",
            "severity": "high",
            "impact_explanation": "Page title is a primary signal for AI engines to understand page topic and relevance.",
            "how_to_fix": "Add a descriptive <title> tag between 30-60 characters that clearly describes the page content.",
        })
    elif s.get("title_length", 0) > 60:
        recs.append({
            "issue": "Title too long",
            "severity": "low",
            "impact_explanation": "Titles over 60 characters may be truncated in AI-generated citations.",
            "how_to_fix": "Shorten the title to 30-60 characters while keeping it descriptive.",
        })
    elif s.get("title_length", 0) < 30:
        recs.append({
            "issue": "Title too short",
            "severity": "medium",
            "impact_explanation": "Very short titles provide less context for AI engines to match queries.",
            "how_to_fix": "Expand the title to 30-60 characters with relevant keywords.",
        })

    if not s.get("has_meta_description"):
        recs.append({
            "issue": "Missing meta description",
            "severity": "high",
            "impact_explanation": "Meta descriptions provide summary context used by AI engines for citation extraction.",
            "how_to_fix": "Add a meta description of 120-160 characters summarizing the page content.",
        })

    if s.get("h1_count", 0) == 0:
        recs.append({
            "issue": "Missing H1 heading",
            "severity": "high",
            "impact_explanation": "H1 is the primary heading signal AI engines use to determine page topic.",
            "how_to_fix": "Add a single, descriptive H1 heading at the top of the content.",
        })
    elif s.get("h1_count", 0) > 1:
        recs.append({
            "issue": "Multiple H1 headings",
            "severity": "medium",
            "impact_explanation": "Multiple H1s can confuse AI engines about the primary topic.",
            "how_to_fix": "Use only one H1 tag. Convert others to H2 or H3.",
        })

    if not s.get("has_heading_hierarchy"):
        recs.append({
            "issue": "Weak heading hierarchy",
            "severity": "medium",
            "impact_explanation": "AI engines use heading structure to understand content organization and extract answers.",
            "how_to_fix": "Create a clear H1 > H2 > H3 hierarchy that logically organizes your content.",
        })

    wc = s.get("word_count", 0)
    if wc < 300:
        recs.append({
            "issue": "Thin content",
            "severity": "high",
            "impact_explanation": "Pages with less than 300 words rarely provide enough depth for AI citation.",
            "how_to_fix": "Expand content to at least 800+ words with comprehensive coverage of the topic.",
        })
    elif wc < 800:
        recs.append({
            "issue": "Content could be deeper",
            "severity": "medium",
            "impact_explanation": "Content under 800 words may lack the depth AI engines prefer for authoritative answers.",
            "how_to_fix": "Add more detail, examples, and explanations to reach 1000+ words.",
        })

    if s.get("internal_links", 0) == 0:
        recs.append({
            "issue": "No internal links",
            "severity": "medium",
            "impact_explanation": "Internal links help AI engines understand site structure and content relationships.",
            "how_to_fix": "Add 3-5 relevant internal links to related content on your site.",
        })

    # Trust recommendations
    if not t.get("has_author"):
        recs.append({
            "issue": "No author attribution",
            "severity": "high",
            "impact_explanation": "Author attribution is a strong trust signal. AI engines prioritize content with clear authorship.",
            "how_to_fix": "Add author name via meta tag, JSON-LD schema, or visible byline.",
        })

    if not t.get("has_organization_schema"):
        recs.append({
            "issue": "Missing Organization schema",
            "severity": "medium",
            "impact_explanation": "Organization schema helps AI engines verify publisher credibility.",
            "how_to_fix": "Add Organization JSON-LD schema with name, url, logo, and contact details.",
        })

    if not t.get("has_contact_info"):
        recs.append({
            "issue": "No contact information detected",
            "severity": "low",
            "impact_explanation": "Contact transparency signals trustworthiness to AI engines.",
            "how_to_fix": "Add a visible contact section or ContactPoint schema.",
        })

    # Media recommendations
    if m.get("total_images", 0) == 0:
        recs.append({
            "issue": "No images on page",
            "severity": "medium",
            "impact_explanation": "Pages with relevant images are more likely to be cited in multimodal AI answers.",
            "how_to_fix": "Add relevant images with descriptive alt text throughout the content.",
        })
    elif m.get("alt_coverage", 0) < 80:
        recs.append({
            "issue": "Images missing alt text",
            "severity": "medium",
            "impact_explanation": "Alt text helps AI engines understand image content and improves accessibility signals.",
            "how_to_fix": f"Add descriptive alt text to all images. Currently {m.get('alt_coverage', 0)}% have alt text.",
        })

    # Schema recommendations
    if not sc.get("has_json_ld"):
        recs.append({
            "issue": "No structured data (JSON-LD)",
            "severity": "high",
            "impact_explanation": "Structured data is one of the strongest signals for AI engine citation. Without it, your content is harder to parse.",
            "how_to_fix": "Add JSON-LD structured data relevant to your page type (Article, Product, FAQ, etc.).",
        })

    if not sc.get("has_faq_schema") and sc.get("faq_items_count", 0) == 0:
        recs.append({
            "issue": "No FAQ content or schema",
            "severity": "medium",
            "impact_explanation": "FAQ sections are highly extractable by AI engines for direct answers.",
            "how_to_fix": "Add an FAQ section with FAQPage schema markup for common questions about your topic.",
        })

    if not sc.get("has_breadcrumb"):
        recs.append({
            "issue": "Missing BreadcrumbList schema",
            "severity": "low",
            "impact_explanation": "Breadcrumb schema helps AI engines understand page position in site hierarchy.",
            "how_to_fix": "Add BreadcrumbList JSON-LD schema reflecting the page's navigation path.",
        })

    # Technical recommendations
    if not tech.get("has_canonical"):
        recs.append({
            "issue": "Missing canonical tag",
            "severity": "medium",
            "impact_explanation": "Without canonical, AI engines may index duplicate versions of your page.",
            "how_to_fix": "Add a <link rel='canonical'> tag pointing to the preferred URL.",
        })

    if tech.get("has_noindex"):
        recs.append({
            "issue": "Page has noindex directive",
            "severity": "high",
            "impact_explanation": "Noindex prevents search engines and AI crawlers from indexing this page.",
            "how_to_fix": "Remove 'noindex' from robots meta tag unless you intentionally want to block indexing.",
        })

    if not tech.get("has_og_tags"):
        recs.append({
            "issue": "Missing Open Graph tags",
            "severity": "low",
            "impact_explanation": "Open Graph metadata helps AI engines understand page content for social and citation contexts.",
            "how_to_fix": "Add og:title, og:description, og:image, and og:url meta tags.",
        })

    if not tech.get("has_lang"):
        recs.append({
            "issue": "Missing lang attribute",
            "severity": "low",
            "impact_explanation": "Language attribute helps AI engines serve content to the right audience.",
            "how_to_fix": "Add lang attribute to the <html> tag (e.g., lang='en').",
        })

    # Sort by severity
    severity_order = {"high": 0, "medium": 1, "low": 2}
    recs.sort(key=lambda r: severity_order.get(r["severity"], 3))

    return recs
