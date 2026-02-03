from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.controllers.auth_controller import bootstrap_admin, create_manager, login
from app.core.config import settings
from app.core.ratelimit import limiter
from app.core.deps import require_roles
from app.core.rbac import Role
from app.db.deps import get_db
from app.schemas.admin import AdminCreate, Token
from app.schemas.response import ApiResponse
from app.utils.response import success_response


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=ApiResponse[Token])
@limiter.limit(settings.rate_limit_login)
def login_admin(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> ApiResponse[Token]:
    token = login(db, form_data.username, form_data.password)
    return success_response(token, message="Login successful")


@router.post("/bootstrap", status_code=status.HTTP_201_CREATED, response_model=ApiResponse[dict])
@limiter.limit(settings.rate_limit_bootstrap)
def bootstrap(
    request: Request,
    payload: AdminCreate,
    db: Session = Depends(get_db),
    bootstrap_token: str | None = Header(default=None, alias="X-Admin-Bootstrap-Token"),
) -> ApiResponse[dict]:
    if not bootstrap_token or bootstrap_token != settings.bootstrap_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bootstrap token.",
        )
    bootstrap_admin(db, payload)
    return success_response({"status": "created"}, message="Admin created")


@router.post("/admins", status_code=status.HTTP_201_CREATED, response_model=ApiResponse[dict])
def create_admin_user(
    payload: AdminCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(Role.ADMIN)),
) -> ApiResponse[dict]:
    create_manager(db, payload, actor_id=current_admin.id)
    return success_response({"status": "created"}, message="Admin created")
