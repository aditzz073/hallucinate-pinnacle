import logging
import traceback
from datetime import datetime, timezone
import gc

from modules.aeoEngine.html_parser import parse_html
from modules.aeoEngine.page_classifier import classify_page
from modules.aeoEngine.signal_builder import build_signals
from modules.aeoEngine.scorer import calculate_all_scores
from modules.aeoEngine.recommender import generate_recommendations

from modules.aiTestingEngine.query_processor import tokenize_query, detect_intent
from modules.aiTestingEngine.content_matcher import calculate_content_match
from modules.aiTestingEngine.extractability import calculate_extractability
from modules.aiTestingEngine.authority import calculate_authority
from modules.aiTestingEngine.citation_calculator import calculate_intent_match, calculate_schema_support, calculate_content_depth, calculate_citation_probability
from modules.aiTestingEngine.geo_service import run_geo_analysis

from modules.aiTestingLab.aeo_analyzer import run_aeo_analysis as run_lab_aeo_analysis
from modules.aiTestingLab.engine_readiness import calculate_ai_readiness
from modules.aiTestingLab.query_relevance import evaluate_query_match
from modules.aiTestingLab.engine_profiles import ENGINE_PROFILES

logger = logging.getLogger(__name__)

async def run_cli_analysis(url: str, html: str, query: str = None) -> dict:
    """Run analysis using provided HTML directly from the CLI, synced with web logic."""
    try:
        parsed = parse_html(html, url)
        
        # 1. AEO Audit (Main Visibility Score)
        page_type = classify_page(parsed)
        signals = build_signals(parsed, page_type)
        scores = calculate_all_scores(signals)
        recommendations = generate_recommendations(signals, scores)

        # 2. AI Testing Lab (Engine Readiness Parity)
        # Get signals in the format expected by the Lab readiness calculator
        lab_aeo = run_lab_aeo_analysis(parsed)
        lab_signals = lab_aeo["signals"]
        
        # If no query provided, use a default "neutral" relevance of 50
        relevance_score = 50
        if query:
            rel_eval = evaluate_query_match(query, parsed)
            relevance_score = rel_eval["relevance_score"]
        
        engine_readiness = {}
        target_engines = ["ChatGPT", "Perplexity", "Gemini", "Copilot"] # Standard set
        
        # Map internal engine IDs to those found in ENGINE_PROFILES
        engine_map = {
            "ChatGPT": "chatgpt",
            "Perplexity": "perplexity",
            "Gemini": "google_sge",
            "Copilot": "copilot"
        }

        for display_name in target_engines:
            engine_id = engine_map.get(display_name)
            if engine_id in ENGINE_PROFILES:
                readiness = calculate_ai_readiness(engine_id, lab_signals, relevance_score)
                engine_readiness[display_name] = readiness["readiness_score"]
            else:
                # Fallback to realistic variance if profile not found (unlikely)
                engine_readiness[display_name] = max(0, min(100, scores["overall_score"] - 5))

        top_engine = max(engine_readiness, key=engine_readiness.get) if engine_readiness else "Unknown"

        # 3. Citation Probability (AI Testing Engine parity)
        if query:
            tokens = tokenize_query(query)
            intent = detect_intent(query)
            content_match = calculate_content_match(parsed, tokens, intent)
            extract = calculate_extractability(parsed, content_match)
            auth = calculate_authority(parsed, {})
            i_match = calculate_intent_match(content_match, intent)
            schema = calculate_schema_support(parsed, intent)
            depth = calculate_content_depth(parsed)
            
            prob = calculate_citation_probability(i_match, extract, auth, schema, depth)
            citation_prob = f"{int(prob * 100)}%"
        else:
            # If no query, base it on GEO score as a "generative readiness" proxy
            geo = run_geo_analysis(parsed)
            citation_prob = f"{geo['geo_score'] - 5}%"

        # Format recommendations
        simple_recs = [rec["issue"] for rec in recommendations[:3]]
        
        return {
            "visibility_score": scores["overall_score"],
            "citation_probability": citation_prob,
            "top_engine": top_engine,
            "engine_readiness": engine_readiness,
            "recommendations": simple_recs
        }

    finally:
        if 'html' in locals(): del html
        if 'parsed' in locals(): del parsed
        gc.collect()
