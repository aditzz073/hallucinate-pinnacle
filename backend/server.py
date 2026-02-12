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
from modules.auth.routes import router as auth_router

load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("aeo_copilot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Discoverability Copilot...")
    await setup_indexes()
    logger.info("Database indexes created.")
    yield
    logger.info("Shutting down AI Discoverability Copilot.")


app = FastAPI(
    title="AI Discoverability Copilot",
    description="AEO/GEO platform - Analyze webpage performance in AI-generated answers",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware
app.add_middleware(LoggingMiddleware)


# Centralized error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Routes
app.include_router(auth_router, prefix="/api")


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
        "service": "AI Discoverability Copilot",
        "version": "0.1.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
