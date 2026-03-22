"""AI Content Compiler Service - Phase 6"""
from modules.aeoEngine.page_fetch_service import fetch_page_content
from modules.aeoEngine.html_parser import parse_html
from modules.aiContentCompiler.compiler import compile_semantic_blocks


async def compile_content(url: str) -> dict:
    fetch_result = await fetch_page_content(url)
    if not fetch_result.get("success"):
        raise ValueError(fetch_result.get("error") or "Unable to fetch content")
    html = fetch_result["html"]
    parsed = parse_html(html, url)
    return compile_semantic_blocks(parsed)
