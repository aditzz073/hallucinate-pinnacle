"""Hybrid HTML Fetcher - Raw fetch with intelligent headless fallback"""
import logging
from typing import Dict
from modules.aeoEngine.html_fetcher import fetch_html as fetch_raw_html
from modules.aeoEngine.content_detector import is_content_insufficient, get_content_stats
from modules.aeoEngine.headless_renderer import render_with_timeout

logger = logging.getLogger(__name__)


async def fetch_html_hybrid(url: str) -> Dict:
    """
    Hybrid content extraction with automatic headless fallback.
    
    Flow:
    1. Fetch raw HTML (fast, lightweight)
    2. Check if content is sufficient
    3. If insufficient, render with headless browser
    4. Return final HTML + metadata
    
    Returns:
        {
            "html": str,
            "used_headless": bool,
            "fallback_used": bool,
            "render_time_ms": int,
            "content_stats": dict,
            "method": str  # "raw", "headless", or "fallback"
        }
    """
    result = {
        "html": "",
        "used_headless": False,
        "fallback_used": False,
        "render_time_ms": 0,
        "content_stats": {},
        "method": "raw",
    }
    
    # Step 1: Fetch raw HTML (default path)
    try:
        logger.info(f"Fetching raw HTML for: {url}")
        raw_html = await fetch_raw_html(url)
        
        # Step 2: Analyze content sufficiency
        stats = get_content_stats(raw_html)
        result["content_stats"] = stats
        
        logger.info(f"Content stats for {url}: {stats}")
        
        # Step 3: Decide if headless rendering is needed
        needs_rendering = is_content_insufficient(raw_html)
        
        if needs_rendering:
            logger.info(f"Content insufficient for {url}, triggering headless rendering")
            logger.info(f"Reason: text_length={stats['text_length']}, word_count={stats['word_count']}, "
                       f"h1_count={stats['h1_count']}, paragraph_count={stats['paragraph_count']}")
            
            # Step 4: Attempt headless rendering
            render_result = await render_with_timeout(url)
            
            if render_result.get("html") and not render_result.get("fallback_used"):
                # Headless rendering succeeded
                result["html"] = render_result["html"]
                result["used_headless"] = True
                result["render_time_ms"] = render_result["render_time_ms"]
                result["method"] = "headless"
                
                # Update stats with rendered content
                result["content_stats"] = get_content_stats(render_result["html"])
                logger.info(f"Headless rendering successful for {url} in {render_result['render_time_ms']}ms")
            else:
                # Headless rendering failed, fallback to raw HTML
                logger.warning(f"Headless rendering failed for {url}: {render_result.get('error')}")
                result["html"] = raw_html
                result["fallback_used"] = True
                result["method"] = "fallback"
                logger.info(f"Falling back to raw HTML for {url}")
        else:
            # Raw HTML is sufficient
            result["html"] = raw_html
            result["method"] = "raw"
            logger.info(f"Raw HTML sufficient for {url}")
    
    except Exception as e:
        # Raw fetch failed completely
        logger.error(f"Raw HTML fetch failed for {url}: {str(e)}")
        
        # Last resort: try headless rendering
        logger.info(f"Attempting headless rendering as last resort for {url}")
        try:
            render_result = await render_with_timeout(url)
            
            if render_result.get("html") and not render_result.get("fallback_used"):
                result["html"] = render_result["html"]
                result["used_headless"] = True
                result["render_time_ms"] = render_result["render_time_ms"]
                result["method"] = "headless"
                result["content_stats"] = get_content_stats(render_result["html"])
                logger.info(f"Last resort headless rendering successful for {url}")
            else:
                # Complete failure
                logger.error(f"Complete fetch failure for {url}")
                raise Exception(f"Failed to fetch content: {str(e)}")
        except Exception as headless_error:
            logger.error(f"Last resort headless rendering also failed for {url}: {str(headless_error)}")
            raise Exception(f"All fetch methods failed: Raw error: {str(e)}, Headless error: {str(headless_error)}")
    
    return result
