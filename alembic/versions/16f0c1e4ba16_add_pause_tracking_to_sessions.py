"""add pause tracking to sessions

Revision ID: 16f0c1e4ba16
Revises: bede3dd37b70
Create Date: 2026-07-12 09:04:14.474305
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '16f0c1e4ba16'
down_revision: Union[str, None] = 'bede3dd37b70'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sessions', sa.Column('is_paused', sa.Boolean(), nullable=False))
    op.add_column('sessions', sa.Column('paused_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('sessions', sa.Column('total_paused_seconds', sa.Integer(), nullable=False))


def downgrade() -> None:
    op.drop_column('sessions', 'total_paused_seconds')
    op.drop_column('sessions', 'paused_at')
    op.drop_column('sessions', 'is_paused')
