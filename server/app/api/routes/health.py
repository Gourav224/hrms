from fastapi import APIRouter

from app.core.ratelimit import limiter
from app.schemas.response import ApiResponse
from app.utils.response import success_response

router = APIRouter()


@router.get("/health", response_model=ApiResponse[dict])
@limiter.exempt
def health() -> ApiResponse[dict]:
    return success_response({"status": "ok"}, message="Service healthy")
