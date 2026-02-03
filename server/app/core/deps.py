from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rbac import Role
from app.db.deps import get_db
from app.models import Admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


from typing import Annotated


def get_current_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as err:
        raise credentials_exception from err
    email = payload.get("sub")
    if not email:
        raise credentials_exception
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        raise credentials_exception
    return admin


def require_roles(*roles: Role) -> Callable:
    def role_checker(current_admin: Annotated[Admin, Depends(get_current_admin)]) -> Admin:
        if current_admin.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return current_admin

    return role_checker
