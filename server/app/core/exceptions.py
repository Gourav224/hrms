from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette import status

from app.core.logger import logger
from app.schemas.response import ErrorDetail, ErrorResponse


def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "Request error."
    payload = ErrorResponse(message=message)
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump())


def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [
        ErrorDetail(loc=list(err.get("loc", [])), msg=err.get("msg", ""), type=err.get("type"))
        for err in exc.errors()
    ]
    payload = ErrorResponse(message="Validation error.", errors=errors)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload.model_dump()
    )


def rate_limit_exception_handler(_: Request, exc: RateLimitExceeded) -> JSONResponse:
    payload = ErrorResponse(message="Rate limit exceeded.")
    return JSONResponse(status_code=429, content=payload.model_dump())


def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error", exc_info=exc)
    payload = ErrorResponse(message="Internal server error.")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=payload.model_dump()
    )
