"""Monthly leaderboard freeze task."""
import logging
from datetime import datetime, timezone
from app.tasks.celery_app import celery_app
from app.db.session import SessionLocal
from app.models import LeaderboardSnapshot, Reward, RewardType, RewardStatus, User, AdminSetting
from app.services.leaderboard_service import compute_leaderboard
from app.services.notification_service import send_reward_notification
from app.models import LeaderboardTrack, LeaderboardScope, LeaderboardPeriod

logger = logging.getLogger(__name__)

BADGE_TIERS = [
    ("top_100", 100, RewardType.badge, None, "Top 100 Monthly Badge"),
    ("top_1000", 1000, RewardType.badge, None, "Top 1000 Monthly Badge"),
]


@celery_app.task(name="app.tasks.monthly_leaderboard_freeze.freeze_leaderboard")
def freeze_leaderboard():
    """Freeze monthly leaderboard and assign rewards."""
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    period_month = now.strftime("%Y-%m")
    top3_winners = {}  # user_id -> {"rank": int, "amount": float, "track": str}

    try:
        settings = {row.key: row.value for row in db.query(AdminSetting).all()}
        rank_1_amount = float(settings.get("reward_rank_1_usd", "100"))
        rank_2_amount = float(settings.get("reward_rank_2_usd", "75"))
        rank_3_amount = float(settings.get("reward_rank_3_usd", "50"))

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

            # Create giftcard rewards for top 3 (per-rank amounts)
            for entry in entries:
                rank = entry["rank"]
                if rank == 1:
                    amount, desc = rank_1_amount, f"Rank 1 — ${rank_1_amount:.0f} Gift Card"
                elif rank == 2:
                    amount, desc = rank_2_amount, f"Rank 2 — ${rank_2_amount:.0f} Gift Card"
                elif rank == 3:
                    amount, desc = rank_3_amount, f"Rank 3 — ${rank_3_amount:.0f} Gift Card"
                else:
                    continue
                reward = Reward(
                    user_id=entry["user_id"],
                    track=track.value,
                    period_month=period_month,
                    tier="top_3",
                    rank_at_freeze=rank,
                    reward_type=RewardType.giftcard,
                    reward_amount_usd=amount,
                    reward_description=desc,
                    status=RewardStatus.pending,
                )
                db.add(reward)
                top3_winners[entry["user_id"]] = {"rank": rank, "amount": amount, "track": track.value}

            # Create badge rewards for top 100 and top 1000
            for tier_name, max_rank, reward_type, amount, description in BADGE_TIERS:
                top = [e for e in entries if 4 <= e["rank"] <= max_rank]
                for entry in top:
                    reward = Reward(
                        user_id=entry["user_id"],
                        track=track.value,
                        period_month=period_month,
                        tier=tier_name,
                        rank_at_freeze=entry["rank"],
                        reward_type=reward_type,
                        reward_amount_usd=amount,
                        reward_description=description,
                        status=RewardStatus.pending,
                    )
                    db.add(reward)

        db.commit()
        logger.info(f"Leaderboard frozen for {period_month}")

        # Send push notifications to top 3 winners
        if top3_winners:
            user_ids = list(top3_winners.keys())
            users_map = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()}
            for uid, info in top3_winners.items():
                user = users_map.get(uid)
                if user:
                    send_reward_notification(db, user, "reward_created", reward_amount=info["amount"], rank=info["rank"], track=info["track"])
    finally:
        db.close()
