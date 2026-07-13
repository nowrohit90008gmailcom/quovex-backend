"""Referral router — referral codes, stats, and bonus claims."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.core.security import get_current_user, _ensure_referral_code
from app.db.session import get_db
from app.models import User
from app.schemas import (
    ReferralStatsOut, ReferralClaimOut, ReferralClaimIn, ReferralGenerateOut,
)

router = APIRouter(prefix="/referral", tags=["referral"])

REFERRAL_BONUS_SIGNUP = 100
REFERRAL_BONUS_FIRST_SESSION = 50


@router.get("/stats", response_model=ReferralStatsOut)
async def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get the current user's referral stats."""
    _ensure_referral_code(current_user, db)
    referred_users = (
        db.query(User)
        .filter(User.referred_by_id == current_user.id)
        .all()
    )
    total = len(referred_users)
    pending = sum(1 for u in referred_users if not u.first_session_completed)
    return ReferralStatsOut(
        referral_code=current_user.referral_code or "",
        total_referred=total,
        bonus_points_earned=current_user.referral_bonus_earned,
        pending_referrals=pending,
    )


@router.post("/claim", response_model=ReferralClaimOut)
async def claim_referral_bonus(
    body: ReferralClaimIn,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Claim referral bonus when a referred user completes their first session."""
    referred = db.query(User).filter(User.id == body.referred_user_id).first()
    if not referred:
        raise HTTPException(status_code=404, detail="Referred user not found")
    if referred.referred_by_id != current_user.id:
        raise HTTPException(status_code=400, detail="This user was not referred by you")
    if not referred.first_session_completed:
        raise HTTPException(status_code=400, detail="User has not completed their first session yet")
    if referred.referral_bonus_paid:
        raise HTTPException(status_code=400, detail="Referral bonus already claimed for this user")

    current_user.referral_bonus_earned += REFERRAL_BONUS_FIRST_SESSION
    current_user.points_total += REFERRAL_BONUS_FIRST_SESSION
    referred.referral_bonus_paid = True
    db.commit()
    db.refresh(current_user)
    return ReferralClaimOut(
        points_awarded=REFERRAL_BONUS_FIRST_SESSION,
        total_bonus=current_user.referral_bonus_earned,
        message=f"You earned {REFERRAL_BONUS_FIRST_SESSION} bonus points!",
    )


@router.get("/generate-code", response_model=ReferralGenerateOut)
async def generate_referral_code(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Ensure the user has a referral code, generating one if needed."""
    code = _ensure_referral_code(current_user, db)
    return ReferralGenerateOut(referral_code=code)
