from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema


class EmployeeCreate(BaseSchema):
    employee_id: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    department: str = Field(min_length=1, max_length=120)


class EmployeeRead(BaseSchema):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None


class EmployeeUpdate(BaseSchema):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    email: EmailStr | None = None
    department: str | None = Field(default=None, min_length=1, max_length=120)
