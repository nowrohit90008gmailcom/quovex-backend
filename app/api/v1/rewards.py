"""Rewards API router — full CRUD for rewards + manual KYC approval."""
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

import os
import uuid as uuid_lib
from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File, Form
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc, func
from pydantic import BaseModel, Field

from app.core.security import get_current_user, get_current_admin, get_current_superadmin
from app.db.session import get_db
from app.models import User, Reward, AdminActionLog, RewardStatus, RewardType, LeaderboardTrack
from app.services.notification_service import send_reward_notification

router = APIRouter(prefix="/rewards", tags=["rewards"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class RewardCreateIn(BaseModel):
    """Admin manually creates a reward for a user."""
    user_id: UUID
    track: LeaderboardTrack
    period_month: str = Field(..., pattern=r"^\d{4}-\d{2}$", example="2024-07")
    tier: str = Field(..., example="top_3")
    rank_at_freeze: int = Field(..., ge=1)
    reward_type: RewardType
    reward_amount_usd: Optional[float] = None
    reward_description: Optional[str] = None


class RewardEditIn(BaseModel):
    """Admin edits an existing reward."""
    tier: Optional[str] = None
    reward_type: Optional[RewardType] = None
    reward_amount_usd: Optional[float] = None
    reward_description: Optional[str] = None
    status: Optional[RewardStatus] = None
    admin_notes: Optional[str] = None


class ManualKYCApprovalIn(BaseModel):
    """Manual KYC decision by superadmin."""
    approved: bool
    notes: Optional[str] = Field(None, max_length=1000)
    # Manual KYC details (collected outside the app for initial days)
    kyc_reference: Optional[str] = Field(None, description="Manual reference ID (e.g., WhatsApp/email thread ID)")


class RewardDetailOut(BaseModel):
    id: UUID
    user_id: UUID
    user_name: Optional[str]
    user_email: Optional[str]
    user_country: Optional[str]
    track: LeaderboardTrack
    period_month: str
    tier: str
    rank_at_freeze: int
    reward_type: RewardType
    reward_amount_usd: Optional[float]
    reward_description: Optional[str]
    status: RewardStatus
    kyc_verified: bool
    kyc_verification_id: Optional[str]
    kyc_full_name: Optional[str] = None
    kyc_phone: Optional[str] = None
    kyc_email: Optional[str] = None
    kyc_student_id_type: Optional[str] = None
    kyc_student_id_number: Optional[str] = None
    kyc_institution_name: Optional[str] = None
    kyc_student_id_image_url: Optional[str] = None
    kyc_notes: Optional[str] = None
    claimed_at: Optional[datetime]
    sent_at: Optional[datetime]
    admin_notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class RewardSummaryOut(BaseModel):
    """Budget summary for dashboard widget."""
    total_rewards_this_month: int
    total_cash_value_usd: float
    pending_count: int
    kyc_review_count: int
    approved_count: int
    sent_count: int
    budget_used_usd: float


# ─── User-facing endpoints ────────────────────────────────────────────────────

@router.get("/my", response_model=List[RewardDetailOut])
async def get_my_rewards(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get the current user's reward history."""
    rewards = (
        db.query(Reward)
        .filter(Reward.user_id == current_user.id)
        .order_by(desc(Reward.created_at))
        .all()
    )
    return [_enrich_reward(r, current_user) for r in rewards]


@router.get("/unclaimed-count")
async def unclaimed_reward_count(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Return count of unclaimed rewards (pending or kyc_review) for badge on mobile app."""
    count = (
        db.query(func.count(Reward.id))
        .filter(
            Reward.user_id == current_user.id,
            Reward.status.in_([RewardStatus.pending, RewardStatus.kyc_review]),
        )
        .scalar()
    )
    return {"count": count or 0}


@router.post("/claim/{reward_id}")
async def claim_reward(
    reward_id: UUID,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """User initiates a reward claim (triggers manual KYC process)."""
    reward = db.query(Reward).filter(
        Reward.id == reward_id,
        Reward.user_id == current_user.id,
    ).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if reward.status != RewardStatus.pending:
        raise HTTPException(status_code=400, detail=f"Reward cannot be claimed (status: {reward.status})")

    # Badge rewards auto-approve; cash/giftcard go to KYC review
    if reward.reward_type == RewardType.badge:
        reward.status = RewardStatus.approved
        reward.kyc_verified = True
        reward.claimed_at = datetime.now(timezone.utc)
    else:
        reward.status = RewardStatus.kyc_review
        reward.claimed_at = datetime.now(timezone.utc)

    db.commit()

    # Send push notification
    if reward.reward_type == RewardType.giftcard:
        send_reward_notification(db, current_user, "kyc_reminder", reward_amount=reward.reward_amount_usd)
    elif reward.reward_type == RewardType.badge:
        send_reward_notification(db, current_user, "reward_created")

    return {
        "reward_id": str(reward_id),
        "status": reward.status,
        "message": (
            "Badge awarded!" if reward.reward_type == RewardType.badge
            else "Reward claimed! Submit your student ID for verification in the app to receive your reward."
        ),
    }


@router.post("/{reward_id}/kyc-submit")
async def submit_kyc(
    reward_id: UUID,
    full_name: str = Form(...),
    phone: str = Form(...),  # WhatsApp number
    email: Optional[str] = Form(None),
    student_id_type: str = Form(...),
    student_id_number: str = Form(...),
    institution_name: str = Form(...),
    notes: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """User submits KYC info + optional student ID photo for a claimed reward."""
    reward = db.query(Reward).filter(
        Reward.id == reward_id,
        Reward.user_id == current_user.id,
    ).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if reward.status != RewardStatus.kyc_review:
        raise HTTPException(
            status_code=400,
            detail=f"KYC can only be submitted for rewards in kyc_review status (current: {reward.status})"
        )

    # Save photo if uploaded
    photo_url = None
    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        filename = f"kyc_{reward_id}_{uuid_lib.uuid4().hex}{ext}"
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "kyc")
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        content = await photo.read()
        with open(filepath, "wb") as f:
            f.write(content)
        photo_url = f"/uploads/kyc/{filename}"

    reward.kyc_full_name = full_name
    reward.kyc_phone = phone
    reward.kyc_email = email or current_user.email
    reward.kyc_student_id_type = student_id_type
    reward.kyc_student_id_number = student_id_number
    reward.kyc_institution_name = institution_name
    reward.kyc_notes = notes
    if photo_url:
        reward.kyc_student_id_image_url = photo_url

    db.commit()
    db.refresh(reward)

    return {
        "reward_id": str(reward_id),
        "status": reward.status,
        "message": "KYC information submitted. Admin will review and contact you on WhatsApp.",
    }


# ─── Admin endpoints ──────────────────────────────────────────────────────────

@router.get("/admin/list", response_model=List[RewardDetailOut])
async def admin_list_rewards(
    status: Optional[str] = Query(None),
    track: Optional[str] = Query(None),
    period_month: Optional[str] = Query(None),
    reward_type: Optional[str] = Query(None),
    search_user: Optional[str] = Query(None, description="Search by user name or email"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    admin=Depends(get_current_admin),
    db: DBSession = Depends(get_db),
):
    """List all rewards with rich filtering for admin dashboard."""
    query = db.query(Reward)

    if status:
        query = query.filter(Reward.status == status)
    if track:
        query = query.filter(Reward.track == track)
    if period_month:
        query = query.filter(Reward.period_month == period_month)
    if reward_type:
        query = query.filter(Reward.reward_type == reward_type)

    rewards = query.order_by(desc(Reward.created_at)).limit(limit).offset(offset).all()

    result = []
    for r in rewards:
        user = db.query(User).filter(User.id == r.user_id).first()
        # Filter by user search
        if search_user and user:
            if search_user.lower() not in (user.display_name or "").lower() \
               and search_user.lower() not in (user.email or "").lower():
                continue
        result.append(_enrich_reward(r, user))
    return result


@router.get("/admin/summary", response_model=RewardSummaryOut)
async def admin_reward_summary(
    period_month: Optional[str] = Query(None),
    admin=Depends(get_current_admin),
    db: DBSession = Depends(get_db),
):
    """Budget summary widget for admin overview."""
    from sqlalchemy import func

    query = db.query(Reward)
    if period_month:
        query = query.filter(Reward.period_month == period_month)

    all_rewards = query.all()

    pending = sum(1 for r in all_rewards if r.status == RewardStatus.pending)
    kyc_review = sum(1 for r in all_rewards if r.status == RewardStatus.kyc_review)
    approved = sum(1 for r in all_rewards if r.status == RewardStatus.approved)
    sent = sum(1 for r in all_rewards if r.status == RewardStatus.sent)
    cash_total = sum(r.reward_amount_usd or 0 for r in all_rewards if r.reward_type == RewardType.giftcard)
    budget_used = sum(
        r.reward_amount_usd or 0
        for r in all_rewards
        if r.reward_type == RewardType.giftcard and r.status == RewardStatus.sent
    )

    return RewardSummaryOut(
        total_rewards_this_month=len(all_rewards),
        total_cash_value_usd=cash_total,
        pending_count=pending,
        kyc_review_count=kyc_review,
        approved_count=approved,
        sent_count=sent,
        budget_used_usd=budget_used,
    )


@router.post("/admin/create", response_model=RewardDetailOut)
async def admin_create_reward(
    body: RewardCreateIn,
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    """Superadmin manually creates a reward for a user (e.g., to handle edge cases)."""
    user = db.query(User).filter(User.id == body.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reward = Reward(
        user_id=body.user_id,
        track=body.track,
        period_month=body.period_month,
        tier=body.tier,
        rank_at_freeze=body.rank_at_freeze,
        reward_type=body.reward_type,
        reward_amount_usd=body.reward_amount_usd,
        reward_description=body.reward_description,
        status=RewardStatus.pending,
    )
    db.add(reward)

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="reward_manual_create",
        target_user_id=body.user_id,
        target_resource_type="reward",
        notes=f"Manual reward: {body.tier} / {body.track} / {body.period_month}",
    )
    db.add(log)
    db.commit()
    db.refresh(reward)

    return _enrich_reward(reward, user)


@router.patch("/admin/{reward_id}/edit", response_model=RewardDetailOut)
async def admin_edit_reward(
    reward_id: UUID,
    body: RewardEditIn,
    admin=Depends(get_current_admin),
    db: DBSession = Depends(get_db),
):
    """Edit a reward's details — tier, type, amount, description, status, notes."""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    # Only superadmin can approve/send (payout actions)
    if body.status in (RewardStatus.approved, RewardStatus.sent):
        if admin.admin_role not in ("superadmin",):
            raise HTTPException(status_code=403, detail="Only superadmin can approve or mark as sent")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reward, field, value)

    if body.status == RewardStatus.sent and not reward.sent_at:
        reward.sent_at = datetime.now(timezone.utc)

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="reward_edit",
        target_user_id=reward.user_id,
        target_resource_type="reward",
        target_resource_id=str(reward_id),
        notes=f"Edited: {list(update_data.keys())}",
        # BUG FIX: column is named action_metadata, not metadata
        action_metadata=update_data,
    )
    db.add(log)
    db.commit()
    db.refresh(reward)

    user = db.query(User).filter(User.id == reward.user_id).first()
    return _enrich_reward(reward, user)


@router.post("/admin/{reward_id}/kyc", response_model=RewardDetailOut)
async def admin_manual_kyc(
    reward_id: UUID,
    body: ManualKYCApprovalIn,
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    """
    Superadmin manually approves or rejects KYC.
    
    For initial days: KYC done offline (WhatsApp, email, etc.).
    Admin enters their reference ID and approves/rejects here.
    """
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if reward.status not in (RewardStatus.kyc_review, RewardStatus.pending):
        raise HTTPException(
            status_code=400,
            detail=f"Reward is not in a KYC-reviewable state (current: {reward.status})"
        )

    now = datetime.now(timezone.utc)

    if body.approved:
        reward.kyc_verified = True
        reward.kyc_verification_id = body.kyc_reference or f"MANUAL-{now.strftime('%Y%m%d%H%M%S')}"
        reward.status = RewardStatus.approved
        notes = f"KYC manually approved by admin. Ref: {reward.kyc_verification_id}. {body.notes or ''}"
    else:
        reward.kyc_verified = False
        reward.status = RewardStatus.rejected
        notes = f"KYC manually rejected by admin. Reason: {body.notes or 'Not specified'}"

    reward.admin_notes = notes

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="kyc_manual_" + ("approve" if body.approved else "reject"),
        target_user_id=reward.user_id,
        target_resource_type="reward",
        target_resource_id=str(reward_id),
        notes=notes,
        # BUG FIX: column is named action_metadata, not metadata
        action_metadata={"kyc_reference": body.kyc_reference, "approved": body.approved},
    )
    db.add(log)
    db.commit()
    db.refresh(reward)

    user = db.query(User).filter(User.id == reward.user_id).first()
    if user and body.approved:
        send_reward_notification(db, user, "kyc_approved", reward_amount=reward.reward_amount_usd)
    return _enrich_reward(reward, user)


@router.post("/admin/{reward_id}/mark-sent", response_model=RewardDetailOut)
async def admin_mark_sent(
    reward_id: UUID,
    notes: Optional[str] = Body(None, embed=True),
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    """Mark a reward as dispatched/sent after KYC approval."""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if reward.status != RewardStatus.approved:
        raise HTTPException(status_code=400, detail="Only approved rewards can be marked as sent")
    if not reward.kyc_verified and reward.reward_type == RewardType.giftcard:
        raise HTTPException(status_code=400, detail="KYC must be verified before sending gift card")

    reward.status = RewardStatus.sent
    reward.sent_at = datetime.now(timezone.utc)
    if notes:
        reward.admin_notes = (reward.admin_notes or "") + f"\nSent: {notes}"

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="reward_mark_sent",
        target_user_id=reward.user_id,
        target_resource_type="reward",
        target_resource_id=str(reward_id),
        notes=notes,
    )
    db.add(log)
    db.commit()
    db.refresh(reward)

    user = db.query(User).filter(User.id == reward.user_id).first()
    if user:
        send_reward_notification(db, user, "reward_sent", reward_amount=reward.reward_amount_usd)
    return _enrich_reward(reward, user)


@router.delete("/admin/{reward_id}")
async def admin_delete_reward(
    reward_id: UUID,
    reason: str = Query(..., min_length=5),
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    """Delete a reward record (superadmin only, with required reason)."""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if reward.status == RewardStatus.sent:
        raise HTTPException(status_code=400, detail="Cannot delete an already-sent reward")

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="reward_delete",
        target_user_id=reward.user_id,
        target_resource_type="reward",
        target_resource_id=str(reward_id),
        notes=reason,
    )
    db.add(log)
    db.delete(reward)
    db.commit()
    return {"deleted": True, "reward_id": str(reward_id)}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _enrich_reward(reward: Reward, user: Optional[User]) -> RewardDetailOut:
    return RewardDetailOut(
        id=reward.id,
        user_id=reward.user_id,
        user_name=user.display_name if user else None,
        user_email=user.email if user else None,
        user_country=user.country if user else None,
        track=reward.track,
        period_month=reward.period_month,
        tier=reward.tier,
        rank_at_freeze=reward.rank_at_freeze,
        reward_type=reward.reward_type,
        reward_amount_usd=reward.reward_amount_usd,
        reward_description=reward.reward_description,
        status=reward.status,
        kyc_verified=reward.kyc_verified,
        kyc_verification_id=reward.kyc_verification_id,
        kyc_full_name=reward.kyc_full_name,
        kyc_phone=reward.kyc_phone,
        kyc_email=reward.kyc_email,
        kyc_student_id_type=reward.kyc_student_id_type,
        kyc_student_id_number=reward.kyc_student_id_number,
        kyc_institution_name=reward.kyc_institution_name,
        kyc_student_id_image_url=reward.kyc_student_id_image_url,
        kyc_notes=reward.kyc_notes,
        claimed_at=reward.claimed_at,
        sent_at=reward.sent_at,
        admin_notes=reward.admin_notes,
        created_at=reward.created_at,
    )
