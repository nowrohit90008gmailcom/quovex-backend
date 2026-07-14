"""Monthly leaderboard freeze task."""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict
from app.tasks.celery_app import celery_app
from app.db.session import SessionLocal
from app.models import (
    LeaderboardSnapshot, Reward, RewardType, RewardStatus,
    User, AdminSetting, RewardConfig, LeaderboardTrack,
    LeaderboardScope, LeaderboardPeriod,
)
from app.services.leaderboard_service import compute_leaderboard
from app.services.notification_service import send_reward_notification

logger = logging.getLogger(__name__)

BADGE_TIERS = [
    ("top_100", 100, RewardType.badge, None, "Top 100 Monthly Badge"),
    ("top_1000", 1000, RewardType.badge, None, "Top 1000 Monthly Badge"),
]


def _load_configs(db, period_month: str) -> Dict[str, Dict[str, RewardConfig]]:
    """Load reward configs keyed by track -> position_label."""
    rows = db.query(RewardConfig).filter(
        RewardConfig.period_month == period_month,
        RewardConfig.is_active == True,
    ).all()
    configs: Dict[str, Dict[str, RewardConfig]] = {}
    for r in rows:
        configs.setdefault(r.track, {})[r.position_label] = r
    return configs


def _get_config(
    configs: Dict[str, Dict[str, RewardConfig]],
    track: str, rank: int,
) -> Optional[RewardConfig]:
    track_cfgs = configs.get(track, {})
    if rank == 1:
        return track_cfgs.get("rank_1")
    elif rank == 2:
        return track_cfgs.get("rank_2")
    elif rank == 3:
        return track_cfgs.get("rank_3")
    elif rank <= 100:
        return track_cfgs.get("top_100")
    elif rank <= 1000:
        return track_cfgs.get("top_1000")
    return None


@celery_app.task(name="app.tasks.monthly_leaderboard_freeze.freeze_leaderboard")
def freeze_leaderboard():
    """Freeze monthly leaderboard and assign rewards."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    period_month = now.strftime("%Y-%m")
    top3_winners = {}

    try:
        settings = {row.key: row.value for row in db.query(AdminSetting).all()}
        rank_1_amount = float(settings.get("reward_rank_1_usd", "100"))
        rank_2_amount = float(settings.get("reward_rank_2_usd", "75"))
        rank_3_amount = float(settings.get("reward_rank_3_usd", "50"))
        configs = _load_configs(db, period_month)

        for track in [LeaderboardTrack.study, LeaderboardTrack.quiz, LeaderboardTrack.overall]:
            entries = compute_leaderboard(
                db, track, LeaderboardScope.global_,
                LeaderboardPeriod.month, limit=1000,
            )
            # Mark snapshots as frozen
            for entry in entries:
                snap = LeaderboardSnapshot(
                    user_id=entry["user_id"],
                    track=track,
                    scope=LeaderboardScope.global_,
                    period=LeaderboardPeriod.month,
                    rank=entry["rank"],
                    verified_minutes=entry.get("score", 0),
                    points=entry.get("score", 0),
                    snapshot_at=now,
                    is_frozen=True,
                )
                db.add(snap)

            # Create rewards
            for entry in entries:
                rank = entry["rank"]
                cfg = _get_config(configs, track.value, rank)

                if cfg:
                    reward_type = cfg.reward_type
                    amount = cfg.amount_usd
                    description = cfg.reward_name
                    if rank <= 3:
                        tier = "top_3"
                    elif rank <= 100:
                        tier = "top_100"
                    else:
                        tier = "top_1000"
                elif rank == 1:
                    reward_type = RewardType.giftcard
                    amount = rank_1_amount
                    description = f"Rank 1 \u2014 ${rank_1_amount:.0f} Gift Card"
                    tier = "top_3"
                elif rank == 2:
                    reward_type = RewardType.giftcard
                    amount = rank_2_amount
                    description = f"Rank 2 \u2014 ${rank_2_amount:.0f} Gift Card"
                    tier = "top_3"
                elif rank == 3:
                    reward_type = RewardType.giftcard
                    amount = rank_3_amount
                    description = f"Rank 3 \u2014 ${rank_3_amount:.0f} Gift Card"
                    tier = "top_3"
                else:
                    # Badge tiers
                    tier_found = None
                    for tn, max_rank, rt, amt, desc in BADGE_TIERS:
                        if rank <= max_rank:
                            tier_found = tn
                            reward_type = rt
                            amount = amt
                            description = desc
                            break
                    if not tier_found:
                        continue
                    tier = tier_found

                reward_type_val = reward_type if isinstance(reward_type, str) else reward_type.value
                reward = Reward(
                    user_id=entry["user_id"],
                    track=track.value,
                    period_month=period_month,
                    tier=tier,
                    rank_at_freeze=rank,
                    reward_type=reward_type_val,
                    reward_amount_usd=amount,
                    reward_description=description,
                    custom_reward_name=cfg.reward_name if cfg else None,
                    reward_image_url=cfg.image_url if cfg else None,
                    status=RewardStatus.pending,
                )
                db.add(reward)

                if rank <= 3:
                    top3_winners[entry["user_id"]] = {
                        "rank": rank, "amount": amount, "track": track.value,
                    }

                # Award badge
                if rank > 3 and tier in ("top_100", "top_1000"):
                    badge_code = f"top{100 if tier == 'top_100' else 1000}_{track.value}"
                    existing = db.query(Reward).filter(
                        Reward.user_id == entry["user_id"],
                        Reward.period_month == period_month,
                        Reward.track == track.value,
                        Reward.tier == tier,
                    ).first()
                    if not existing:
                        from app.models import Badge
                        existing_badge = db.query(Badge).filter(
                            Badge.user_id == entry["user_id"],
                            Badge.badge_code == badge_code,
                        ).first()
                        if not existing_badge:
                            db.add(Badge(user_id=entry["user_id"], badge_code=badge_code))

        db.commit()
        logger.info(f"Leaderboard frozen for {period_month}")

        # Send push notifications to top 3 winners
        if top3_winners:
            user_ids = list(top3_winners.keys())
            users_map = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()}
            for uid, info in top3_winners.items():
                user = users_map.get(uid)
                if user:
                    send_reward_notification(
                        db, user, "reward_created",
                        reward_amount=info["amount"],
                        rank=info["rank"], track=info["track"],
                    )
    finally:
        db.close()
