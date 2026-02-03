from __future__ import annotations

from pydantic import EmailStr, Field

from app.core.rbac import Role
from app.schemas.base import BaseSchema


class AdminUpdate(BaseSchema):
    name: str | None = Field(default=None, max_length=120)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: Role | None = None

