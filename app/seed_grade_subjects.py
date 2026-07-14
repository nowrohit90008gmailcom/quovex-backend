"""Seed grade_subjects table from constants.py SUBJECTS dict + school defaults."""
from app.db.session import SessionLocal
from app.models import GradeSubject
from app.core.constants import SCHOOL_CLASS_SEQUENCE, COLLEGE_YEAR_SEQUENCE


def get_school_defaults():
    """Subjects per school grade for grades not covered by exam tags."""
    return {
        "Class 1": ["Mathematics", "English", "Hindi", "Environmental Studies", "General Knowledge"],
        "Class 2": ["Mathematics", "English", "Hindi", "Environmental Studies", "General Knowledge"],
        "Class 3": ["Mathematics", "English", "Hindi", "Science", "Social Studies"],
        "Class 4": ["Mathematics", "English", "Hindi", "Science", "Social Studies"],
        "Class 5": ["Mathematics", "English", "Hindi", "Science", "Social Studies"],
        "Class 6": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
        "Class 7": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
        "Class 8": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
        "Class 9": ["Mathematics", "Science", "Social Science", "English"],
        "Class 10": ["Mathematics", "Science", "Social Science", "English"],
        "Class 11": ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
        "Class 12": ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
    }


def get_exam_tag_subjects():
    """Subjects from constants.py SUBJECTS dict."""
    from app.core.constants import SUBJECTS
    return SUBJECTS


def seed(all_roots=False):
    db = SessionLocal()
    existing = db.query(GradeSubject).count()
    if existing > 0 and not all_roots:
        print(f"grade_subjects table already has {existing} rows. Skipping seed.")
        print("Pass all_roots=True to re-seed.")
        db.close()
        return

    if all_roots and existing > 0:
        db.query(GradeSubject).delete()

    entries = []

    # 1. School grade defaults
    for grade, subjects in get_school_defaults().items():
        for i, subj in enumerate(subjects):
            entries.append(GradeSubject(
                grade_or_tag=grade,
                subject_name=subj,
                display_order=i + 1,
            ))

    # 2. Exam tag subjects
    for tag, subjects in get_exam_tag_subjects().items():
        for i, subj in enumerate(subjects):
            entries.append(GradeSubject(
                grade_or_tag=tag,
                subject_name=subj,
                display_order=i + 1,
            ))

    # 3. College years (empty — admins populate)
    for year in COLLEGE_YEAR_SEQUENCE:
        pass  # No default subjects for college years

    db.bulk_save_objects(entries)
    db.commit()
    print(f"Seeded {len(entries)} grade_subjects entries")
    db.close()


if __name__ == "__main__":
    seed(all_roots=False)
