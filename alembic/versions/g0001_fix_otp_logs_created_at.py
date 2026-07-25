"""Fix otp_logs created_at: add server_default=now() and backfill NULLs

Revision ID: g0001
Revises: e0601c21585c
Create Date: 2026-07-25
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "g0001"
down_revision: Union[str, None] = "e0601c21585c"
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if bind.engine.name == "postgresql":
        # 1. Backfill any NULL created_at rows with now()
        op.execute(
            "UPDATE otp_logs SET created_at = NOW() WHERE created_at IS NULL"
        )
        # 2. Make the column NOT NULL with a server default of now()
        op.alter_column(
            "otp_logs",
            "created_at",
            existing_type=sa.DateTime(timezone=True),
            type_=sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        )
    else:
        # SQLite fallback – just backfill NULLs
        op.execute(
            "UPDATE otp_logs SET created_at = datetime('now') WHERE created_at IS NULL"
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.engine.name == "postgresql":
        op.alter_column(
            "otp_logs",
            "created_at",
            existing_type=sa.DateTime(timezone=True),
            nullable=True,
            server_default=None,
        )
