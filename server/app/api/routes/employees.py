from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import employee_controller
from app.core.deps import require_roles
from app.core.rbac import Role
from app.db.deps import get_db
from app.models import Admin
from app.schemas.employee import EmployeeCreate, EmployeeRead, EmployeeUpdate
from app.schemas.response import ApiResponse
from app.utils.response import success_response

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get(
    "",
    response_model=ApiResponse[list[EmployeeRead]],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def list_employees(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, min_length=1),
):
    items, total = employee_controller.list_all(db, limit=limit, offset=offset, search=q)
    meta = {"total": total, "limit": limit, "offset": offset}
    if q:
        meta["q"] = q
    return success_response(items, message="Employees fetched", meta=meta)


@router.get(
    "/{employee_id}",
    response_model=ApiResponse[EmployeeRead],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def get_employee(employee_id: int, db: Annotated[Session, Depends(get_db)]):
    employee = employee_controller.get_one(db, employee_id)
    return success_response(employee, message="Employee fetched")


@router.post("", response_model=ApiResponse[EmployeeRead], status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(require_roles(Role.ADMIN))],
):
    employee = employee_controller.create(db, payload, actor_id=current_admin.id)
    return success_response(employee, message="Employee created")


@router.patch("/{employee_id}", response_model=ApiResponse[EmployeeRead])
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(require_roles(Role.ADMIN))],
):
    employee = employee_controller.update(db, employee_id, payload, actor_id=current_admin.id)
    return success_response(employee, message="Employee updated")


@router.delete("/{employee_id}", response_model=ApiResponse[dict])
def delete_employee(
    employee_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[Admin, Depends(require_roles(Role.ADMIN))],
):
    employee_controller.delete(db, employee_id)
    return success_response({"status": "deleted"}, message="Employee deleted")
