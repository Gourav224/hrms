import time
import uuid

from fastapi import Request
from starlette.responses import Response

from app.core.logger import logger


async def request_logger(request: Request, call_next) -> Response:
    request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))
    start_time = time.time()
    response: Response = await call_next(request)
    duration_ms = int((time.time() - start_time) * 1000)
    response.headers["X-Request-Id"] = request_id
    logger.info(
        "request_id=%s method=%s path=%s status=%s duration_ms=%s",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response
