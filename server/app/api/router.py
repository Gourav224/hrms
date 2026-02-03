from fastapi import APIRouter

from app.api.routes import admins, attendance, auth, employees, health, stats


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(admins.router)
api_router.include_router(employees.router)
api_router.include_router(attendance.router)
api_router.include_router(stats.router)
