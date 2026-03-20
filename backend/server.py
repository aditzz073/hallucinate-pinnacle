import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from database.connection import setup_indexes, db
from middlewares.logging_middleware import LoggingMiddleware
from middlewares.rate_limiter import RateLimitMiddleware
from middlewares.security_headers import SecurityHeadersMiddleware
from modules.auth.routes import router as auth_router
from modules.aeoEngine.routes import router as audit_router
from modules.advancedAudit.routes import router as advanced_audit_router
from modules.aiTestingEngine.routes import router as ai_test_router
from modules.aiTestingLab.routes import router as ai_testing_lab_router
from modules.aiContentCompiler.routes import router as compile_router
from modules.monitoring.routes import router as monitor_router
from modules.reports.routes import router as reports_router
from modules.strategySimulator.routes import router as simulate_router
from modules.enterprise.routes import router as enterprise_router
from modules.cli.routes import router as cli_router

load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("pinnacle_ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Pinnacle.AI...")
    indexes_ok = await setup_indexes()
    if indexes_ok:
        logger.info("Database indexes created.")
    else:
        logger.warning("Startup continuing without DB index setup. MongoDB connection is unavailable.")
    yield
    logger.info("Shutting down Pinnacle.AI.")


app = FastAPI(
    title="Pinnacle.AI",
    description="AI Engine Optimization platform - Analyze webpage performance in AI-generated answers",
    version="1.0.0",
    lifespan=lifespan,
)


def _parse_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "").strip()
    if not raw_origins:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    # This API uses bearer tokens in Authorization headers, not cookie auth.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 8: Security headers
app.add_middleware(SecurityHeadersMiddleware)

# Phase 8: Rate limiting
app.add_middleware(RateLimitMiddleware)

# Logging middleware
app.add_middleware(LoggingMiddleware)


# Centralized error handling with standardized format
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# Routes
app.include_router(auth_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(advanced_audit_router, prefix="/api")
app.include_router(ai_test_router, prefix="/api")
app.include_router(ai_testing_lab_router, prefix="/api")
app.include_router(compile_router, prefix="/api")
app.include_router(monitor_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(simulate_router, prefix="/api")
app.include_router(enterprise_router, prefix="/api")
app.include_router(cli_router, prefix="/api")


# Health endpoint
@app.get("/api/health")
async def health():
    try:
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "service": "Pinnacle.AI",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
