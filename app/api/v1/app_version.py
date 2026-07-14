"""In-app version check endpoint. Reads from DB AdminSetting or returns defaults."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.limiter import limiter
from app.models import AdminSetting
from app.schemas import AppVersionCheckOut

router = APIRouter(tags=["app"])

DEFAULT_VERSIONS = {
    "latest_version": "1.0.0",
    "min_version": "1.0.0",
    "update_url": "https://api.quovex.online/downloads/app-release.apk",
    "force_update": False,
    "release_notes": "",
}


def _get_setting(db: Session, key: str) -> str | None:
    row = db.execute(select(AdminSetting).where(AdminSetting.key == key)).scalar_one_or_none()
    return row.value if row else None


@router.get("/app/version-check", response_model=AppVersionCheckOut)
@limiter.limit("30/minute")
def version_check(request: Request, db: Session = Depends(get_db)):
    """Return the latest app version info. Admin can override via AdminSetting."""
    latest = _get_setting(db, "app_latest_version") or DEFAULT_VERSIONS["latest_version"]
    min_ver = _get_setting(db, "app_min_version") or DEFAULT_VERSIONS["min_version"]
    url = _get_setting(db, "app_update_url") or DEFAULT_VERSIONS["update_url"]
    force_raw = _get_setting(db, "app_force_update")
    force = force_raw.lower() == "true" if force_raw else DEFAULT_VERSIONS["force_update"]
    notes = _get_setting(db, "app_release_notes") or DEFAULT_VERSIONS["release_notes"]

    return AppVersionCheckOut(
        latest_version=latest,
        min_version=min_ver,
        update_url=url,
        force_update=force,
        release_notes=notes,
    )
