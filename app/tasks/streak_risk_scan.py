"""Daily streak risk scan — alerts users with active streaks who haven't studied yet today."""
import logging
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models import User, Session as StudySession
from app.services.notification_service import send_streak_risk_alert
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.streak_risk_scan.check_streak_risks")
def check_streak_risks():
    """Send streak risk alerts to users with streaks who haven't started a session today."""
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
        at_risk = (
            db.query(User)
            .filter(
                User.streak_count > 0,
                User.is_banned.is_(False),
                ~User.id.in_(users_with_session_today),
            )
            .all()
        )
        for user in at_risk:
            try:
                send_streak_risk_alert(db, user, user.streak_count)
                sent += 1
            except Exception as exc:
                logger.warning(
                    "Failed to send streak alert to user %s: %s",
                    user.id,
                    exc,
                )
        logger.info("check_streak_risks: %d alerts sent", sent)
        return sent
    except Exception as exc:
        logger.error("check_streak_risks failed: %s", exc)
        raise
    finally:
        db.close()
