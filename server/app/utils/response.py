from typing import Any, TypeVar

from app.schemas.response import ApiResponse


T = TypeVar("T")


def success_response(
    data: T | None = None, message: str = "Success", meta: dict[str, Any] | None = None
) -> ApiResponse[T]:
    return ApiResponse(message=message, data=data, meta=meta)
