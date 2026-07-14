"""Notification service - FCM v1 push dispatch via Firebase Admin SDK."""
import logging
import os
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

import firebase_admin
from firebase_admin import messaging
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.models import NotificationLog, User

logger = logging.getLogger(__name__)

from app.config import settings as app_config
MAX_DAILY_PUSHES = app_config.NOTIFICATION_MAX_DAILY_PUSHES


def _get_firebase_app():
    if not firebase_admin._apps:
        firebase_json = settings.FIREBASE_SERVICE_ACCOUNT_JSON
        if firebase_json and firebase_json.strip():
            import json as _json
            cred = firebase_admin.credentials.Certificate(_json.loads(firebase_json))
            firebase_admin.initialize_app(cred)
        elif os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = firebase_admin.credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        elif settings.FIREBASE_PROJECT_ID:
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        else:
            return None
    return firebase_admin.get_app()


def _get_pref_key(trigger_reason: str, notification_type: str):
    """Map a notification to its notification_prefs key, or None if always-allowed (broadcasts)."""
    if notification_type == "admin_broadcast":
        return None
    if trigger_reason.startswith("streak_risk"):
        return "streak_reminder"
    if trigger_reason.startswith("rank_change"):
        return "rank_change"
    if trigger_reason.startswith("badge_"):
        return "badge_unlock"
    if trigger_reason in ("reward_created", "kyc_reminder", "kyc_approved", "reward_sent"):
        return "reward_announcement"
    if trigger_reason in ("daily_reminder", "daily_target_met", "daily_report_ready", "weekly_report_ready"):
        return "daily_recap"
    if trigger_reason == "accuracy_drop" or trigger_reason.startswith("weak_subject"):
        return "weak_subject_nudge"
    return None


def _get_daily_send_count(db: Session, user_id: UUID) -> int:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    count = (
        db.query(func.count(NotificationLog.id))
        .filter(
            NotificationLog.user_id == user_id,
            NotificationLog.sent_at >= today_start,
        )
        .scalar()
    )
    return count or 0


def send_notification(
    db: Session,
    user: User,
    title: str,
    body: str,
    trigger_reason: str,
    notification_type: str = "event",
) -> bool:
    """Send a push notification via FCM v1 and log it. Returns True if sent."""
    app = _get_firebase_app()
    if app is None:
        logger.warning("Firebase not configured; notification logged but not sent")
        _log_notification(db, user, title, body, trigger_reason, notification_type, success=False)
        return False

    daily_count = _get_daily_send_count(db, user.id)
    if daily_count >= MAX_DAILY_PUSHES:
        logger.info(f"User {user.id} hit daily push cap ({MAX_DAILY_PUSHES}); skipping")
        return False

    pref_key = _get_pref_key(trigger_reason, notification_type)
    if pref_key and user.notification_prefs:
        if not user.notification_prefs.get(pref_key, True):
            logger.info(f"User {user.id} disabled {pref_key} notifications; skipping")
            return False

    if not user.fcm_token:
        logger.info(f"User {user.id} has no FCM token; logging without send")
        _log_notification(db, user, title, body, trigger_reason, notification_type, success=False)
        return False

    try:
        message = messaging.Message(
            token=user.fcm_token,
            notification=messaging.Notification(title=title, body=body),
            data={"trigger_reason": trigger_reason, "type": notification_type},
        )
        messaging.send(message, app=app)
        success = True
    except Exception as e:
        logger.error(f"FCM v1 send failed for user {user.id}: {e}")
        success = False

    _log_notification(db, user, title, body, trigger_reason, notification_type, success)
    return success


def _log_notification(db, user, title, body, trigger_reason, notification_type, success):
    log = NotificationLog(
        user_id=user.id,
        notification_type=notification_type,
        trigger_reason=trigger_reason,
        title=title,
        body=body,
        success=success,
    )
    db.add(log)
    db.commit()


def send_streak_risk_alert(db: Session, user: User, streak_count: int) -> bool:
    urgency = "high" if streak_count >= 30 else ("medium" if streak_count >= 7 else "low")
    messages = {
        "high": f"Don't lose your {streak_count}-day streak! Start a session now to keep it alive.",
        "medium": f"Your {streak_count}-day streak is at risk. Hit a session today to maintain momentum.",
        "low": f"You're on a {streak_count}-day streak! Keep it going with a study session today.",
    }
    return send_notification(
        db, user,
        title="Streak at Risk",
        body=messages.get(urgency, messages["low"]),
        trigger_reason=f"streak_risk_{urgency}",
        notification_type="scheduled",
    )


def send_study_reminder(db: Session, user: User) -> bool:
    return send_notification(
        db, user,
        title="Time to Study",
        body="You haven't started a session yet today. Your competitors are already studying!",
        trigger_reason="daily_reminder",
        notification_type="scheduled",
    )


