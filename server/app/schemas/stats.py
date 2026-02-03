from __future__ import annotations

from datetime import date

from app.schemas.base import BaseSchema


class OverviewStats(BaseSchema):
    date: date
    total_employees: int
    present: int
    absent: int
    unmarked: int
