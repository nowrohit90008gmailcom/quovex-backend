"""Convert points_total and related integer columns to BIGINT to prevent overflow

Revision ID: h0001
Revises: g0001
Create Date: 2026-07-25
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "h0001"
down_revision: Union[str, None] = "g0001"
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.engine.name == "postgresql":
        op.alter_column("users", "points_total",
                        existing_type=sa.Integer(),
                        type_=sa.BigInteger(),
                        existing_nullable=False)
        op.alter_column("users", "verified_minutes_total",
                        existing_type=sa.Integer(),
                        type_=sa.BigInteger(),
                        existing_nullable=False)
        op.alter_column("users", "quiz_points_total",
                        existing_type=sa.Integer(),
                        type_=sa.BigInteger(),
                        existing_nullable=False)
        op.alter_column("users", "verified_quiz_score",
                        existing_type=sa.Integer(),
                        type_=sa.BigInteger(),
                        existing_nullable=False)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.engine.name == "postgresql":
        op.alter_column("users", "points_total",
                        existing_type=sa.BigInteger(),
                        type_=sa.Integer(),
                        existing_nullable=False)
        op.alter_column("users", "verified_minutes_total",
                        existing_type=sa.BigInteger(),
                        type_=sa.Integer(),
                        existing_nullable=False)
        op.alter_column("users", "quiz_points_total",
                        existing_type=sa.BigInteger(),
                        type_=sa.Integer(),
                        existing_nullable=False)
        op.alter_column("users", "verified_quiz_score",
                        existing_type=sa.BigInteger(),
                        type_=sa.Integer(),
                        existing_nullable=False)
