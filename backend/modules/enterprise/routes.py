"""Enterprise Routes - Phase 9"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from middlewares.auth_middleware import verify_token
from middlewares.feature_access import (
    enforce_feature_access,
    enforce_usage_limit,
    reset_monthly_usage_if_needed,
    ensure_usage_doc,
    increment_usage,
    UpgradeRequiredException,
    UsageLimitReachedException,
    NoActivePlanException,
    PLAN_LIMITS,
    _normalize_plan,
    get_user_access,
)

router = APIRouter(prefix="/enterprise", tags=["Enterprise"])


class CompareRequest(BaseModel):
    query: str
    primary_url: str
    competitor_urls: List[str]


class SensitivityTestRequest(BaseModel):
    url: str
    query: str
    mode: str  # "authorityFocused" | "structureFocused" | "conversationalFocused"


@router.post("/compare")
async def compare_competitors(req: CompareRequest, current_user: dict = Depends(verify_token)):
    from modules.enterprise.competitor import compare_competitors as _compare
    from database.connection import users_collection
    from bson import ObjectId

    if not req.competitor_urls:
        raise HTTPException(status_code=400, detail="At least one competitor URL required")

    user_id = current_user["user_id"]

    # 1. Ensure usage doc
    await ensure_usage_doc(user_id)

    # 2. Reset if new month
    user_doc = await reset_monthly_usage_if_needed(user_id)
    if user_doc is None:
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})

    # 3. Feature access (requires optimize+)
    await enforce_feature_access(current_user, "competitor_intel")

    # 4. Enforce per-query competitor URL limit based on plan
    user_access = await get_user_access(user_id)
    plan = user_access.get("plan", "free")
    competitor_limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"]).get("competitor_intel", 0)
    if competitor_limit == 999999:
        competitor_limit = 10  # safety cap
    if len(req.competitor_urls) > competitor_limit:
        raise HTTPException(
            status_code=400,
            detail=f"Your {plan.title()} plan allows up to {competitor_limit} competitor URLs per query."
        )

    # 5. Usage limit check
    await enforce_usage_limit(user_id, user_doc, "competitor_intel", "competitor_intel")

    try:
        result = await _compare(
            req.query.strip(), str(req.primary_url), [str(u) for u in req.competitor_urls]
        )

        # 6. Increment
        await increment_usage(user_id, "competitor_intel_used")

        return result
    except (UpgradeRequiredException, UsageLimitReachedException, NoActivePlanException):
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Comparison failed: {str(e)}")


@router.post("/sensitivity-test")
async def sensitivity_test(req: SensitivityTestRequest, current_user: dict = Depends(verify_token)):
    """Run AI test with custom sensitivity mode."""
    from modules.aeoEngine.page_fetch_service import fetch_page_content
    from modules.aeoEngine.html_parser import parse_html
    from modules.aiTestingEngine.query_processor import tokenize_query, detect_intent
    from modules.aiTestingEngine.content_matcher import calculate_content_match
    from modules.aiTestingEngine.extractability import calculate_extractability
    from modules.aiTestingEngine.authority import calculate_authority
    from modules.aiTestingEngine.citation_calculator import (
        calculate_intent_match, calculate_schema_support, calculate_content_depth,
        calculate_citation_probability, estimate_position,
    )
    from modules.enterprise.sensitivity import calculate_with_mode, MODES

    if req.mode not in MODES:
        raise HTTPException(status_code=400, detail=f"Unknown mode. Options: {list(MODES.keys())}")

    try:
        fetch_result = await fetch_page_content(str(req.url), requester_id=current_user.get("user_id"))
        if not fetch_result.get("success"):
            raise ValueError(fetch_result.get("error") or "Unable to fetch content")
        html = fetch_result["html"]
        parsed = parse_html(html, str(req.url))
        tokens = tokenize_query(req.query.strip())
        intent = detect_intent(req.query.strip())
        content_match = calculate_content_match(parsed, tokens, intent)

        scores = {
            "intent_match": calculate_intent_match(content_match, intent),
            "extractability": calculate_extractability(parsed, content_match),
            "authority": calculate_authority(parsed, {}),
            "schema_support": calculate_schema_support(parsed, intent),
            "content_depth": calculate_content_depth(parsed),
        }

        default_prob = calculate_citation_probability(**scores)
        mode_result = calculate_with_mode(scores, req.mode)

        return {
            "url": str(req.url),
            "query": req.query.strip(),
            "intent": intent,
            "default_probability": default_prob,
            "default_position": estimate_position(default_prob),
            "mode_probability": mode_result["citation_probability"],
            "mode_position": estimate_position(mode_result["citation_probability"]),
            "mode": mode_result["mode"],
            "mode_label": mode_result["mode_label"],
            "mode_description": mode_result["mode_description"],
            "weights_used": mode_result["weights_used"],
            "raw_scores": scores,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Sensitivity test failed: {str(e)}")


@router.get("/executive-summary")
async def executive_summary(current_user: dict = Depends(verify_token)):
    from modules.enterprise.executive_summary import generate_executive_summary

    # Requires dominate+
    await enforce_feature_access(current_user, "executive_summary")

    return await generate_executive_summary(current_user["user_id"])
