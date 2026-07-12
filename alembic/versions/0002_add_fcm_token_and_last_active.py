"""Add fcm_token and last_active to users

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-04 18:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("fcm_token", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("last_active", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "last_active")
    op.drop_column("users", "fcm_token")
