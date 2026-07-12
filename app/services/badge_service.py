"""Badge service — checks and awards achievement badges on session end."""
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session as DBSession

from app.models import User, Badge
from app.schemas import BadgeOut

logger = logging.getLogger(__name__)

BADGE_DEFINITIONS = {
    # Milestone badges (cumulative verified minutes)
    "milestone_100":  {"label": "100 Hours Studied",   "threshold_field": "verified_minutes_total", "threshold": 6000},
    "milestone_500":  {"label": "500 Hours Studied",   "threshold_field": "verified_minutes_total", "threshold": 30000},
    "milestone_1000": {"label": "1000 Hours Studied",  "threshold_field": "verified_minutes_total", "threshold": 60000},
    # Streak badges
    "streak_7":       {"label": "7-Day Streak",        "threshold_field": "streak_count", "threshold": 7},
    "streak_30":      {"label": "30-Day Streak",       "threshold_field": "streak_count", "threshold": 30},
    "streak_100":     {"label": "100-Day Streak",      "threshold_field": "streak_count", "threshold": 100},
    # Quiz badges (checked separately)
    "quiz_accuracy":        {"label": "Quiz Accuracy Master",     "threshold_field": None, "threshold": 0},
    "quiz_subject_master":  {"label": "Subject Master",          "threshold_field": None, "threshold": 0},
}


def _has_badge(db: DBSession, user_id, badge_code: str) -> bool:
    return db.query(Badge).filter(
        Badge.user_id == user_id,
        Badge.badge_code == badge_code,
    ).first() is not None


def _award_badge(db: DBSession, user_id, badge_code: str) -> Badge:
    badge = Badge(user_id=user_id, badge_code=badge_code)
    db.add(badge)
    db.flush()
    return badge


def check_and_award_badges(user: User, db: DBSession) -> list[BadgeOut]:
    """Check if user has earned any new badges. Returns newly awarded badges."""
    new_badges: list[Badge] = []

    # Milestone and streak badges — based on user fields
    for code, definition in BADGE_DEFINITIONS.items():
        if definition["threshold_field"] is None:
            continue  # quiz badges handled separately
        if _has_badge(db, user.id, code):
            continue
        current_value = getattr(user, definition["threshold_field"], 0)
        if current_value >= definition["threshold"]:
            badge = _award_badge(db, user.id, code)
            new_badges.append(badge)
            logger.info(f"User {user.id} earned badge '{code}'")

    # Quiz accuracy badge — check rolling accuracy across all subjects
    if not _has_badge(db, user.id, "quiz_accuracy"):
        total_correct = sum(
            sp.total_correct for sp in user.subject_proficiencies
        )
        total_answered = sum(
            sp.total_questions_answered for sp in user.subject_proficiencies
        )
        if total_answered >= 20 and (total_correct / total_answered) >= 0.90:
            badge = _award_badge(db, user.id, "quiz_accuracy")
            new_badges.append(badge)
            logger.info(f"User {user.id} earned badge 'quiz_accuracy'")

    # Subject master badge — ≥90% accuracy in any single subject with ≥20 answers
    if not _has_badge(db, user.id, "quiz_subject_master"):
        for sp in user.subject_proficiencies:
            if sp.total_questions_answered >= 20 and (sp.total_correct / sp.total_questions_answered) >= 0.90:
                badge = _award_badge(db, user.id, "quiz_subject_master")
                new_badges.append(badge)
                logger.info(f"User {user.id} earned badge 'quiz_subject_master'")
                break

    if new_badges:
        db.commit()
        for b in new_badges:
            db.refresh(b)

    return [BadgeOut(badge_code=b.badge_code, earned_at=b.earned_at) for b in new_badges]
