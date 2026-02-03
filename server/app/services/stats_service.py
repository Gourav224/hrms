from __future__ import annotations

from datetime import date

from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session

from app.models import Attendance, AttendanceStatus, Employee


def overview_stats(db: Session, date_value: date) -> dict:
    """
    Returns employee totals + attendance split for the given date.

    Unmarked = employees with no attendance record for that date.
    """

    total, present, absent, unmarked = (
        db.query(
            func.count(Employee.id),
            func.sum(case((Attendance.status == AttendanceStatus.PRESENT, 1), else_=0)),
            func.sum(case((Attendance.status == AttendanceStatus.ABSENT, 1), else_=0)),
            func.sum(case((Attendance.id.is_(None), 1), else_=0)),
        )
        .select_from(Employee)
        .join(
            Attendance,
            and_(Attendance.employee_id == Employee.id, Attendance.date == date_value),
            isouter=True,
        )
        .one()
    )

    return {
        "date": date_value,
        "total_employees": int(total or 0),
        "present": int(present or 0),
        "absent": int(absent or 0),
        "unmarked": int(unmarked or 0),
    }

