from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    http_exception_handler,
    rate_limit_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.core.logger import logger, setup_logging
from app.core.ratelimit import limiter
from app.db.base import Base
from app.db.session import engine
from app.middleware.request_logging import request_logger
from app.middleware.security_headers import SecurityHeadersMiddleware
from app import models  # noqa: F401


def create_app() -> FastAPI:
    setup_logging()
    app = FastAPI(
        title="HRMS Lite API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.state.limiter = limiter

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)
    app.add_middleware(SecurityHeadersMiddleware)
    if settings.enable_https_redirect:
        app.add_middleware(HTTPSRedirectMiddleware)

    @app.middleware("http")
    async def logging_middleware(request, call_next):
        return await request_logger(request, call_next)

    @app.on_event("startup")
    def on_startup() -> None:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            logger.info("startup complete")
        except Exception:
            logger.exception("startup failed")
            raise

    @app.on_event("shutdown")
    def on_shutdown() -> None:
        logger.info("shutdown complete")

    app.include_router(api_router)
    app.add_exception_handler(Exception, unhandled_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exception_handler)
    return app


app = create_app()
