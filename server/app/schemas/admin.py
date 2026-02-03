from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema

from app.core.rbac import Role


class AdminCreate(BaseSchema):
    name: str | None = Field(default=None, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role = Role.ADMIN


class AdminRead(BaseSchema):
    id: int
    name: str | None = None
    email: EmailStr
    role: Role
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None
    last_active_at: datetime | None = None


class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"


class SessionResponse(BaseSchema):
    user: AdminRead
    token: Token


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
