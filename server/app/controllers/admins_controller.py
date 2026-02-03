from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.rbac import Role
from app.schemas.admin import AdminCreate
from app.schemas.admins import AdminUpdate
from app.services import admins_service


def list_all(db: Session, limit: int, offset: int, search: str | None):
    return admins_service.list_admins(db, limit=limit, offset=offset, search=search)


def get_one(db: Session, admin_id: int):
    admin = admins_service.get_admin(db, admin_id)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found.")
    return admin


def create(db: Session, payload: AdminCreate, actor_id: int):
    if payload.role not in {Role.ADMIN, Role.MANAGER}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported role.")
    if admins_service.get_admin_by_email(db, str(payload.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Admin with this email already exists."
        )
    try:
        return admins_service.create_admin_user(
            db,
            name=payload.name,
            email=str(payload.email),
            password=payload.password,
            role=payload.role,
            actor_id=actor_id,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Admin with this email already exists."
        )


def update(db: Session, admin_id: int, payload: AdminUpdate, actor_id: int):
    admin = get_one(db, admin_id)
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update."
        )
    if "email" in updates and updates["email"] is not None:
        other = admins_service.get_admin_by_email(db, str(updates["email"]))
        if other and other.id != admin.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Admin with this email already exists."
            )
        updates["email"] = str(updates["email"])
    if "role" in updates and updates["role"] is not None:
        if updates["role"] not in {Role.ADMIN, Role.MANAGER}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported role.")
    try:
        return admins_service.update_admin_user(db, admin, updates, actor_id=actor_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Admin with this email already exists."
        )


def delete(db: Session, admin_id: int, actor_id: int) -> None:
    if admin_id == actor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account."
        )
    admin = get_one(db, admin_id)
    admins_service.delete_admin_user(db, admin)
