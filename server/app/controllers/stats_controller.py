from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.services.stats_service import overview_stats


def get_overview(db: Session, date_value: date) -> dict:
    return overview_stats(db, date_value)

