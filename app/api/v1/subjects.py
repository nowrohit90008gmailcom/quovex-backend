"""Grade/Tag subjects API — public read + admin CRUD for class/subject selection."""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from app.core.security import get_current_admin
from app.db.session import get_db
from app.models import GradeSubject
from app.schemas import GradeSubjectCreateIn, GradeSubjectUpdateIn, GradeSubjectOut

# ─── Public router (no auth) ───────────────────────────────────────────────────

public_router = APIRouter(prefix="/subjects", tags=["subjects"])


@public_router.get("", response_model=List[GradeSubjectOut])
async def list_subjects(
    grade_or_tag: str = Query(..., description="e.g. Class 6, JEE Main"),
    db: DBSession = Depends(get_db),
):
    """Get subjects for a given grade/class/year or exam tag."""
    subjects = (
        db.query(GradeSubject)
        .filter(GradeSubject.grade_or_tag == grade_or_tag)
        .order_by(GradeSubject.display_order)
        .all()
    )
    return [GradeSubjectOut.model_validate(s) for s in subjects]


@public_router.get("/grades", response_model=List[str])
async def list_distinct_grades(
    db: DBSession = Depends(get_db),
):
    """Get all distinct grade_or_tag values."""
    rows = (
        db.query(GradeSubject.grade_or_tag)
        .distinct()
        .order_by(GradeSubject.grade_or_tag)
        .all()
    )
    return [r[0] for r in rows]


# ─── Admin router (auth required) ──────────────────────────────────────────────

router = APIRouter(prefix="/admin/subjects", tags=["admin-subjects"])


@router.get("", response_model=List[GradeSubjectOut])
async def admin_list_subjects(
    grade_or_tag: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """List all grade subjects, optionally filtered by grade/tag."""
    query = db.query(GradeSubject)
    if grade_or_tag:
        query = query.filter(GradeSubject.grade_or_tag == grade_or_tag)
    query = query.order_by(GradeSubject.grade_or_tag, GradeSubject.display_order)
    return [GradeSubjectOut.model_validate(s) for s in query.all()]


@router.get("/grades", response_model=List[str])
async def admin_list_distinct_grades(
    db: DBSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Get all distinct grade_or_tag values for admin filter dropdown."""
    rows = (
        db.query(GradeSubject.grade_or_tag)
        .distinct()
        .order_by(GradeSubject.grade_or_tag)
        .all()
    )
    return [r[0] for r in rows]


@router.post("", response_model=GradeSubjectOut)
async def create_subject(
    body: GradeSubjectCreateIn,
    db: DBSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Create a new subject for a grade/tag."""
    existing = (
        db.query(GradeSubject)
        .filter(
            GradeSubject.grade_or_tag == body.grade_or_tag,
            GradeSubject.subject_name == body.subject_name,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Subject already exists for this grade/tag")
    subject = GradeSubject(
        grade_or_tag=body.grade_or_tag,
        subject_name=body.subject_name,
        display_order=body.display_order,
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return GradeSubjectOut.model_validate(subject)


@router.put("/{subject_id}", response_model=GradeSubjectOut)
async def update_subject(
    subject_id: UUID,
    body: GradeSubjectUpdateIn,
    db: DBSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Update a subject's name or display order."""
    subject = db.query(GradeSubject).filter(GradeSubject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    if body.subject_name is not None:
        subject.subject_name = body.subject_name
    if body.display_order is not None:
        subject.display_order = body.display_order
    db.commit()
    db.refresh(subject)
    return GradeSubjectOut.model_validate(subject)


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: UUID,
    db: DBSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Delete a subject."""
    subject = db.query(GradeSubject).filter(GradeSubject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"deleted": str(subject_id)}
