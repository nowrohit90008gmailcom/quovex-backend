"""Quiz question generation using Cerebras API with key rotation."""
import json
import logging
import random
import time
from datetime import datetime, timezone
from typing import List

import httpx
from app.config import settings
from app.db.session import SessionLocal
from app.models import QuizQuestion, QuestionType, Difficulty, QuestionStatus
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

SUBJECTS_EXAM_TAGS = [
    ("Physics", "JEE"), ("Chemistry", "JEE"), ("Mathematics", "JEE"),
    ("Biology", "NEET"), ("Physics", "NEET"), ("Chemistry", "NEET"),
    ("History", "UPSC"), ("Geography", "UPSC"), ("Polity", "UPSC"),
    ("Mathematics", "SAT"), ("English", "SAT"),
    ("General Science", "General Study"),
]

GENERATION_PROMPT = """Generate {count} quiz questions for subject: {subject}, exam: {exam_tag}, difficulty: {difficulty}.

Return ONLY a valid JSON array. Each object must have:
- "text": question text
- "options": array of 4 answer strings (for MCQ)
- "correct_answer": the exact correct answer string
- "explanation": brief explanation of the correct answer (2-3 sentences)
- "question_type": "mcq"

Rules:
- Questions must be factually accurate and exam-relevant
- Options must be plausible distractors
- No duplicate questions
- Difficulty {difficulty}: {{easy = recall-based, medium = application, hard = analysis}}
"""


def _pick_api_key() -> str:
    keys_str = settings.CEREBRAS_API_KEYS or settings.CEREBRAS_API_KEY
    if not keys_str:
        return ""
    keys = [k.strip() for k in keys_str.split(",") if k.strip()]
    return random.choice(keys) if keys else ""


@celery_app.task(name="app.tasks.question_generation.generate_quiz_questions")
def generate_quiz_questions(subject: str = None, exam_tag: str = None, count_per_combo: int = 20):
    """Generate quiz questions via Cerebras API and store in DB as pending_review."""
    api_key = _pick_api_key()
    if not api_key:
        logger.warning("No Cerebras API keys configured, skipping generation")
        return

    combos = [(subject, exam_tag)] if subject and exam_tag else SUBJECTS_EXAM_TAGS

    db = SessionLocal()
    total_generated = 0

    try:
        for subj, tag in combos:
            for diff in [Difficulty.easy, Difficulty.medium, Difficulty.hard]:
                try:
                    questions = _call_cerebras(api_key, subj, tag, diff.value, count_per_combo)
                    for q_data in questions:
                        if not q_data.get("text") or not q_data.get("correct_answer"):
                            logger.warning(f"Skipping malformed question from Cerebras: {q_data}")
                            continue
                        q = QuizQuestion(
                            text=q_data.get("text", ""),
                            options=q_data.get("options", []),
                            correct_answer=q_data.get("correct_answer", ""),
                            explanation=q_data.get("explanation"),
                            question_type=QuestionType.mcq,
                            subject=subj,
                            exam_tag=tag,
                            difficulty=diff,
                            status=QuestionStatus.live,
                            generated_at=datetime.now(timezone.utc),
                        )
                        db.add(q)
                        total_generated += 1
                    db.commit()
                    logger.info(f"Generated {len(questions)} questions for {subj}/{tag}/{diff.value}")
                except Exception as e:
                    logger.error(f"Failed to generate questions for {subj}/{tag}/{diff.value}: {e}")
                    db.rollback()
    finally:
        db.close()

    return f"Generated {total_generated} questions total"


def _call_cerebras(api_key: str, subject: str, exam_tag: str, difficulty: str, count: int) -> List[dict]:
    """Call Cerebras API for question generation with key rotation on retry."""
    prompt = GENERATION_PROMPT.format(
        count=count, subject=subject, exam_tag=exam_tag, difficulty=difficulty
    )

    last_exc = None
    for attempt in range(3):
        try:
            response = httpx.post(
                "https://api.cerebras.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.CEREBRAS_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are an expert exam question writer. Return only valid JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4096,
                },
                timeout=60,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            start = content.find("[")
            end = content.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array found in response")
            return json.loads(content[start:end])
        except Exception as e:
            last_exc = e
            if attempt < 2:
                api_key = _pick_api_key()
                time.sleep(1 + attempt)
    raise last_exc
