"""CLI Routes"""
from fastapi import APIRouter, HTTPException
import logging
from modules.cli.models import CLIAnalyzeRequest
from modules.cli.service import run_cli_analysis
from middlewares.auth_middleware import get_current_user
from middlewares.feature_access import (
    enforce_feature_access,
    ensure_usage_doc,
    reset_monthly_usage_if_needed,
    UpgradeRequiredException,
    NoActivePlanException,
)

router = APIRouter(prefix="/cli", tags=["CLI"])
logger = logging.getLogger("pinnacle_ai")


@router.post("/analyze")
async def analyze_from_cli(req: CLIAnalyzeRequest, current_user: dict = get_current_user):
    """
    Endpoint dedicated to the Pinnacle CLI.
    Expects HTML to be fetched locally by the CLI and posted here to avoid crawling limits/issues on localhost.
    Requires dominate plan.
    """
    user_id = current_user["user_id"]

    # 1. Ensure usage doc
    await ensure_usage_doc(user_id)

    # 2. Feature access (cli_access requires dominate+)
    await enforce_feature_access(current_user, "cli_access")

    try:
        result = await run_cli_analysis(str(req.url), req.html, req.query)
        return result
    except (UpgradeRequiredException, NoActivePlanException):
        raise
    except Exception as e:
        logger.exception("CLI Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
