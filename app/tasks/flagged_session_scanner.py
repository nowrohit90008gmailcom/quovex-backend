"""Daily flagged session scanner — flags suspicious study sessions."""
import logging
from datetime import datetime, timezone, timedelta

from app.db.session import SessionLocal
from app.models import Session as StudySession
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

MAX_RAW_MINUTES = 720
MAX_ACTIVE_HOURS = 12
RAW_VERIFIED_RATIO_THRESHOLD = 2.0


@celery_app.task(name="app.tasks.flagged_session_scanner.scan_flagged_sessions")
def scan_flagged_sessions():
    """Flag sessions that exceed daily limits or have abnormal raw/verified ratios."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=MAX_ACTIVE_HOURS)
    flagged_count = 0
    try:
        sessions = (
            db.query(StudySession)
            .filter(
                StudySession.flagged.is_(False),
                (
                    (StudySession.is_active.is_(True))
                    & (StudySession.start_time < cutoff)
                )
                | (StudySession.raw_minutes > MAX_RAW_MINUTES),
            )
            .all()
        )
        for s in sessions:
            s.flagged = True
            s.flag_reason = "auto:excessive_daily_hours"
            flagged_count += 1

        abnormal = (
            db.query(StudySession)
            .filter(
                StudySession.flagged.is_(False),
                StudySession.raw_minutes > 0,
                StudySession.raw_minutes
                / StudySession.verified_minutes
                >= RAW_VERIFIED_RATIO_THRESHOLD,
            )
            .all()
        )
        for s in abnormal:
            s.flagged = True
            s.flag_reason = (
                f"auto:abnormal_raw_verified_ratio"
                f" ({s.raw_minutes}/{s.verified_minutes})"
            )
            flagged_count += 1

        db.commit()
        logger.info(
            "scan_flagged_sessions: %d newly flagged", flagged_count
        )
        return flagged_count
    except Exception as exc:
        db.rollback()
        logger.error("scan_flagged_sessions failed: %s", exc)
        raise
    finally:
        db.close()
