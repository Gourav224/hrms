from sqlalchemy.orm import Session

from app.core.rbac import Role
from app.core.security import hash_password, verify_password
from app.models import Admin


def get_admin_by_email(db: Session, email: str) -> Admin | None:
    return db.query(Admin).filter(Admin.email == email).first()


def create_admin(db: Session, email: str, password: str, role: Role, actor_id: int | None) -> Admin:
    admin = Admin(
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


def authenticate_admin(db: Session, email: str, password: str) -> Admin | None:
    admin = get_admin_by_email(db, email)
    if not admin:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin


def has_any_admin(db: Session) -> bool:
    return db.query(Admin).first() is not None
