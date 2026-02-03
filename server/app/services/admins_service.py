from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.rbac import Role
from app.core.security import hash_password, verify_password
from app.models import Admin


def list_admins(
    db: Session,
    limit: int,
    offset: int,
    search: str | None,
) -> tuple[list[Admin], int]:
    query = db.query(Admin)
    if search:
        like = f"%{search.strip()}%"
        query = query.filter((Admin.email.ilike(like)) | (Admin.name.ilike(like)))
    total = query.count()
    items = query.order_by(Admin.id.desc()).offset(offset).limit(limit).all()
    return items, total


def get_admin(db: Session, admin_id: int) -> Admin | None:
    return db.query(Admin).filter(Admin.id == admin_id).first()


def get_admin_by_email(db: Session, email: str) -> Admin | None:
    return db.query(Admin).filter(Admin.email == email).first()


def create_admin_user(
    db: Session,
    name: str | None,
    email: str,
    password: str,
    role: Role,
    actor_id: int | None,
) -> Admin:
    admin = Admin(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        created_by_id=actor_id,
        updated_by_id=actor_id,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def update_admin_user(db: Session, admin: Admin, updates: dict[str, Any], actor_id: int) -> Admin:
    if "password" in updates:
        password = updates.pop("password")
        if password:
            updates["password_hash"] = hash_password(password)
    for key, value in updates.items():
        setattr(admin, key, value)
    admin.updated_by_id = actor_id
    db.commit()
    db.refresh(admin)
    return admin


def delete_admin_user(db: Session, admin: Admin) -> None:
    db.delete(admin)
    db.commit()


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    admin = get_admin_by_email(db, email)
    if not admin:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin


def has_any_admin(db: Session) -> bool:
    return db.query(Admin).first() is not None


def update_last_active(db: Session, admin: Admin) -> Admin:
    admin.last_active_at = datetime.now(UTC)
    admin.updated_by_id = admin.id
    db.commit()
    db.refresh(admin)
    return admin
