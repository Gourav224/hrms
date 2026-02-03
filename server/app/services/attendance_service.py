from datetime import date, timedelta

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


def list_attendance_all(
    db: Session,
    employee_id: int | None,
    date_from: date | None,
    date_to: date | None,
    limit: int,
    offset: int,
) -> tuple[list[tuple[Attendance, Employee]], int]:
    query = db.query(Attendance, Employee).join(Employee, Attendance.employee_id == Employee.id)
    if employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    total = query.count()
    items = (
        query.order_by(Attendance.date.desc(), Attendance.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def attendance_stats(
    db: Session,
    date_from: date,
    date_to: date,
    employee_id: int | None,
) -> tuple[list[dict], int]:
    total_employees = (
        1 if employee_id is not None else int(db.query(func.count(Employee.id)).scalar() or 0)
    )
    query = db.query(
        Attendance.date,
        func.sum(case((Attendance.status == AttendanceStatus.PRESENT, 1), else_=0)),
        func.sum(case((Attendance.status == AttendanceStatus.ABSENT, 1), else_=0)),
    ).filter(Attendance.date >= date_from, Attendance.date <= date_to)
    if employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)
    rows = query.group_by(Attendance.date).all()
    by_date = {row[0]: {"present": int(row[1] or 0), "absent": int(row[2] or 0)} for row in rows}

    points: list[dict] = []
    cursor = date_from
    while cursor <= date_to:
        counts = by_date.get(cursor, {"present": 0, "absent": 0})
        present = counts["present"]
        absent = counts["absent"]
        unmarked = max(total_employees - present - absent, 0)
        points.append(
            {
                "date": cursor,
                "present": present,
                "absent": absent,
                "unmarked": unmarked,
            }
        )
        cursor += timedelta(days=1)
    return points, total_employees


def get_attendance_by_id(db: Session, employee: Employee, attendance_id: int) -> Attendance | None:
    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee.id, Attendance.id == attendance_id)
        .first()
    )


def get_attendance_by_date(db: Session, employee: Employee, date_value: date) -> Attendance | None:
    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee.id, Attendance.date == date_value)
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


def upsert_attendance_for_date(
    db: Session,
    employee: Employee,
    date_value: date,
    status: AttendanceStatus,
    actor_id: int | None,
) -> Attendance:
    existing = get_attendance_by_date(db, employee, date_value)
    if existing:
        return update_attendance(db, existing, {"status": status}, actor_id=actor_id)
    return create_attendance(db, employee, date_value, status, actor_id=actor_id)


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
