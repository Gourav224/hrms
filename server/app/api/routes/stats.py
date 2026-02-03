from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.controllers import stats_controller
from app.core.deps import require_roles
from app.core.rbac import Role
from app.db.deps import get_db
from app.schemas.response import ApiResponse
from app.schemas.stats import OverviewStats
from app.utils.response import success_response

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get(
    "/overview",
    response_model=ApiResponse[OverviewStats],
    dependencies=[Depends(require_roles(Role.ADMIN, Role.MANAGER))],
)
def overview(
    db: Session = Depends(get_db),
    for_date: date = Query(default_factory=date.today, alias="date"),
):
    stats = stats_controller.get_overview(db, for_date)
    return success_response(stats, message="Stats fetched")
