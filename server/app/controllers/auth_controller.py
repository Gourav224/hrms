from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.rbac import Role
from app.core.security import create_access_token
from app.schemas.admin import AdminCreate, SessionResponse, Token
from app.services import admins_service as admin_service


def bootstrap_admin(db: Session, payload: AdminCreate) -> None:
    if admin_service.has_any_admin(db):
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
        admin_service.create_admin_user(
            db,
            name=payload.name,
            email=str(payload.email),
            password=payload.password,
            role=payload.role,
            actor_id=None,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists.",
        )


def login(db: Session, email: str, password: str) -> Token:
    admin = admin_service.authenticate_admin(db, email, password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )
    admin_service.update_last_active(db, admin)
    access_token = create_access_token(subject=admin.email, role=admin.role)
    return Token(access_token=access_token)


def create_manager(db: Session, payload: AdminCreate, actor_id: int) -> None:
    if admin_service.get_admin_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists.",
        )
    if payload.role not in {Role.ADMIN, Role.MANAGER}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported role.")
    try:
        admin_service.create_admin_user(
            db,
            name=payload.name,
            email=str(payload.email),
            password=payload.password,
            role=payload.role,
            actor_id=actor_id,
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists.",
        )


def get_session(db: Session, admin_email: str) -> SessionResponse:
    admin = admin_service.get_admin_by_email(db, admin_email)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found.")
    admin = admin_service.update_last_active(db, admin)
    access_token = create_access_token(subject=admin.email, role=admin.role)
    return SessionResponse(user=admin, token=Token(access_token=access_token))
