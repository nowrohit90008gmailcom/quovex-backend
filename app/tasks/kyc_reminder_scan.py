"""KYC reminder scan — sends push to users who haven't submitted KYC after claiming."""
import logging
from datetime import datetime, timezone, timedelta

from app.tasks.celery_app import celery_app
from app.db.session import SessionLocal
from app.models import Reward, RewardStatus, User, NotificationLog
from app.services.notification_service import send_reward_notification

logger = logging.getLogger(__name__)

MAX_REMINDERS_PER_REWARD = 3


@celery_app.task(name="app.tasks.kyc_reminder_scan.kyc_reminder_scan")
def kyc_reminder_scan():
    """Send KYC reminder push for rewards in kyc_review >24h with no KYC data submitted."""
    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        pending_kyc = (
            db.query(Reward)
            .filter(
                Reward.status == RewardStatus.kyc_review,
                Reward.claimed_at <= cutoff,
            )
            .all()
        )

        for reward in pending_kyc:
            if reward.kyc_full_name or reward.kyc_phone or reward.kyc_student_id_number:
                continue  # User already submitted KYC data

            user = db.query(User).filter(User.id == reward.user_id).first()
            if not user:
                continue

            existing_count = (
                db.query(NotificationLog)
                .filter(
                    NotificationLog.user_id == reward.user_id,
                    NotificationLog.trigger_reason == "kyc_reminder",
                    NotificationLog.sent_at >= reward.claimed_at,
                )
                .count()
            )
            if existing_count >= MAX_REMINDERS_PER_REWARD:
                continue

            send_reward_notification(db, user, "kyc_reminder", reward_amount=reward.reward_amount_usd)

        logger.info(f"KYC reminder scan completed: {len(pending_kyc)} rewards in kyc_review")
    finally:
        db.close()
