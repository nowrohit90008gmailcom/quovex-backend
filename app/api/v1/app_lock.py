"""App Lock router - manage lock/unlock of installed apps."""
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas import (
    AppLockStatusOut, AppLockUpdateIn,
    AppLockConsumeIn, AppLockConsumeOut,
    AppLockAdUnlockOut, AppLockCreditsOut,
)
from app.config import settings

router = APIRouter(prefix="/app-lock", tags=["app_lock"])


@router.get("/status", response_model=AppLockStatusOut)
async def get_app_lock_status(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current app lock status: enabled, credits, locked apps."""
    return AppLockStatusOut(
        enabled=current_user.app_lock_enabled,
        credits=current_user.app_lock_credits,
        locked_apps=current_user.locked_app_packages or [],
    )


@router.put("/update", response_model=AppLockStatusOut)
async def update_app_lock(
    body: AppLockUpdateIn,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Enable/disable app lock and/or update the locked apps list."""
    if body.enabled is not None:
        current_user.app_lock_enabled = body.enabled
    if body.locked_app_packages is not None:
        current_user.locked_app_packages = body.locked_app_packages
    db.commit()
    db.refresh(current_user)
    return AppLockStatusOut(
        enabled=current_user.app_lock_enabled,
        credits=current_user.app_lock_credits,
        locked_apps=current_user.locked_app_packages or [],
    )


@router.post("/consume", response_model=AppLockConsumeOut)
async def consume_app_lock_credits(
    body: AppLockConsumeIn,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Consume app lock credits after an unlock window expires."""
    if current_user.app_lock_credits <= 0:
        raise HTTPException(status_code=400, detail="No credits remaining")
    to_consume = min(body.credits_used, current_user.app_lock_credits)
    current_user.app_lock_credits -= to_consume
    db.commit()
    db.refresh(current_user)
    return AppLockConsumeOut(
        remaining_credits=current_user.app_lock_credits,
        message=f"Consumed {to_consume} credits",
    )


@router.post("/ad-unlock", response_model=AppLockAdUnlockOut)
async def app_lock_ad_unlock(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Watch an ad to earn app unlock credits (max 2/hour)."""
    now = datetime.now(timezone.utc)

    # Reset ad count if a new hour has started
    if current_user.last_ad_unlock_at is not None:
        hour_ago = now - timedelta(hours=1)
        if current_user.last_ad_unlock_at < hour_ago:
            current_user.ad_unlock_count_today = 0

    if current_user.ad_unlock_count_today >= settings.APP_LOCK_MAX_AD_UNLOCKS_PER_HOUR:
        return AppLockAdUnlockOut(
            credits_added=0,
            total_credits=current_user.app_lock_credits,
            success=False,
            message="Ad unlock limit reached (max 2/hour)",
        )

    credits_before = current_user.app_lock_credits
    current_user.app_lock_credits = min(
        current_user.app_lock_credits + settings.APP_LOCK_AD_UNLOCK_MINUTES,
        settings.APP_LOCK_MAX_CREDITS,
    )
    current_user.last_ad_unlock_at = now
    current_user.ad_unlock_count_today += 1
    db.commit()
    db.refresh(current_user)
    return AppLockAdUnlockOut(
        credits_added=current_user.app_lock_credits - credits_before,
        total_credits=current_user.app_lock_credits,
        success=True,
        message="5 unlock credits added!",
    )


@router.get("/credits", response_model=AppLockCreditsOut)
async def get_app_lock_credits(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current app lock credit balance."""
    return AppLockCreditsOut(
        credits=current_user.app_lock_credits,
        max_credits=settings.APP_LOCK_MAX_CREDITS,
        message=f"{current_user.app_lock_credits} / {settings.APP_LOCK_MAX_CREDITS} unlock credits available",
    )
