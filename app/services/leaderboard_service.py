"""
Leaderboard service:
- Rank computation for all tracks/scopes/periods
- Redis caching with TTL
- Snapshot creation
"""
import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

import redis.asyncio as aioredis
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models import (
    User, Session as StudySession, LeaderboardSnapshot,
    LeaderboardTrack, LeaderboardScope, LeaderboardPeriod
)


CACHE_TTL = 300  # 5 minutes


def _cache_key(track: str, scope: str, period: str, exam_tag: Optional[str] = None,
               country: Optional[str] = None, state: Optional[str] = None) -> str:
    parts = ["leaderboard", track, scope, period]
    if exam_tag:
        parts.append(f"tag:{exam_tag}")
    if country:
        parts.append(f"country:{country}")
    if state:
        parts.append(f"state:{state}")
    return ":".join(parts)


def compute_leaderboard(
    db: Session,
    track: LeaderboardTrack,
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    exam_tag: Optional[str] = None,
    country: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """Compute leaderboard rankings from DB."""
    now = datetime.now(timezone.utc)

    # Determine time window
    if period == LeaderboardPeriod.week:
        since = now - timedelta(days=7)
    elif period == LeaderboardPeriod.month:
        since = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        since = datetime(2020, 1, 1, tzinfo=timezone.utc)

    # Build the ranking query based on track
    if track == LeaderboardTrack.study:
        rank_col = func.sum(StudySession.verified_minutes).label("score")
        query = (
            db.query(
                User.id.label("user_id"),
                User.display_name,
                User.avatar_url,
                User.country,
                User.state,
                User.streak_count,
                User.exam_tags,
                rank_col,
            )
            .join(StudySession, StudySession.user_id == User.id)
            .filter(
                StudySession.start_time >= since,
                StudySession.is_active == False,
                StudySession.flagged == False,
            )
        )
    elif track == LeaderboardTrack.quiz:
        # BUG FIX: rank_col was set to func.sum(StudySession.verified_minutes) which was
        # dead code — the actual score column is User.verified_quiz_score selected directly.
        # No StudySession join is needed for quiz track (cumulative score is on the User model).
        query = (
            db.query(
                User.id.label("user_id"),
                User.display_name,
                User.avatar_url,
                User.country,
                User.state,
                User.streak_count,
                User.exam_tags,
                User.verified_quiz_score.label("score"),
            )
        )
    else:
        # Overall: verified_minutes * 1 + verified_quiz_score * 0.5
        query = (
            db.query(
                User.id.label("user_id"),
                User.display_name,
                User.avatar_url,
                User.country,
                User.state,
                User.streak_count,
                User.exam_tags,
                (User.verified_minutes_total + User.verified_quiz_score * 0.5).label("score"),
            )
        )

    # Apply scope filters
    if scope == LeaderboardScope.country and country:
        query = query.filter(User.country == country)
    elif scope == LeaderboardScope.state and state:
        query = query.filter(User.state == state)

    # Apply exam_tag filter
    if exam_tag:
        query = query.filter(User.exam_tags.contains([exam_tag]))

    # For study track, group by user
    if track == LeaderboardTrack.study:
        query = query.group_by(
            User.id, User.display_name, User.avatar_url,
            User.country, User.state, User.streak_count, User.exam_tags
        )

    query = query.filter(User.is_banned == False)
    query = query.order_by(desc("score"))
    query = query.limit(limit).offset(offset)

    results = query.all()

    leaderboard = []
    for i, row in enumerate(results):
        leaderboard.append({
            "rank": offset + i + 1,
            "user_id": str(row.user_id),
            "display_name": row.display_name or "Anonymous",
            "avatar_url": row.avatar_url,
            "country": row.country,
            "state": row.state,
            "streak_count": row.streak_count,
            "score": int(row.score or 0),
        })

    return leaderboard


async def get_leaderboard_cached(
    db: Session,
    redis,
    track: str,
    scope: str,
    period: str,
    exam_tag: Optional[str] = None,
    country: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """Get leaderboard with Redis caching (gracefully falls back to DB)."""
    cache_key = _cache_key(track, scope, period, exam_tag, country, state)

    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                data = json.loads(cached)
                return data[offset:offset + limit]
        except Exception:
            pass

    # Compute from DB
    leaderboard = compute_leaderboard(
        db,
        LeaderboardTrack(track),
        LeaderboardScope(scope) if scope != "global" else LeaderboardScope.global_,
        LeaderboardPeriod(period),
        exam_tag, country, state,
        limit=200,
        offset=0,
    )

    if redis:
        try:
            await redis.setex(cache_key, CACHE_TTL, json.dumps(leaderboard))
        except Exception:
            pass

    return leaderboard[offset:offset + limit]


def get_user_rank(
    db: Session,
    user_id: UUID,
    track: str,
    scope: str,
    period: str,
) -> Optional[Dict[str, Any]]:
    """Get a specific user's current rank position."""
    full_lb = compute_leaderboard(
        db,
        LeaderboardTrack(track),
        LeaderboardScope(scope) if scope != "global" else LeaderboardScope.global_,
        LeaderboardPeriod(period),
        limit=10000,
    )
    for entry in full_lb:
        if entry["user_id"] == str(user_id):
            return entry
    return None
