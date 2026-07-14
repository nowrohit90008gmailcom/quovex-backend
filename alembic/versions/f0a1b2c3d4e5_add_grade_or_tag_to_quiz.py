"""add grade_or_tag column to quiz_questions and quiz_sessions

Revision ID: f0a1b2c3d4e5
Revises: e7f8a9b0c1d2
Create Date: 2026-07-13 23:50:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f0a1b2c3d4e5'
down_revision: Union[str, None] = 'e7f8a9b0c1d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('quiz_questions', sa.Column('grade_or_tag', sa.String(length=100), nullable=True, index=True))
    op.add_column('quiz_sessions', sa.Column('grade_or_tag', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('quiz_sessions', 'grade_or_tag')
    op.drop_column('quiz_questions', 'grade_or_tag')
