"""Endpoints for subjects, topics, and topic-level analytics."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.limiter import limiter
from app.db.session import get_db
from app.models import User, Topic, UserTopicProgress, QuizSession
from app.schemas import TopicOut, TopicProgressOut
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("", response_model=list[TopicOut])
@limiter.limit("30/minute")
async def list_topics(
    request: Request,
    subject: Optional[str] = Query(None),
    exam_tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List all topics, optionally filtered by subject or exam tag."""
    query = select(Topic).order_by(Topic.display_order, Topic.name)
    if subject:
        query = query.where(Topic.subject == subject)
    if exam_tag:
        query = query.where(Topic.exam_tag == exam_tag)
    result = db.execute(query)
    return result.scalars().all()


@router.get("/my-progress", response_model=list[TopicProgressOut])
async def my_topic_progress(
    subject: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's topic-level progress, optionally filtered by subject."""
    query = (
        select(UserTopicProgress, Topic)
        .join(Topic, UserTopicProgress.topic_id == Topic.id)
        .where(UserTopicProgress.user_id == current_user.id)
    )
    if subject:
        query = query.where(Topic.subject == subject)
    result = db.execute(query)
    rows = result.all()
    return [
        TopicProgressOut(
            topic_id=utp.topic_id,
            topic_name=topic.name,
            subject=topic.subject,
            questions_answered=utp.questions_answered,
            correct=utp.correct,
            accuracy=utp.accuracy,
            study_minutes=utp.study_minutes,
        )
        for utp, topic in rows
    ]


@router.get("/{topic_id}/progress", response_model=TopicProgressOut)
async def topic_progress_detail(
    topic_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's progress for a specific topic."""
    utp = db.execute(
        select(UserTopicProgress, Topic)
        .join(Topic, UserTopicProgress.topic_id == Topic.id)
        .where(
            UserTopicProgress.user_id == current_user.id,
            UserTopicProgress.topic_id == topic_id,
        )
    ).first()
    if not utp:
        raise HTTPException(status_code=404, detail="No progress found for this topic")
    return TopicProgressOut(
        topic_id=utp.UserTopicProgress.topic_id,
        topic_name=utp.Topic.name,
        subject=utp.Topic.subject,
        questions_answered=utp.UserTopicProgress.questions_answered,
        correct=utp.UserTopicProgress.correct,
        accuracy=utp.UserTopicProgress.accuracy,
        study_minutes=utp.UserTopicProgress.study_minutes,
    )
