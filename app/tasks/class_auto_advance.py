"""
class_auto_advance.py — Auto-advances school class/college year on April 1st.

Indian academic year ends in March. On April 1st:
  - School students: Class 10 → Class 11, Class 11 → Class 12, etc.
  - College students: 1st Year → 2nd Year, 2nd Year → 3rd Year, etc.
  - Class 12 / Final Year students: flagged as "Passed Out" (admin can review)
  
The task is idempotent — it checks class_auto_advanced_year to avoid
double-advancing users if the job runs more than once.
"""
import logging
from datetime import datetime, timezone

from app.core.constants import next_class as _next_class
from app.db.session import SessionLocal
from app.models import User, InstitutionType
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.class_auto_advance.advance_all_classes")
def advance_all_classes():
    """
    April 1st auto-advance task.

    Advances every user whose:
      - institution_type ∈ {school, college, coaching}
      - class_or_year is set
      - class_auto_advanced_year != current year (idempotent guard)
    """
    now = datetime.now(timezone.utc)
    current_year = now.year

    db = SessionLocal()
    advanced_count = 0
    passed_out_count = 0
    skipped_count = 0

    try:
        # Fetch all users who have a class/year set and are not self-study
        users = (
            db.query(User)
            .filter(
                User.class_or_year.isnot(None),
                User.institution_type.in_([
                    InstitutionType.school,
                    InstitutionType.college,
                    InstitutionType.coaching,
                ])
            )
            .all()
        )

        for user in users:
            # Idempotent guard — skip if already advanced this year
            if user.class_auto_advanced_year == current_year:
                skipped_count += 1
                continue

            new_class, is_passed_out = _next_class(
                user.class_or_year,
                user.institution_type.value if user.institution_type else "",
            )

            old_class = user.class_or_year
            user.class_or_year = new_class
            user.class_auto_advanced_year = current_year

            if is_passed_out:
                passed_out_count += 1
                logger.info(
                    f"User {user.id} ({user.display_name}): PASSED OUT "
                    f"'{old_class}' → '{new_class}'"
                )
            else:
                advanced_count += 1
                logger.info(
                    f"User {user.id} ({user.display_name}): advanced "
                    f"'{old_class}' → '{new_class}'"
                )

        db.commit()
        summary = (
            f"Class auto-advance complete: "
            f"{advanced_count} advanced, {passed_out_count} passed out, "
            f"{skipped_count} skipped (already done this year)"
        )
        logger.info(summary)
        return summary

    except Exception as e:
        db.rollback()
        logger.error(f"class_auto_advance failed: {e}")
        raise
    finally:
        db.close()
