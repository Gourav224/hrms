from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import attendance_controller
from app.core.deps import require_roles
from app.core.rbac import Role
from app.db.deps import get_db
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate
from app.schemas.response import ApiResponse
from app.utils.response import success_response


router = APIRouter(prefix="/employees/{employee_id}/attendance", tags=["attendance"])


@router.get(
    "/summary",
    response_model=ApiResponse[dict],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def attendance_summary(
    employee_id: str,
    db: Session = Depends(get_db),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
):
    summary = attendance_controller.summary(db, employee_id, date_from, date_to)
    return success_response(summary, message="Attendance summary fetched")


@router.get(
    "",
    response_model=ApiResponse[list[AttendanceRead]],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def list_attendance(
    employee_id: str,
    db: Session = Depends(get_db),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items, total = attendance_controller.list_for_employee(
        db, employee_id, date_from, date_to, limit, offset
    )
    meta = {"total": total, "limit": limit, "offset": offset}
    return success_response(items, message="Attendance fetched", meta=meta)


@router.get(
    "/{attendance_id}",
    response_model=ApiResponse[AttendanceRead],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def get_attendance(
    employee_id: str,
    attendance_id: int,
    db: Session = Depends(get_db),
):
    attendance = attendance_controller.get_one(db, employee_id, attendance_id)
    return success_response(attendance, message="Attendance fetched")


@router.post("", response_model=ApiResponse[AttendanceRead], status_code=status.HTTP_201_CREATED)
def create_attendance(
    employee_id: str,
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN, Role.MANAGER)),
):
    attendance = attendance_controller.create_for_employee(
        db, employee_id, payload, actor_id=current_admin.id
    )
    return success_response(attendance, message="Attendance created")


@router.patch("/{attendance_id}", response_model=ApiResponse[AttendanceRead])
def update_attendance(
    employee_id: str,
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN, Role.MANAGER)),
):
    attendance = attendance_controller.update(
        db, employee_id, attendance_id, payload, actor_id=current_admin.id
    )
    return success_response(attendance, message="Attendance updated")


@router.delete("/{attendance_id}", response_model=ApiResponse[dict])
def delete_attendance(
    employee_id: str,
    attendance_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN)),
):
    attendance_controller.delete(db, employee_id, attendance_id)
    return success_response({"status": "deleted"}, message="Attendance deleted")
