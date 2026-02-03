from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema

from app.core.rbac import Role


class AdminCreate(BaseSchema):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role = Role.ADMIN


class AdminRead(BaseSchema):
    id: int
    email: EmailStr
    role: Role
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None


class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"
