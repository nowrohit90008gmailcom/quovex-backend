"""add freedom lock columns (reset_time_hour, lock_mode, wallet_minutes)

Revision ID: h0003
Revises: h0002
Create Date: 2026-08-06
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'h0003'
down_revision: Union[str, None] = 'h0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]

    if 'reset_time_hour' not in columns:
        op.add_column('users', sa.Column('reset_time_hour', sa.Integer(), server_default='8', nullable=True))
    if 'lock_mode' not in columns:
        op.add_column('users', sa.Column('lock_mode', sa.String(50), server_default='STRICT', nullable=True))
    if 'wallet_minutes' not in columns:
        op.add_column('users', sa.Column('wallet_minutes', sa.Integer(), server_default='120', nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'wallet_minutes')
    op.drop_column('users', 'lock_mode')
    op.drop_column('users', 'reset_time_hour')
