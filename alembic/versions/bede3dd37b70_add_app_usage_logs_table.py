"""add app_usage_logs table

Revision ID: bede3dd37b70
Revises: e0601c21585c
Create Date: 2026-07-12 01:46:35.649763
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'bede3dd37b70'
down_revision: Union[str, None] = 'e0601c21585c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('app_usage_logs',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('date', sa.DateTime(timezone=True), nullable=False),
    sa.Column('open_count', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_app_usage_logs_date'), 'app_usage_logs', ['date'], unique=False)
    op.create_index(op.f('ix_app_usage_logs_user_id'), 'app_usage_logs', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_app_usage_logs_user_id'), table_name='app_usage_logs')
    op.drop_index(op.f('ix_app_usage_logs_date'), table_name='app_usage_logs')
    op.drop_table('app_usage_logs')
