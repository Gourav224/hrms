from app.api.routes.attendance import router as attendance_router
from app.api.routes.auth import router as auth_router
from app.api.routes.admins import router as admins_router
from app.api.routes.employees import router as employees_router
from app.api.routes.health import router as health_router
from app.api.routes.stats import router as stats_router

__all__ = [
    "admins_router",
    "attendance_router",
    "auth_router",
    "employees_router",
    "health_router",
    "stats_router",
]
