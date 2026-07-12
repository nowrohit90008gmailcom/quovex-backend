"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-04
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table("users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("firebase_uid", sa.String(255), unique=True, nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("display_name", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("exam_tags", JSON, nullable=True),
        sa.Column("primary_subject", sa.String(100), nullable=True),
        sa.Column("points_total", sa.Integer, default=0),
        sa.Column("verified_minutes_total", sa.Integer, default=0),
        sa.Column("quiz_points_total", sa.Integer, default=0),
        sa.Column("verified_quiz_score", sa.Integer, default=0),
        sa.Column("streak_count", sa.Integer, default=0),
        sa.Column("last_study_date", sa.DateTime, nullable=True),
        sa.Column("social_unlock_minutes_today", sa.Integer, default=0),
        sa.Column("social_unlock_reset_at", sa.DateTime, nullable=True),
        sa.Column("ad_doubles_used_today", sa.Integer, default=0),
        sa.Column("ad_doubles_reset_at", sa.DateTime, nullable=True),
        sa.Column("device_id", sa.String(255), nullable=True),
        sa.Column("is_banned", sa.Boolean, default=False),
        sa.Column("ban_reason", sa.Text, nullable=True),
        sa.Column("admin_role", sa.String(50), default="none"),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("age", sa.Integer, nullable=True),
        sa.Column("institution_type", sa.String(50), nullable=True),
        sa.Column("institution_name", sa.String(255), nullable=True),
        sa.Column("class_or_year", sa.String(50), nullable=True),
        sa.Column("class_auto_advanced_year", sa.Integer, nullable=True),
        sa.Column("profile_complete", sa.Boolean, default=False),
        sa.Column("language", sa.String(10), default="en"),
        sa.Column("notification_prefs", JSON, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"])
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table("user_subject_proficiencies",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("subject", sa.String(100), nullable=False),
        sa.Column("exam_tag", sa.String(100), nullable=True),
        sa.Column("rolling_accuracy_score", sa.Float, default=0.0),
        sa.Column("total_questions_answered", sa.Integer, default=0),
        sa.Column("total_correct", sa.Integer, default=0),
        sa.Column("monthly_accuracy_history", JSON, nullable=True),
        sa.Column("last_updated", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    op.create_table("sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("mode", sa.String(50), nullable=False),
        sa.Column("start_time", sa.DateTime, nullable=False),
        sa.Column("end_time", sa.DateTime, nullable=True),
        sa.Column("verified_minutes", sa.Integer, default=0),
        sa.Column("raw_minutes", sa.Integer, default=0),
        sa.Column("points_awarded", sa.Integer, default=0),
        sa.Column("points_base", sa.Integer, default=0),
        sa.Column("ad_doubled", sa.Boolean, default=False),
        sa.Column("ad_double_count", sa.Integer, default=0),
        sa.Column("subject_tag", sa.String(100), nullable=True),
        sa.Column("exam_tag", sa.String(100), nullable=True),
        sa.Column("locked_app_count", sa.Integer, default=0),
        sa.Column("whitelist_apps", JSON, nullable=True),
        sa.Column("honor_check_failures", sa.Integer, default=0),
        sa.Column("flagged", sa.Boolean, default=False),
        sa.Column("flag_reason", sa.Text, nullable=True),
        sa.Column("anti_cheat_score", sa.Float, default=0.0),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index("ix_sessions_start_time", "sessions", ["start_time"])
    op.create_index("ix_sessions_flagged", "sessions", ["flagged"])

    op.create_table("quiz_questions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("options", JSON, nullable=True),
        sa.Column("correct_answer", sa.Text, nullable=False),
        sa.Column("explanation", sa.Text, nullable=True),
        sa.Column("question_type", sa.String(50), default="mcq"),
        sa.Column("subject", sa.String(100), nullable=False),
        sa.Column("exam_tag", sa.String(100), nullable=True),
        sa.Column("difficulty", sa.String(50), default="medium"),
        sa.Column("status", sa.String(50), default="pending_review"),
        sa.Column("numerical_tolerance", sa.Float, nullable=True),
        sa.Column("reviewed_by", UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime, nullable=True),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column("generation_batch_id", sa.String(100), nullable=True),
        sa.Column("generated_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_quiz_questions_subject", "quiz_questions", ["subject"])
    op.create_index("ix_quiz_questions_status", "quiz_questions", ["status"])

    op.create_table("quiz_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("subject", sa.String(100), nullable=True),
        sa.Column("exam_tag", sa.String(100), nullable=True),
        sa.Column("difficulty_mode", sa.String(50), default="adaptive"),
        sa.Column("question_ids", JSON, nullable=True),
        sa.Column("start_time", sa.DateTime, nullable=False),
        sa.Column("end_time", sa.DateTime, nullable=True),
        sa.Column("total_correct", sa.Integer, default=0),
        sa.Column("total_questions", sa.Integer, default=0),
        sa.Column("points_earned", sa.Integer, default=0),
        sa.Column("verified_quiz_score_earned", sa.Integer, default=0),
        sa.Column("ad_doubled", sa.Boolean, default=False),
        sa.Column("bonus_questions_added", sa.Boolean, default=False),
        sa.Column("is_complete", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    op.create_table("quiz_answers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("quiz_session_id", UUID(as_uuid=True), sa.ForeignKey("quiz_sessions.id"), nullable=False),
        sa.Column("question_id", UUID(as_uuid=True), sa.ForeignKey("quiz_questions.id"), nullable=False),
        sa.Column("selected_answer", sa.Text, nullable=True),
        sa.Column("is_correct", sa.Boolean, default=False),
        sa.Column("response_time_ms", sa.Integer, nullable=True),
        sa.Column("points_awarded", sa.Integer, default=0),
        sa.Column("counts_toward_verified_score", sa.Boolean, default=True),
        sa.Column("answered_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table("leaderboard_snapshots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("track", sa.String(50), nullable=False),
        sa.Column("scope", sa.String(50), nullable=False),
        sa.Column("period", sa.String(50), nullable=False),
        sa.Column("rank", sa.Integer, nullable=False),
        sa.Column("verified_minutes", sa.Integer, default=0),
        sa.Column("verified_quiz_score", sa.Integer, default=0),
        sa.Column("points", sa.Integer, default=0),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("state_region", sa.String(100), nullable=True),
        sa.Column("exam_tag", sa.String(100), nullable=True),
        sa.Column("snapshot_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("is_frozen", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_lb_snapshots_user_track_period", "leaderboard_snapshots", ["user_id", "track", "period"])

    op.create_table("rewards",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("track", sa.String(50), nullable=False),
        sa.Column("period_month", sa.String(7), nullable=False),
        sa.Column("tier", sa.String(50), nullable=False),
        sa.Column("rank_at_freeze", sa.Integer, nullable=False),
        sa.Column("reward_type", sa.String(50), nullable=False),
        sa.Column("reward_amount_usd", sa.Float, nullable=True),
        sa.Column("reward_description", sa.Text, nullable=True),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("kyc_verified", sa.Boolean, default=False),
        sa.Column("kyc_verification_id", sa.String(255), nullable=True),
        sa.Column("claimed_at", sa.DateTime, nullable=True),
        sa.Column("sent_at", sa.DateTime, nullable=True),
        sa.Column("admin_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    op.create_table("admin_action_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("admin_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("action_type", sa.String(100), nullable=False),
        sa.Column("target_user_id", UUID(as_uuid=True), nullable=True),
        sa.Column("target_resource_type", sa.String(100), nullable=True),
        sa.Column("target_resource_id", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("action_metadata", JSON, nullable=True),
        sa.Column("timestamp", sa.DateTime, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table("ad_revenue_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("date", sa.DateTime, nullable=False),
        sa.Column("placement_type", sa.String(100), nullable=False),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("impressions", sa.Integer, default=0),
        sa.Column("estimated_revenue_usd", sa.Float, default=0.0),
        sa.Column("ecpm", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_ad_revenue_date", "ad_revenue_logs", ["date"])
    op.create_index("ix_ad_revenue_placement", "ad_revenue_logs", ["placement_type"])

    op.create_table("notification_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("notification_type", sa.String(50), nullable=False),
        sa.Column("trigger_reason", sa.String(255), nullable=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("body", sa.Text, nullable=True),
        sa.Column("sent_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("fcm_message_id", sa.String(255), nullable=True),
        sa.Column("success", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_notification_logs_user_sent", "notification_logs", ["user_id", "sent_at"])


def downgrade() -> None:
    op.drop_table("notification_logs")
    op.drop_table("ad_revenue_logs")
    op.drop_table("admin_action_logs")
    op.drop_table("rewards")
    op.drop_table("leaderboard_snapshots")
    op.drop_table("quiz_answers")
    op.drop_table("quiz_sessions")
    op.drop_table("quiz_questions")
    op.drop_table("sessions")
    op.drop_table("user_subject_proficiencies")
    op.drop_table("users")
