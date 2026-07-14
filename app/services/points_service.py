"""
Points calculation service:
- Base rate per verified hour
- Diminishing returns after 6-8 hrs/day
- Ad-doubling logic (capped, tracked separately from verified points)
"""
import math
from datetime import datetime, timezone
from typing import Tuple

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Session as StudySession, User


def calculate_points(verified_minutes: int, daily_verified_minutes_so_far: int) -> int:
    """
    Calculate points for a session.
    
    Args:
        verified_minutes: Minutes verified in this session
        daily_verified_minutes_so_far: Total verified minutes already earned today
    
    Returns:
        Base points (before any ad doubling)
    """
    base_rate = settings.BASE_POINTS_PER_HOUR  # points per hour = 100
    diminish_after = settings.DIMINISHING_RETURNS_AFTER_HOURS * 60  # 360 minutes

    total_points = 0
    remaining = verified_minutes
    accumulated = daily_verified_minutes_so_far

    while remaining > 0:
        chunk = min(remaining, 1)  # process minute by minute
        minute_index = accumulated

        if minute_index < diminish_after:
            # Full rate
            rate = base_rate / 60
        else:
            # Diminishing returns: exponential decay after threshold
            over = minute_index - diminish_after
            decay_factor = math.exp(-over / settings.POINTS_DECAY_HALF_LIFE_MINUTES)
            rate = (base_rate / 60) * max(settings.POINTS_MIN_DECAY_FACTOR, decay_factor)

        total_points += rate * chunk
        accumulated += chunk
        remaining -= chunk

    return max(1, round(total_points))


def apply_ad_double(user: User, session: StudySession, db: Session) -> Tuple[int, bool]:
    """
    Apply ad doubling to a session's points.
    
    Returns:
        (new_total_points, success: bool)
    """
    now = datetime.now(timezone.utc)

    # Reset daily counter if it's a new day
    if user.ad_doubles_reset_at is None or user.ad_doubles_reset_at.date() < now.date():
        user.ad_doubles_used_today = 0
        user.ad_doubles_reset_at = now

    MAX_DAILY_DOUBLES = settings.MAX_DAILY_AD_DOUBLES
    if user.ad_doubles_used_today >= MAX_DAILY_DOUBLES:
        return session.points_awarded, False

    if session.ad_doubled:
        return session.points_awarded, False

    doubled = session.points_base * 2
    session.points_awarded = doubled
    session.ad_doubled = True
    session.ad_double_count += 1

    user.ad_doubles_used_today += 1
    user.points_total += (doubled - session.points_base)  # add the difference

    db.commit()
    return doubled, True


def get_daily_verified_minutes(user_id, db: Session) -> int:
    """Get total verified minutes for a user today (UTC)."""
    from sqlalchemy import func
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    result = (
        db.query(func.sum(StudySession.verified_minutes))
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= today_start,
            StudySession.is_active == False,
            StudySession.flagged == False,
        )
        .scalar()
    )
    return result or 0
