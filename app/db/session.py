import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

_db_url = settings.DATABASE_URL
if _db_url.startswith("sqlite:///./"):
    _rel = _db_url[len("sqlite:///./"):]
    _abs = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", _rel))
    _db_url = f"sqlite:///{_abs}"

connect_args = {"check_same_thread": False} if _db_url.startswith("sqlite") else {}
kwargs = {} if _db_url.startswith("sqlite") else {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 10,
    "max_overflow": 20,
}
engine = create_engine(
    _db_url,
    connect_args=connect_args,
    **kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
