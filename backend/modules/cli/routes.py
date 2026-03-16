from fastapi import APIRouter, HTTPException
import logging
from modules.cli.models import CLIAnalyzeRequest
from modules.cli.service import run_cli_analysis
from middlewares.auth_middleware import get_current_user

router = APIRouter(prefix="/cli", tags=["CLI"])
logger = logging.getLogger("pinnacle_ai")

@router.post("/analyze")
async def analyze_from_cli(req: CLIAnalyzeRequest, current_user: dict = get_current_user):
    """
    Endpoint dedicated to the Pinnacle CLI.
    Expects HTML to be fetched locally by the CLI and posted here to avoid crawling limits/issues on localhost.
    """
    try:
        # Pass the raw html from the request body to the analysis service
        result = await run_cli_analysis(str(req.url), req.html, req.query)
        return result
    except Exception as e:
        logger.exception("CLI Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
