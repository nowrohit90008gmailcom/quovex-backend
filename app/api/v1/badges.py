"""Badges API router — list earned badges."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import User, Badge
from app.schemas import BadgeOut

router = APIRouter(prefix="/badges", tags=["badges"])


@router.get("/my", response_model=List[BadgeOut])
async def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get all badges earned by the current user."""
    badges = (
        db.query(Badge)
        .filter(Badge.user_id == current_user.id)
        .order_by(Badge.earned_at.desc())
        .all()
    )
    return [BadgeOut(badge_code=b.badge_code, earned_at=b.earned_at) for b in badges]
