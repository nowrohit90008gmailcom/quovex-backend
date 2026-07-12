"""FastAPI main application entry point."""
import logging
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings

# Structured JSON logging in production
if settings.ENVIRONMENT == "production":
    from pythonjsonlogger import jsonlogger
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(name)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    ))
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.session import Base, engine, SessionLocal
from app.db.redis_client import close_redis, get_redis
from app.models import *  # noqa: ensure models are registered

# Import routers
from app.api.v1 import auth, sessions, leaderboard, quiz, users, admin, rewards, badges, app_lock, referral, topics, reports, app_version, support

# Rate limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    db_dialect = settings.DATABASE_URL.split(':')[0] if '://' in settings.DATABASE_URL else 'unknown'
    logger.info(f"Database dialect: {db_dialect}")
    workers = os.environ.get("UVICORN_WORKERS", "2")
    logger.info(f"Workers: {workers}")

    if settings.ENVIRONMENT == "production":
        if settings.SECRET_KEY == "change-me-in-production":
            logger.warning("SECRET_KEY is still set to the default value! Change it immediately.")
        logger.info(f"Allowed origins: {settings.ALLOWED_ORIGINS}")

    if settings.ENVIRONMENT != "production":
        Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    await close_redis()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Quovex Backend API — focus, compete, earn rewards.",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (KYC photos, etc.)
UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(sessions.router, prefix=API_PREFIX)
app.include_router(leaderboard.router, prefix=API_PREFIX)
app.include_router(quiz.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(rewards.router, prefix=API_PREFIX)
app.include_router(badges.router, prefix=API_PREFIX)
app.include_router(app_lock.router, prefix=API_PREFIX)
app.include_router(referral.router, prefix=API_PREFIX)
app.include_router(topics.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)
app.include_router(app_version.router, prefix=API_PREFIX)
app.include_router(support.router, prefix=API_PREFIX)


@app.get("/health")
async def health_check():
    """Enhanced health check with DB and Redis status."""
    statuses = {"status": "ok", "version": settings.APP_VERSION}

    # DB check
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        statuses["database"] = "ok"
    except Exception as e:
        statuses["database"] = str(e)
        statuses["status"] = "degraded"

    # Redis check
    try:
        r = await get_redis()
        if r:
            await r.ping()
            statuses["redis"] = "ok"
        else:
            statuses["redis"] = "not_available"
    except Exception as e:
        statuses["redis"] = str(e)
        statuses["status"] = "degraded"

    if statuses["status"] != "ok":
        return JSONResponse(status_code=503, content=statuses)
    return statuses
