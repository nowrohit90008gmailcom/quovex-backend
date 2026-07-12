"""Reward service - tier assignment, budget tracking, reward lifecycle."""
from datetime import datetime, timezone
from typing import Optional, List, Dict
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.models import (
    User, Reward, LeaderboardSnapshot, AdminActionLog, Badge, AdminSetting,
    RewardStatus, RewardType, LeaderboardTrack,
)
from app.services.notification_service import send_badge_unlocked


BADGE_TIERS = {
    "top_100": {"rank_max": 100, "type": RewardType.badge, "amount_usd": 0, "description": "Top 100 — Badge"},
    "top_1000": {"rank_max": 1000, "type": RewardType.badge, "amount_usd": 0, "description": "Top 1000 — Badge"},
}


def _load_rank_amounts(db: Session) -> Dict[int, float]:
    settings = {row.key: row.value for row in db.query(AdminSetting).all()}
    return {
        1: float(settings.get("reward_rank_1_usd", "100")),
        2: float(settings.get("reward_rank_2_usd", "75")),
        3: float(settings.get("reward_rank_3_usd", "50")),
    }


def freeze_leaderboard_and_create_rewards(
    db: Session,
    period_month: str,
) -> dict:
    """
    Freeze all leaderboard tracks and create rewards for top performers.
    Returns summary of created rewards per track.
    """
    summary = {}
    rank_amounts = _load_rank_amounts(db)

    for track in [LeaderboardTrack.study, LeaderboardTrack.quiz, LeaderboardTrack.overall]:
        track_name = track.value
        snapshots = (
            db.query(LeaderboardSnapshot)
            .filter(
                LeaderboardSnapshot.track == track_name,
                LeaderboardSnapshot.period == "month",
                LeaderboardSnapshot.is_frozen == False,
            )
            .order_by(LeaderboardSnapshot.rank)
            .all()
        )

        created = 0
        for snap in snapshots:
            existing = db.query(Reward).filter(
                Reward.user_id == snap.user_id,
                Reward.track == track_name,
                Reward.period_month == period_month,
            ).first()
            if existing:
                continue

            rank = snap.rank
            reward_type = None
            amount = None
            description = None

            if rank <= 3:
                tier_name = "top_3"
                reward_type = RewardType.giftcard
                amount = rank_amounts.get(rank, 50)
                description = f"Rank {rank} — ${amount:.0f} Gift Card"
            else:
                for tier_name, cfg in BADGE_TIERS.items():
                    if rank <= cfg["rank_max"]:
                        reward_type = cfg["type"]
                        amount = cfg["amount_usd"]
                        description = cfg["description"]
                        break

            if not reward_type:
                continue

            reward = Reward(
                user_id=snap.user_id,
                track=track_name,
                period_month=period_month,
                tier=tier_name,
                rank_at_freeze=rank,
                reward_type=reward_type,
                reward_amount_usd=amount,
                reward_description=description,
                status=RewardStatus.pending,
            )
            db.add(reward)

            # Award corresponding badge
            badge_code = _badge_code_for_rank(track_name, rank)
            if badge_code:
                existing_badge = db.query(Badge).filter(
                    Badge.user_id == snap.user_id,
                    Badge.badge_code == badge_code,
                ).first()
                if not existing_badge:
                    db.add(Badge(user_id=snap.user_id, badge_code=badge_code))
                    badge_user = db.query(User).filter(User.id == snap.user_id).first()
                    if badge_user:
                        send_badge_unlocked(db, badge_user, badge_code)

            snap.is_frozen = True
            created += 1

        summary[track_name] = created

    db.commit()
    return summary


def _badge_code_for_rank(track: str, rank: int) -> Optional[str]:
    if rank == 1:
        return f"podium_{track}_1st"
    elif rank == 2:
        return f"podium_{track}_2nd"
    elif rank == 3:
        return f"podium_{track}_3rd"
    elif rank <= 10:
        return f"top10_{track}"
    elif rank <= 100:
        return f"top100_{track}"
    return None


def get_budget_summary(db: Session, period_month: Optional[str] = None) -> dict:
    """Budget summary widget for admin dashboard."""
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

    return {
        "total_rewards_this_month": len(all_rewards),
        "total_cash_value_usd": cash_total,
        "pending_count": pending,
        "kyc_review_count": kyc_review,
        "approved_count": approved,
        "sent_count": sent,
        "budget_used_usd": budget_used,
    }


def enrich_reward(reward: Reward, user: Optional[User]) -> dict:
    return {
        "id": str(reward.id),
        "user_id": str(reward.user_id),
        "user_name": user.display_name if user else None,
        "user_email": user.email if user else None,
        "user_country": user.country if user else None,
        "track": reward.track,
        "period_month": reward.period_month,
        "tier": reward.tier,
        "rank_at_freeze": reward.rank_at_freeze,
        "reward_type": reward.reward_type,
        "reward_amount_usd": reward.reward_amount_usd,
        "reward_description": reward.reward_description,
        "status": reward.status.value if hasattr(reward.status, 'value') else reward.status,
        "kyc_verified": reward.kyc_verified,
        "kyc_verification_id": reward.kyc_verification_id,
        "claimed_at": reward.claimed_at.isoformat() if reward.claimed_at else None,
        "sent_at": reward.sent_at.isoformat() if reward.sent_at else None,
        "admin_notes": reward.admin_notes,
        "created_at": reward.created_at.isoformat() if reward.created_at else None,
    }
