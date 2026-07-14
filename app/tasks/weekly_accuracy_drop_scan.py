"""Weekly accuracy drop scan — detects significant rolling-accuracy declines."""
import logging
from collections import defaultdict
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models import (
    User,
    UserSubjectProficiency,
)
from app.services.notification_service import send_notification
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

DROP_THRESHOLD = 0.15  # 15 percentage points on a 0-1 scale


@celery_app.task(
    name="app.tasks.weekly_accuracy_drop_scan.check_accuracy_drops"
)
def check_accuracy_drops():
    """Send push notifications to users whose rolling accuracy dropped >15 pts."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    sent_count = 0
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
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    continue
                ok = send_notification(
                    db, user,
                    title=f"Accuracy Alert: {subject}",
                    body=(
                        f"Your {subject} accuracy dropped "
                        f"by {drop * 100:.0f} points. "
                        f"(Was {previous.rolling_accuracy_score * 100:.0f}%, "
                        f"now {latest.rolling_accuracy_score * 100:.0f}%)"
                    ),
                    trigger_reason="accuracy_drop",
                    notification_type="scheduled",
                )
                if ok:
                    sent_count += 1

        logger.info(
            "check_accuracy_drops: %d accuracy-drop notifications sent", sent_count
        )
        return sent_count
    except Exception as exc:
        logger.error("check_accuracy_drops failed: %s", exc)
        raise
    finally:
        db.close()
