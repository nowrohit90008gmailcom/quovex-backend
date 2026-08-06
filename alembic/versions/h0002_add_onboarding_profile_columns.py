"""add onboarding profile columns

Revision ID: h0002
Revises: h0001
Create Date: 2026-08-06
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'h0002'
down_revision: Union[str, None] = 'h0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]

    if 'education_type' not in columns:
        op.add_column('users', sa.Column('education_type', sa.String(100), nullable=True))
    if 'exam_target' not in columns:
        op.add_column('users', sa.Column('exam_target', sa.String(100), nullable=True))
    if 'study_goal' not in columns:
        op.add_column('users', sa.Column('study_goal', sa.String(150), nullable=True))
    if 'daily_target_hours' not in columns:
        op.add_column('users', sa.Column('daily_target_hours', sa.Float(), server_default='4.0', nullable=True))
    if 'blocked_apps' not in columns:
        op.add_column('users', sa.Column('blocked_apps', sa.JSON(), nullable=True))
    if 'study_time_preference' not in columns:
        op.add_column('users', sa.Column('study_time_preference', sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'study_time_preference')
    op.drop_column('users', 'blocked_apps')
    op.drop_column('users', 'daily_target_hours')
    op.drop_column('users', 'study_goal')
    op.drop_column('users', 'exam_target')
    op.drop_column('users', 'education_type')
