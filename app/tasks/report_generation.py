"""Celery task to auto-generate daily and weekly AI reports for active users."""
import logging
from datetime import datetime, timezone, timedelta

from sqlalchemy import func

from app.config import settings
from app.db.session import SessionLocal
from app.models import User
from app.services.report_service import generate_report
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.report_generation.generate_daily_reports")
def generate_daily_reports():
    """Generate daily AI reports for all active users (studied today)."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    db = SessionLocal()
    try:
        active_users = (
            db.query(User)
            .filter(User.last_study_date >= today_start)
            .all()
        )
        logger.info(f"Generating daily reports for {len(active_users)} active users")
        for user in active_users:
            try:
                generate_report(user, "daily", db)
                logger.info(f"Daily report generated for user {user.id}")
            except Exception as e:
                logger.error(f"Failed to generate daily report for user {user.id}: {e}")
    finally:
        db.close()
    return f"Generated {len(active_users)} daily reports"


@celery_app.task(name="app.tasks.report_generation.generate_weekly_reports")
def generate_weekly_reports():
    """Generate weekly AI reports for all active users (studied in past 7 days)."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    db = SessionLocal()
    try:
        active_users = (
            db.query(User)
            .filter(User.last_study_date >= week_ago)
            .all()
        )
        logger.info(f"Generating weekly reports for {len(active_users)} active users")
        for user in active_users:
            try:
                generate_report(user, "weekly", db)
                logger.info(f"Weekly report generated for user {user.id}")
            except Exception as e:
                logger.error(f"Failed to generate weekly report for user {user.id}: {e}")
    finally:
        db.close()
    return f"Generated {len(active_users)} weekly reports"
