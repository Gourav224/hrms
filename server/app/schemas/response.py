from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

from app.schemas.base import BaseSchema

T = TypeVar("T")


class ApiResponse[T](BaseModel):
    success: bool = True
    message: str
    data: T | None = None
    meta: dict[str, Any] | None = None
    model_config = ConfigDict(from_attributes=True)


class ErrorDetail(BaseSchema):
    loc: list[str | int] | None = None
    msg: str
    type: str | None = None


class ErrorResponse(BaseSchema):
    success: bool = False
    message: str
    errors: list[ErrorDetail] | None = None
