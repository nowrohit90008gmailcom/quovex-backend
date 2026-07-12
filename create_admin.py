"""Create or verify admin accounts for the Quovex dashboard.
Usage:
    python create_admin.py          # uses .env DATABASE_URL
    python create_admin.py sqlite   # forces SQLite (default dev)

Re-runnable — skips existing emails.
"""
import sys
import os
from datetime import datetime, timezone
from pathlib import Path

# Ensure the app module is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))

os.environ.setdefault("ENVIRONMENT", "development")

import bcrypt
from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import Session

# Read .env manually (reliable, no dependency on python-dotenv)
_env_path = Path(__file__).resolve().parent / ".env"
_env_vars = {}
if _env_path.exists():
    for line in _env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            _env_vars[k.strip()] = v.strip()

def _env(key: str, default: str = "") -> str:
    return os.environ.get(key) or _env_vars.get(key, default)

ADMINS = [
    {
        "email": _env("ADMIN_EMAIL_1", "Rohit@Quovex.online"),
        "password": _env("ADMIN_PASSWORD_1", "somehowimetyou"),
        "role": "superadmin",
    },
    {
        "email": _env("ADMIN_EMAIL_2", "Kartikey@Quovex.online"),
        "password": _env("ADMIN_PASSWORD_2", "somehowyouleftme"),
        "role": "superadmin",
    },
]

_any_default = any(
    a["password"] in ("somehowimetyou", "somehowyouleftme")
    and not _env_vars.get("ADMIN_PASSWORD_1")
    and not _env_vars.get("ADMIN_PASSWORD_2")
    for a in ADMINS
)
if _any_default:
    import logging
    logging.warning(
        "Using default admin passwords via env — set ADMIN_PASSWORD_1 / ADMIN_PASSWORD_2 "
        "for production security"
    )


def get_engine():
    force_sqlite = "sqlite" in sys.argv
    if force_sqlite:
        return create_engine("sqlite:///./studytimer.db")

    from app.config import settings
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        return create_engine(url)
    # Convert async URL to sync if needed
    url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    url = url.replace("postgresql+psycopg2://", "postgresql+psycopg2://")  # no-op
    if "+psycopg2" not in url and url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://")
    return create_engine(url)


def main():
    engine = get_engine()
    print(f"Connecting to: {engine.url}")

    # Ensure tables exist
    from app.db.session import Base
    Base.metadata.create_all(bind=engine)

    from app.models import User, AdminRole

    with Session(engine) as db:
        for a in ADMINS:
            existing = db.query(User).filter(func.lower(User.email) == func.lower(a["email"])).first()
            if existing:
                updated = False
                role_val = a["role"]
                if existing.admin_role is None or existing.admin_role.value != role_val:
                    existing.admin_role = AdminRole(role_val)
                    updated = True
                if not existing.firebase_uid:
                    existing.firebase_uid = f"admin-{a['email'].split('@')[0].lower()}"
                    updated = True
                if not bcrypt.checkpw(a["password"].encode(), existing.password_hash.encode()):
                    existing.password_hash = bcrypt.hashpw(a["password"].encode(), bcrypt.gensalt()).decode()
                    updated = True
                if updated:
                    db.commit()
                    print(f"[OK] Updated {a['email']}")
                else:
                    print(f"[OK] {a['email']} already up to date -- skipping")
                continue

            user = User(
                email=a["email"],
                display_name=a["email"].split("@")[0],
                password_hash=bcrypt.hashpw(a["password"].encode(), bcrypt.gensalt()).decode(),
                admin_role=AdminRole(a["role"]),
                firebase_uid=f"admin-{a['email'].split('@')[0].lower()}",
                country="IN",
                exam_tags=["JEE"],
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            db.commit()
            print(f"[OK] Created {a['email']} as {a['role']}")

    print("\nDone. You can now log in at https://admin.quovex.online")


if __name__ == "__main__":
    main()
