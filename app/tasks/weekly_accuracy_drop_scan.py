"""Weekly accuracy drop scan — detects significant rolling-accuracy declines.

This is a **placeholder** for a future feature. Currently it only logs
notification entries without dispatching any push.
"""
import logging
from collections import defaultdict
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models import (
    UserSubjectProficiency,
    NotificationLog,
    NotificationType,
)
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

DROP_THRESHOLD = 0.15  # 15 percentage points on a 0-1 scale


@celery_app.task(
    name="app.tasks.weekly_accuracy_drop_scan.check_accuracy_drops"
)
def check_accuracy_drops():
    """Log notification entries for users whose accuracy has dropped >15 pts."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    logged_count = 0
    try:
        records = (
            db.query(UserSubjectProficiency)
            .order_by(
                UserSubjectProficiency.user_id,
                UserSubjectProficiency.subject,
                UserSubjectProficiency.updated_at.desc(),
            )
            .all()
        )
        groups = defaultdict(list)
        for r in records:
            key = (r.user_id, r.subject)
            groups[key].append(r)

        for (user_id, subject), entries in groups.items():
            if len(entries) < 2:
                continue
            latest = entries[0]
            previous = entries[1]
            drop = previous.rolling_accuracy_score - latest.rolling_accuracy_score
            if drop > DROP_THRESHOLD:
                log = NotificationLog(
                    user_id=user_id,
                    notification_type=NotificationType.scheduled,
                    trigger_reason="accuracy_drop_placeholder",
                    title="Accuracy Drop Detected (Preview)",
                    body=(
                        f"Your {subject} accuracy dropped "
                        f"by {drop * 100:.0f} points. "
                        f"(Historical avg: {previous.rolling_accuracy_score * 100:.0f}%, "
                        f"Latest: {latest.rolling_accuracy_score * 100:.0f}%)"
                    ),
                )
                db.add(log)
                logged_count += 1

        db.commit()
        logger.info(
            "check_accuracy_drops: %d drops logged (placeholder)", logged_count
        )
        return logged_count
    except Exception as exc:
        db.rollback()
        logger.error("check_accuracy_drops failed: %s", exc)
        raise
    finally:
        db.close()
