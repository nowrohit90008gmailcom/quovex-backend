"""Quiz router - adaptive quiz sessions, scoring, ad mechanics."""
import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import User, UserSubjectProficiency, UserTopicProgress, Topic, QuizQuestion, QuizSession, QuizAnswer
from app.schemas import (
    QuizStartIn, QuizStartOut, QuizQuestionOut,
    QuizAnswerIn, QuizAnswerOut,
    QuizCompleteOut, QuizAdDoubleIn, QuizAdDoubleOut,
    SubjectProgressOut,
)
from app.services.quiz_service import (
    select_questions, check_answer, count_consecutive_correct,
    calculate_answer_points, update_proficiency,
)

router = APIRouter(prefix="/quiz", tags=["quiz"])
logger = logging.getLogger(__name__)


def _get_quiz_session(db: DBSession, session_id: UUID, user_id) -> QuizSession:
    s = db.query(QuizSession).filter(
        QuizSession.id == session_id,
        QuizSession.user_id == user_id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    return s


@router.post("/start", response_model=QuizStartOut)
async def start_quiz(
    body: QuizStartIn,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    questions = select_questions(
        db, current_user, body.subject, body.exam_tag,
        body.difficulty, body.question_count,
    )
    if not questions:
        raise HTTPException(status_code=404, detail="No questions available for selected criteria")

    quiz_session = QuizSession(
        user_id=current_user.id,
        subject=body.subject,
        exam_tag=body.exam_tag,
        topic_id=body.topic_id,
        difficulty_mode=body.difficulty,
        question_ids=[q.id for q in questions],
        total_questions=len(questions),
        start_time=datetime.now(timezone.utc),
    )
    db.add(quiz_session)
    db.commit()
    db.refresh(quiz_session)

    return QuizStartOut(
        quiz_session_id=quiz_session.id,
        questions=[QuizQuestionOut.model_validate(q) for q in questions],
        started_at=quiz_session.start_time,
    )


@router.post("/answer", response_model=QuizAnswerOut)
async def submit_answer(
    body: QuizAnswerIn,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    quiz_session = _get_quiz_session(db, body.quiz_session_id, current_user.id)
    question = db.query(QuizQuestion).filter(QuizQuestion.id == body.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = check_answer(question, body.selected_answer)
    consecutive = count_consecutive_correct(db, quiz_session.id)
    points = calculate_answer_points(is_correct, body.response_time_ms, consecutive)

    answer = QuizAnswer(
        quiz_session_id=quiz_session.id,
        question_id=question.id,
        selected_answer=body.selected_answer,
        is_correct=is_correct,
        response_time_ms=body.response_time_ms,
        points_awarded=points,
        counts_toward_verified_score=True,
    )
    db.add(answer)

    if is_correct:
        quiz_session.total_correct += 1
        quiz_session.points_earned += points
        quiz_session.verified_quiz_score_earned += points

    db.commit()

    return QuizAnswerOut(
        is_correct=is_correct,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        points_awarded=points,
    )


@router.post("/complete/{quiz_session_id}", response_model=QuizCompleteOut)
async def complete_quiz(
    quiz_session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    quiz_session = _get_quiz_session(db, quiz_session_id, current_user.id)
    if quiz_session.is_complete:
        raise HTTPException(status_code=400, detail="Quiz already completed")

    quiz_session.end_time = datetime.now(timezone.utc)
    quiz_session.is_complete = True

    current_user.quiz_points_total += quiz_session.points_earned
    current_user.verified_quiz_score += quiz_session.verified_quiz_score_earned

    if quiz_session.subject:
        update_proficiency(db, current_user, quiz_session)

    if quiz_session.topic_id and quiz_session.total_questions > 0:
        topic_progress = (
            db.query(UserTopicProgress)
            .filter(
                UserTopicProgress.user_id == current_user.id,
                UserTopicProgress.topic_id == quiz_session.topic_id,
            )
            .first()
        )
        if not topic_progress:
            topic_progress = UserTopicProgress(
                user_id=current_user.id,
                topic_id=quiz_session.topic_id,
            )
            db.add(topic_progress)
        topic_progress.questions_answered += quiz_session.total_questions
        topic_progress.correct += quiz_session.total_correct
        topic_progress.accuracy = (
            topic_progress.correct / topic_progress.questions_answered
            if topic_progress.questions_answered > 0 else 0.0
        )

    db.commit()
    db.refresh(quiz_session)

    accuracy = (
        quiz_session.total_correct / quiz_session.total_questions * 100
        if quiz_session.total_questions > 0 else 0
    )

    return QuizCompleteOut(
        quiz_session_id=quiz_session.id,
        total_correct=quiz_session.total_correct,
        total_questions=quiz_session.total_questions,
        accuracy_percent=round(accuracy, 1),
        points_earned=quiz_session.points_earned,
        verified_quiz_score_earned=quiz_session.verified_quiz_score_earned,
        ad_double_available=not quiz_session.ad_doubled,
        bonus_questions_available=not quiz_session.bonus_questions_added,
        message=f"Quiz complete! {quiz_session.total_correct}/{quiz_session.total_questions} correct",
    )


@router.post("/ad-double", response_model=QuizAdDoubleOut)
async def ad_double_quiz(
    body: QuizAdDoubleIn,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    quiz_session = _get_quiz_session(db, body.quiz_session_id, current_user.id)
    if quiz_session.ad_doubled:
        return QuizAdDoubleOut(
            points_earned=quiz_session.points_earned, success=False,
            message="Already doubled for this session",
        )

    extra = quiz_session.points_earned
    quiz_session.points_earned += extra
    quiz_session.ad_doubled = True
    current_user.quiz_points_total += extra
    db.commit()

    return QuizAdDoubleOut(
        points_earned=quiz_session.points_earned,
        success=True,
        message="Quiz points doubled! (Leaderboard score unchanged)",
    )


@router.get("/subject-progress", response_model=list[SubjectProgressOut])
async def get_subject_progress(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    proficiencies = (
        db.query(UserSubjectProficiency)
        .filter(UserSubjectProficiency.user_id == current_user.id)
        .all()
    )
    if not proficiencies:
        subjects = ["Physics", "Chemistry", "Biology", "Mathematics", "History"]
        return [SubjectProgressOut(subject=s) for s in subjects]

    return [
        SubjectProgressOut(
            subject=p.subject,
            accuracy=p.rolling_accuracy_score,
            questions_answered=p.total_questions_answered,
        )
        for p in proficiencies
    ]
