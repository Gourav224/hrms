from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.rbac import Role
from app.core.security import create_access_token
from app.schemas.admin import AdminCreate, SessionResponse, Token
from app.services.admin_service import (
    authenticate_admin,
    create_admin,
    get_admin_by_email,
    has_any_admin,
    update_last_active,
)


def bootstrap_admin(db: Session, payload: AdminCreate) -> None:
    if has_any_admin(db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin already exists. Bootstrap is disabled.",
        )
    if payload.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bootstrap admin must have admin role.",
        )
    try:
        create_admin(
            db,
            payload.email,
            payload.password,
            payload.role,
            actor_id=None,
            name=payload.name,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists.",
        )


def login(db: Session, email: str, password: str) -> Token:
    admin = authenticate_admin(db, email, password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )
    update_last_active(db, admin)
    access_token = create_access_token(subject=admin.email, role=admin.role)
    return Token(access_token=access_token)


def create_manager(db: Session, payload: AdminCreate, actor_id: int) -> None:
    if get_admin_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists.",
        )
    if payload.role not in {Role.ADMIN, Role.MANAGER}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported role.")
    try:
        create_admin(
            db,
            payload.email,
            payload.password,
            payload.role,
            actor_id=actor_id,
            name=payload.name,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists.",
        )


def get_session(db: Session, admin_email: str) -> SessionResponse:
    admin = get_admin_by_email(db, admin_email)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found.")
    admin = update_last_active(db, admin)
    access_token = create_access_token(subject=admin.email, role=admin.role)
    return SessionResponse(user=admin, token=Token(access_token=access_token))
