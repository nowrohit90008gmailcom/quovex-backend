"""Leaderboard router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session as DBSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.db.redis_client import get_redis
from app.models import User
from app.schemas import LeaderboardOut, LeaderboardEntryOut
from app.services.leaderboard_service import get_leaderboard_cached, get_user_rank

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardOut)
async def get_leaderboard(
    track: str = Query("study", enum=["study", "quiz", "overall"]),
    scope: str = Query("global", enum=["friends", "state", "country", "global"]),
    period: str = Query("week", enum=["week", "month", "all_time"]),
    exam_tag: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
    redis=Depends(get_redis),
):
    """Get leaderboard with full filtering options."""
    country = current_user.country if scope == "country" else None
    state = current_user.state if scope == "state" else None

    entries_raw = await get_leaderboard_cached(
        db, redis, track, scope, period,
        exam_tag=exam_tag, country=country, state=state,
        limit=limit, offset=offset,
    )

    entries = [LeaderboardEntryOut(**e) for e in entries_raw]
    user_rank_data = get_user_rank(db, current_user.id, track, scope, period)
    user_rank = LeaderboardEntryOut(**user_rank_data) if user_rank_data else None

    return LeaderboardOut(
        track=track,
        scope=scope,
        period=period,
        entries=entries,
        user_rank=user_rank,
        total=len(entries),
    )
