from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.services.employee_service import (
    create_employee,
    delete_employee,
    get_employee_by_code,
    list_employees,
    update_employee,
)


def list_all(db: Session, limit: int, offset: int, search: str | None):
    return list_employees(db, limit=limit, offset=offset, search=search)


def create(db: Session, payload: EmployeeCreate, actor_id: int | None):
    try:
        return create_employee(
            db,
            employee_id=payload.employee_id,
            full_name=payload.full_name,
            email=str(payload.email),
            department=payload.department,
            actor_id=actor_id,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with this employee_id or email already exists.",
        )


def get_one(db: Session, employee_id: str):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    return employee


def update(db: Session, employee_id: str, payload: EmployeeUpdate, actor_id: int | None):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update."
        )
    try:
        return update_employee(db, employee, updates, actor_id=actor_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with this email already exists.",
        )


def delete(db: Session, employee_id: str):
    employee = get_employee_by_code(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    delete_employee(db, employee)
