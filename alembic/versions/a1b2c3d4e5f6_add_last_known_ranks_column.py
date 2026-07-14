"""add last_known_ranks column to users

Revision ID: a1b2c3d4e5f6
Revises: f325c222589e
Create Date: 2026-07-13 23:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f325c222589e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('last_known_ranks', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'last_known_ranks')
