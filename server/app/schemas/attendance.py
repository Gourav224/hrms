from __future__ import annotations

from datetime import date as dt_date
from datetime import datetime
from enum import Enum

from app.schemas.base import BaseSchema


class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


class AttendanceCreate(BaseSchema):
    date: dt_date
    status: AttendanceStatus


class AttendanceRead(BaseSchema):
    id: int
    employee_id: int
    date: dt_date
    status: AttendanceStatus
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None


class AttendanceUpdate(BaseSchema):
    date: dt_date | None = None
    status: AttendanceStatus | None = None


class AttendanceTodayUpsert(BaseSchema):
    status: AttendanceStatus


class AttendanceListItem(BaseSchema):
    id: int
    employee_id: int
    employee_code: str
    employee_name: str
    employee_email: str
    department: str
    date: dt_date
    status: AttendanceStatus
    created_at: datetime
    updated_at: datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None


class AttendanceStatsPoint(BaseSchema):
    date: dt_date
    present: int
    absent: int
    unmarked: int
