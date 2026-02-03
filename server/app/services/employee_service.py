from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Employee


def list_employees(
    db: Session, limit: int, offset: int, search: str | None
) -> tuple[list[Employee], int]:
    query = db.query(Employee)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Employee.employee_id.ilike(term),
                Employee.full_name.ilike(term),
                Employee.email.ilike(term),
                Employee.department.ilike(term),
            )
        )
    total = query.count()
    items = query.order_by(Employee.id.asc()).offset(offset).limit(limit).all()
    return items, total


def get_employee_by_code(db: Session, employee_id: str) -> Employee | None:
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()


def create_employee(
    db: Session,
    employee_id: str,
    full_name: str,
    email: str,
    department: str,
    actor_id: int | None,
) -> Employee:
    employee = Employee(
        employee_id=employee_id,
        full_name=full_name,
        email=email,
        department=department,
        created_by_id=actor_id,
        updated_by_id=actor_id,
    )
    db.add(employee)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise exc
    db.refresh(employee)
    return employee


def update_employee(
    db: Session,
    employee: Employee,
    updates: dict,
    actor_id: int | None,
) -> Employee:
    for key, value in updates.items():
        setattr(employee, key, value)
    employee.updated_by_id = actor_id
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise exc
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee: Employee) -> None:
    db.delete(employee)
    db.commit()
