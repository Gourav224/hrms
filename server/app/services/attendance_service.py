from datetime import date

from sqlalchemy import case, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Attendance, AttendanceStatus, Employee


def list_attendance(
    db: Session,
    employee: Employee,
    date_from: date | None,
    date_to: date | None,
    limit: int,
    offset: int,
) -> tuple[list[Attendance], int]:
    query = db.query(Attendance).filter(Attendance.employee_id == employee.id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    total = query.count()
    items = query.order_by(Attendance.date.desc()).offset(offset).limit(limit).all()
    return items, total


def get_attendance_by_id(db: Session, employee: Employee, attendance_id: int) -> Attendance | None:
    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee.id, Attendance.id == attendance_id)
        .first()
    )


def create_attendance(
    db: Session,
    employee: Employee,
    date_value: date,
    status: AttendanceStatus,
    actor_id: int | None,
) -> Attendance:
    attendance = Attendance(
        employee_id=employee.id,
        date=date_value,
        status=status,
        created_by_id=actor_id,
        updated_by_id=actor_id,
    )
    db.add(attendance)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise exc
    db.refresh(attendance)
    return attendance


def update_attendance(
    db: Session,
    attendance: Attendance,
    updates: dict,
    actor_id: int | None,
) -> Attendance:
    for key, value in updates.items():
        setattr(attendance, key, value)
    attendance.updated_by_id = actor_id
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise exc
    db.refresh(attendance)
    return attendance


def delete_attendance(db: Session, attendance: Attendance) -> None:
    db.delete(attendance)
    db.commit()


def attendance_summary(
    db: Session,
    employee: Employee,
    date_from: date | None,
    date_to: date | None,
) -> dict:
    query = db.query(
        func.count(Attendance.id),
        func.sum(case((Attendance.status == AttendanceStatus.PRESENT, 1), else_=0)),
        func.sum(case((Attendance.status == AttendanceStatus.ABSENT, 1), else_=0)),
    ).filter(Attendance.employee_id == employee.id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    total, present, absent = query.one()
    return {
        "total": int(total or 0),
        "present": int(present or 0),
        "absent": int(absent or 0),
    }
