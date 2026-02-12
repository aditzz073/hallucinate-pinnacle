"""AI Content Compiler Service - Phase 6"""
from modules.aeoEngine.html_fetcher import fetch_html
from modules.aeoEngine.html_parser import parse_html
from modules.aiContentCompiler.compiler import compile_semantic_blocks


async def compile_content(url: str) -> dict:
    html = await fetch_html(url)
    parsed = parse_html(html, url)
    return compile_semantic_blocks(parsed)
