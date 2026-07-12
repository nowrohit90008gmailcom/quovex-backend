"""add missing user columns (password_hash, referral, app_lock, ad)

Revision ID: 2a3b4c5d6e7f
Revises: 16f0c1e4ba16
Create Date: 2026-07-12 19:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '2a3b4c5d6e7f'
down_revision: Union[str, None] = '16f0c1e4ba16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('password_hash', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('referral_code', sa.String(20), nullable=True, unique=True, index=True))
    op.add_column('users', sa.Column('referred_by_id', sa.Uuid(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('users', sa.Column('referral_bonus_earned', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('first_session_completed', sa.Boolean(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('app_lock_enabled', sa.Boolean(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('app_lock_credits', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('locked_app_packages', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('last_ad_unlock_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('ad_unlock_count_today', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('ad_unlock_reset_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'ad_unlock_reset_at')
    op.drop_column('users', 'ad_unlock_count_today')
    op.drop_column('users', 'last_ad_unlock_at')
    op.drop_column('users', 'locked_app_packages')
    op.drop_column('users', 'app_lock_credits')
    op.drop_column('users', 'app_lock_enabled')
    op.drop_column('users', 'first_session_completed')
    op.drop_column('users', 'referral_bonus_earned')
    op.drop_column('users', 'referred_by_id')
    op.drop_column('users', 'referral_code')
    op.drop_column('users', 'password_hash')
