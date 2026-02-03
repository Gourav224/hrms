from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers import attendance_controller
from app.core.deps import require_roles
from app.core.rbac import Role
from app.db.deps import get_db
from app.schemas.attendance import AttendanceListItem, AttendanceStatsPoint
from app.schemas.response import ApiResponse
from app.utils.response import success_response

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get(
    "/stats",
    response_model=ApiResponse[list[AttendanceStatsPoint]],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def attendance_stats(
    db: Session = Depends(get_db),
    employee_id: int | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
):
    today = date.today()
    start_date = date_from or today.replace(day=1)
    end_date = date_to or today
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="date_from must be on or before date_to.",
        )
    points, total_employees = attendance_controller.stats(
        db, date_from=start_date, date_to=end_date, employee_id=employee_id
    )
    meta = {"date_from": start_date, "date_to": end_date, "total_employees": total_employees}
    if employee_id is not None:
        meta["employee_id"] = employee_id
    return success_response(points, message="Attendance stats fetched", meta=meta)


@router.get(
    "",
    response_model=ApiResponse[list[AttendanceListItem]],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def list_attendance_all(
    db: Session = Depends(get_db),
    employee_id: int | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    rows, total = attendance_controller.list_all(
        db,
        employee_id=employee_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    items = [
        {
            "id": attendance.id,
            "employee_id": employee.id,
            "employee_code": employee.employee_id,
            "employee_name": employee.full_name,
            "employee_email": employee.email,
            "department": employee.department,
            "date": attendance.date,
            "status": attendance.status,
            "created_at": attendance.created_at,
            "updated_at": attendance.updated_at,
            "created_by_id": attendance.created_by_id,
            "updated_by_id": attendance.updated_by_id,
        }
        for attendance, employee in rows
    ]
    meta = {"total": total, "limit": limit, "offset": offset}
    if employee_id is not None:
        meta["employee_id"] = employee_id
    if date_from:
        meta["date_from"] = date_from
    if date_to:
        meta["date_to"] = date_to
    return success_response(items, message="Attendance fetched", meta=meta)
