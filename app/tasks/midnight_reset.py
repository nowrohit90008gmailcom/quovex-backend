"""Midnight social unlock reset task — resets daily unlock bank at local midnight."""
import logging
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models import User
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.midnight_reset.reset_social_unlock")
def reset_social_unlock():
    """Reset social_unlock_minutes_today to 0 for users past their local midnight."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    count = 0
    try:
        users = (
            db.query(User)
            .filter(
                (User.social_unlock_reset_at.is_(None))
                | (User.social_unlock_reset_at < today_start)
            )
            .all()
        )
        for user in users:
            user.social_unlock_minutes_today = 0
            user.social_unlock_reset_at = now
            count += 1
        db.commit()
        logger.info("reset_social_unlock: %d users reset", count)
        return count
    except Exception as exc:
        db.rollback()
        logger.error("reset_social_unlock failed: %s", exc)
        raise
    finally:
        db.close()
