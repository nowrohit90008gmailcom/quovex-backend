"""DB-backed admin settings service."""
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models import AdminSetting


def get_setting(db: Session, key: str, default: str) -> str:
    """Read a single setting from DB, falling back to default."""
    row = db.query(AdminSetting).filter(AdminSetting.key == key).first()
    return row.value if row else default


def set_setting(db: Session, key: str, value: str):
    """Upsert a single setting."""
    row = db.query(AdminSetting).filter(AdminSetting.key == key).first()
    if row:
        row.value = value
    else:
        db.add(AdminSetting(key=key, value=value))
    db.commit()


def get_all_settings(db: Session, defaults: Dict[str, str]) -> Dict[str, str]:
    """Return defaults overridden by any DB-stored values."""
    result = dict(defaults)
    rows = db.query(AdminSetting).all()
    for row in rows:
        result[row.key] = row.value
    return result


def update_settings(db: Session, updates: Dict[str, str]):
    """Batch upsert settings."""
    for key, value in updates.items():
        row = db.query(AdminSetting).filter(AdminSetting.key == key).first()
        if row:
            row.value = value
        else:
            db.add(AdminSetting(key=key, value=value))
    db.commit()


def get_all_as_flat_dict(db: Session) -> Dict[str, str]:
    """Get all settings as a plain dict (no defaults)."""
    return {row.key: row.value for row in db.query(AdminSetting).all()}