def send_badge_unlocked(db: Session, user: User, badge_name: str) -> bool:
    return send_notification(
        db, user,
        title="New Badge Unlocked",
        body=f"Congratulations! You've earned the '{badge_name}' badge.",
        trigger_reason=f"badge_{badge_name}",
        notification_type="event",
    )


def send_reward_notification(db: Session, user: User, event_type: str, reward_amount: Optional[float] = None, rank: Optional[int] = None, track: Optional[str] = None) -> bool:
    """Send push notification for reward lifecycle events."""
    messages = {
        "reward_created": {
            "title": "Reward Earned!",
            "body": f"You ranked #{rank} in {track}! Claim your ${reward_amount:.0f} reward now." if reward_amount else f"You ranked #{rank} in {track}! Check your rewards.",
        },
        "kyc_reminder": {
            "title": "Verify Your Identity",
            "body": f"Submit your student ID to receive your ${reward_amount:.0f} reward. Go to Rewards in the app to verify." if reward_amount else "Submit your student ID to receive your reward. Go to Rewards in the app to verify.",
        },
        "kyc_approved": {
            "title": "Identity Verified",
            "body": "Your identity has been verified! Your reward will be sent to you soon.",
        },
        "reward_sent": {
            "title": "Reward Dispatched",
            "body": f"Your ${reward_amount:.0f} reward has been sent!" if reward_amount else "Your reward has been dispatched!",
        },
    }
    info = messages.get(event_type, messages["reward_created"])
    return send_notification(
        db, user,
        title=info["title"],
        body=info["body"],
        trigger_reason=event_type,
        notification_type="event",
    )


def send_rank_change(db: Session, user: User, old_rank: int, new_rank: int, track: str) -> bool:
    direction = "up" if new_rank < old_rank else "down"
    verb = "climbed" if direction == "up" else "dropped"
    return send_notification(
        db, user,
        title=f"Rank Change on {track.title()} Leaderboard",
        body=f"You've {verb} from #{old_rank} to #{new_rank}. Keep going!",
        trigger_reason=f"rank_change_{direction}_{track}",
        notification_type="event",
    )


def broadcast_notification(
    db: Session,
    title: str,
    body: str,
    notification_type: str = "admin_broadcast",
    trigger_reason: str = "admin_broadcast",
    segment_filter: Optional[str] = None,
) -> dict:
    """Send a push notification to all users (optionally filtered). Returns send stats.

    segment_filter can be:
      - None / "" → send to all users with FCM tokens
      - "active_today"  → users with a session today
      - "streak_risk"   → users with streak >= 7
      - A JSON string dict with keys: country, exam_tag, streak_min, inactive_days
        e.g. '{"country": "IN", "streak_min": 7}'
    """
    import json as _json
    from datetime import timedelta

    query = db.query(User).filter(User.fcm_token.isnot(None))

    if segment_filter:
        # BUG FIX: admin.py passes json.dumps(seg_filter) as segment_filter, but
        # the old code only compared against plain-string shorthands like "active_today".
        # A JSON dict like '{"country": "IN"}' never matched, so segmenting never worked.
        # Now we handle both plain shorthands AND JSON dicts.
        seg_dict: dict = {}
        try:
            parsed = _json.loads(segment_filter)
            if isinstance(parsed, dict):
                seg_dict = parsed
            # If it parsed as a non-dict (e.g. a plain quoted string), fall through
        except (_json.JSONDecodeError, TypeError):
            pass

        if seg_dict:
            # Apply structured filters from JSON dict
            if seg_dict.get("country"):
                query = query.filter(User.country == seg_dict["country"])
            if seg_dict.get("exam_tag"):
                query = query.filter(User.exam_tags.contains([seg_dict["exam_tag"]]))
            if seg_dict.get("streak_min"):
                query = query.filter(User.streak_count >= int(seg_dict["streak_min"]))
            if seg_dict.get("inactive_days"):
                cutoff = datetime.now(timezone.utc) - timedelta(days=int(seg_dict["inactive_days"]))
                query = query.filter(
                    (User.last_active == None) | (User.last_active < cutoff)
                )
        elif segment_filter == "active_today":
            from app.models import Session as StudySession
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            active_ids = (
                db.query(StudySession.user_id)
                .filter(StudySession.start_time >= today_start)
                .distinct()
                .subquery()
            )
            query = query.filter(User.id.in_(active_ids))
        elif segment_filter == "streak_risk":
            query = query.filter(User.streak_count >= 7)

    users = query.all()
    sent, skipped = 0, 0
    for user in users:
        ok = send_notification(db, user, title, body, trigger_reason, notification_type)
        if ok:
            sent += 1
        else:
            skipped += 1

    return {"sent": sent, "skipped": skipped, "total_targeted": len(users)}

