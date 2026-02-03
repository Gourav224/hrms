from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import AttendanceStatus
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate
from app.services.attendance_service import (
    attendance_summary,
    create_attendance,
    delete_attendance,
    upsert_attendance_for_date,
    get_attendance_by_id,
    list_attendance,
    update_attendance,
)
from app.services.employee_service import get_employee_by_code


def list_for_employee(
    db: Session,
    employee_id: str,
    date_from: date | None,
    date_to: date | None,
    limit: int,
    offset: int,
):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    return list_attendance(db, employee, date_from, date_to, limit, offset)


def create_for_employee(
    db: Session, employee_id: str, payload: AttendanceCreate, actor_id: int | None
):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    try:
        return create_attendance(
            db,
            employee,
            payload.date,
            AttendanceStatus(payload.status.value),
            actor_id=actor_id,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance for this employee and date already exists.",
        )


def upsert_today(db: Session, employee_id: str, status_value: AttendanceStatus, actor_id: int | None):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    today = date.today()
    return upsert_attendance_for_date(db, employee, today, status_value, actor_id=actor_id)


def get_one(db: Session, employee_id: str, attendance_id: int):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    attendance = get_attendance_by_id(db, employee, attendance_id)
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found.")
    return attendance


def update(
    db: Session,
    employee_id: str,
    attendance_id: int,
    payload: AttendanceUpdate,
    actor_id: int | None,
):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    attendance = get_attendance_by_id(db, employee, attendance_id)
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found.")
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update."
        )
    if "status" in updates and updates["status"] is not None:
        updates["status"] = AttendanceStatus(updates["status"].value)
    try:
        return update_attendance(db, attendance, updates, actor_id=actor_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance for this employee and date already exists.",
        )


def delete(db: Session, employee_id: str, attendance_id: int):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    attendance = get_attendance_by_id(db, employee, attendance_id)
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found.")
    delete_attendance(db, attendance)


def summary(
    db: Session,
    employee_id: str,
    date_from: date | None,
    date_to: date | None,
):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    stats = attendance_summary(db, employee, date_from, date_to)
    return {
        "employee_id": employee.id,
        "employee_code": employee.employee_id,
        "total_records": stats["total"],
        "total_present": stats["present"],
        "total_absent": stats["absent"],
    }
