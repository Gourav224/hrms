from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import admins_controller
from app.core.deps import require_roles
from app.core.rbac import Role
from app.db.deps import get_db
from app.schemas.admin import AdminCreate, AdminRead
from app.schemas.admins import AdminUpdate
from app.schemas.response import ApiResponse
from app.utils.response import success_response

router = APIRouter(prefix="/admins", tags=["admins"])


@router.get("", response_model=ApiResponse[list[AdminRead]])
def list_admins(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, min_length=1),
    current_admin=Depends(require_roles(Role.ADMIN)),
):
    items, total = admins_controller.list_all(db, limit=limit, offset=offset, search=q)
    meta = {"total": total, "limit": limit, "offset": offset}
    if q:
        meta["q"] = q
    return success_response(items, message="Admins fetched", meta=meta)


@router.get("/{admin_id}", response_model=ApiResponse[AdminRead])
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN)),
):
    admin = admins_controller.get_one(db, admin_id)
    return success_response(admin, message="Admin fetched")


@router.post("", response_model=ApiResponse[AdminRead], status_code=status.HTTP_201_CREATED)
def create_admin(
    payload: AdminCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN)),
):
    admin = admins_controller.create(db, payload, actor_id=current_admin.id)
    return success_response(admin, message="Admin created")


@router.patch("/{admin_id}", response_model=ApiResponse[AdminRead])
def update_admin(
    admin_id: int,
    payload: AdminUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN)),
):
    admin = admins_controller.update(db, admin_id, payload, actor_id=current_admin.id)
    return success_response(admin, message="Admin updated")


@router.delete("/{admin_id}", response_model=ApiResponse[dict])
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN)),
):
    admins_controller.delete(db, admin_id, actor_id=current_admin.id)
    return success_response({"status": "deleted"}, message="Admin deleted")
