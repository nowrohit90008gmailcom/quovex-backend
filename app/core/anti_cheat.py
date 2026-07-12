"""
Anti-cheat scoring and flagging service.
Server-side checks for suspicious session patterns.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.models import Session as StudySession


def compute_anti_cheat_score(
    db: Session,
    user_id,
    session: StudySession,
    daily_total_minutes: int,
) -> tuple[float, Optional[str]]:
    """
    Compute an anti-cheat risk score (0.0 to 1.0) for a session.

    Returns:
        (score, flag_reason) - score > 0.7 should be flagged
    """
    score = 0.0
    reasons = []

    # 1. Impossible daily hours check
    total_today = daily_total_minutes + (session.verified_minutes or 0)
    max_allowed = settings.MAX_DAILY_HOURS_FLAG * 60
    if total_today > max_allowed:
        score += 0.8
        reasons.append(f"Exceeded {settings.MAX_DAILY_HOURS_FLAG}hr daily limit ({total_today // 60:.1f}hrs)")

    # 2. Too-perfect session (exactly on-hour sessions repeatedly)
    if session.verified_minutes and session.verified_minutes % 60 == 0:
        score += 0.1

    # 3. Session duration too long in one sitting without honor checks
    if session.mode == "online" and session.verified_minutes and session.verified_minutes > 180:
        if session.honor_check_failures == 0:
            # Long online session with no honor check failures is suspicious
            pass  # Actually good, no bonus score
        elif session.honor_check_failures > 3:
            score += 0.3
            reasons.append(f"Multiple honor-check failures ({session.honor_check_failures})")

    # 4. Very short sessions (< 5 min) farmed repeatedly
    if session.verified_minutes and session.verified_minutes < 5:
        recent_short = (
            db.query(func.count(StudySession.id))
            .filter(
                StudySession.user_id == user_id,
                StudySession.verified_minutes < 5,
                StudySession.start_time >= datetime.now(timezone.utc) - timedelta(hours=1),
                StudySession.is_active == False,
            )
            .scalar()
            or 0
        )
        if recent_short > 5:
            score += 0.4
            reasons.append(f"Repeated micro-sessions ({recent_short} in last hour)")

    # Cap at 1.0
    score = min(score, 1.0)
    flag_reason = "; ".join(reasons) if reasons else None

    return score, flag_reason


def should_flag(score: float) -> bool:
    return score >= 0.5
