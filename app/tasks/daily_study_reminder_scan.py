"""Daily study reminder scan — sends reminders to users who haven't studied today."""
import logging
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models import User, Session as StudySession
from app.services.notification_service import send_study_reminder
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.daily_study_reminder_scan.send_study_reminders")
def send_study_reminders():
    """Send study reminders to users with no session started today."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    sent = 0
    try:
        users_with_session_today = (
            db.query(StudySession.user_id)
            .filter(StudySession.start_time >= today_start)
            .distinct()
            .subquery()
        )
        users = (
            db.query(User)
            .filter(
                User.is_banned.is_(False),
                ~User.id.in_(users_with_session_today),
            )
            .all()
        )
        for user in users:
            try:
                send_study_reminder(db, user)
                sent += 1
            except Exception as exc:
                logger.warning(
                    "Failed to send reminder to user %s: %s",
                    user.id,
                    exc,
                )
        logger.info("send_study_reminders: %d reminders sent", sent)
        return sent
    except Exception as exc:
        logger.error("send_study_reminders failed: %s", exc)
        raise
    finally:
        db.close()
