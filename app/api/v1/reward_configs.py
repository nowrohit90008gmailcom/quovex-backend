"""Reward configuration API — admin CRUD + public read for Flutter."""
import os
import uuid as uuid_lib
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel, Field

from app.core.security import get_current_admin, get_current_superadmin
from app.db.session import get_db
from app.models import RewardConfig, AdminActionLog, LeaderboardTrack

router = APIRouter(prefix="/admin/rewards/config", tags=["reward-config"])


class RewardConfigOut(BaseModel):
    id: UUID
    period_month: str
    track: str
    position_label: str
    reward_name: str
    reward_type: str
    amount_usd: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class RewardConfigUpsertIn(BaseModel):
    period_month: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    track: str
    position_label: str = Field(..., pattern=r"^(rank_1|rank_2|rank_3|top_100|top_1000)$")
    reward_name: str
    reward_type: str = Field(..., pattern=r"^(giftcard|badge|physical_item)$")
    amount_usd: Optional[float] = None
    description: Optional[str] = None
    is_active: bool = True


@router.get("", response_model=List[RewardConfigOut])
async def list_configs(
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    track: Optional[str] = Query(None),
    admin=Depends(get_current_admin),
    db: DBSession = Depends(get_db),
):
    query = db.query(RewardConfig).filter(RewardConfig.period_month == month)
    if track:
        query = query.filter(RewardConfig.track == track)
    return query.order_by(RewardConfig.track, RewardConfig.position_label).all()


@router.put("", response_model=RewardConfigOut)
async def upsert_config(
    body: RewardConfigUpsertIn,
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    existing = db.query(RewardConfig).filter(
        RewardConfig.period_month == body.period_month,
        RewardConfig.track == body.track,
        RewardConfig.position_label == body.position_label,
    ).first()

    if existing:
        for field, value in body.model_dump().items():
            setattr(existing, field, value)
        config = existing
    else:
        config = RewardConfig(**body.model_dump())
        db.add(config)

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="reward_config_upsert",
        target_resource_type="reward_config",
        notes=f"{'Updated' if existing else 'Created'} config for {body.period_month} {body.track} {body.position_label}",
    )
    db.add(log)
    db.commit()
    db.refresh(config)
    return config


@router.post("/{config_id}/upload-image")
async def upload_config_image(
    config_id: UUID,
    file: UploadFile = File(...),
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    config = db.query(RewardConfig).filter(RewardConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    ext = os.path.splitext(file.filename or ".jpg")[1] or ".jpg"
    filename = f"reward_{config_id}_{uuid_lib.uuid4().hex}{ext}"
    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        "uploads", "rewards"
    )
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    config.image_url = f"/uploads/rewards/{filename}"
    db.commit()
    db.refresh(config)
    return {"image_url": config.image_url}


@router.delete("/{config_id}")
async def delete_config(
    config_id: UUID,
    admin=Depends(get_current_superadmin),
    db: DBSession = Depends(get_db),
):
    config = db.query(RewardConfig).filter(RewardConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    log = AdminActionLog(
        admin_id=admin.id,
        action_type="reward_config_delete",
        target_resource_type="reward_config",
        target_resource_id=str(config_id),
        notes=f"Deleted config for {config.period_month} {config.track} {config.position_label}",
    )
    db.add(log)
    db.delete(config)
    db.commit()
    return {"deleted": True}


# ─── Public endpoint (no admin required) ────────────────────────────────────

public_router = APIRouter(prefix="/rewards", tags=["rewards"])


class PublicRewardConfigOut(BaseModel):
    track: str
    rank_1: Optional[RewardConfigOut] = None
    rank_2: Optional[RewardConfigOut] = None
    rank_3: Optional[RewardConfigOut] = None
    top_100: Optional[RewardConfigOut] = None
    top_1000: Optional[RewardConfigOut] = None


@public_router.get("/config", response_model=List[PublicRewardConfigOut])
async def get_current_config(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    db: DBSession = Depends(get_db),
):
    """Public: returns this month's reward config per track. Used by Flutter to show what's at stake."""
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")

    configs = db.query(RewardConfig).filter(
        RewardConfig.period_month == month,
        RewardConfig.is_active == True,
    ).all()

    result = []
    for track in [LeaderboardTrack.study, LeaderboardTrack.quiz, LeaderboardTrack.overall]:
        track_configs = [c for c in configs if c.track == track.value]
        if not track_configs:
            continue
        entry = PublicRewardConfigOut(track=track.value)
        for c in track_configs:
            out = RewardConfigOut.model_validate(c)
            if c.position_label == "rank_1":
                entry.rank_1 = out
            elif c.position_label == "rank_2":
                entry.rank_2 = out
            elif c.position_label == "rank_3":
                entry.rank_3 = out
            elif c.position_label == "top_100":
                entry.top_100 = out
            elif c.position_label == "top_1000":
                entry.top_1000 = out
        result.append(entry)

    return result
