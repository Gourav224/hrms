from __future__ import annotations

import os
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from datetime import date, timedelta

from app.core.rbac import Role
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Attendance, AttendanceStatus, Admin, Employee


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        reset_admin = os.getenv("SEED_RESET_ADMIN", "false").lower() == "true"
        admin = db.query(Admin).filter(Admin.email == "admin@hrms.local").first()
        if not admin:
            admin = Admin(email="admin@hrms.com", password_hash=hash_password("admin1234"), role=Role.ADMIN)
            db.add(admin)
            db.commit()
            db.refresh(admin)
        if admin.name is None:
            admin.name = "HR Admin"
        if reset_admin:
            admin.password_hash = hash_password("admin1234")
        if admin.name is not None or reset_admin:
            db.commit()
            db.refresh(admin)

        if db.query(Employee).count() == 0:
            employees = [
                Employee(
                    employee_id="EMP-001",
                    full_name="Ava Patel",
                    email="ava.patel@hrms.com",
                    department="Engineering",
                    created_by_id=admin.id,
                    updated_by_id=admin.id,
                ),
                Employee(
                    employee_id="EMP-002",
                    full_name="Noah Kim",
                    email="noah.kim@hrms.com",
                    department="HR",
                    created_by_id=admin.id,
                    updated_by_id=admin.id,
                ),
                Employee(
                    employee_id="EMP-003",
                    full_name="Liam Chen",
                    email="liam.chen@hrms.com",
                    department="Finance",
                    created_by_id=admin.id,
                    updated_by_id=admin.id,
                ),
            ]
            db.add_all(employees)
            db.commit()

        if db.query(Attendance).count() == 0:
            employees = db.query(Employee).all()
            today = date.today()
            for employee in employees:
                for i in range(3):
                    db.add(
                        Attendance(
                            employee_id=employee.id,
                            date=today - timedelta(days=i),
                            status=AttendanceStatus.PRESENT
                            if i % 2 == 0
                            else AttendanceStatus.ABSENT,
                            created_by_id=admin.id,
                            updated_by_id=admin.id,
                        )
                    )
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
