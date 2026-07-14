"""OTP generation and verification (Redis-backed with TTL + DB audit logging)."""
import hashlib
import random
import time
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session as DBSession

from app.config import settings
from app.models import OTPLog

OTP_LENGTH = 6
OTP_TTL_SECONDS = 600


def _get_redis():
    try:
        import redis as _redis
        return _redis.from_url(settings.REDIS_URL, decode_responses=True)
    except Exception:
        return None


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def generate_otp(email: str, db: Optional[DBSession] = None, ip_address: Optional[str] = None) -> str:
    otp = ''.join(str(random.randint(0, 9)) for _ in range(OTP_LENGTH))
    r = _get_redis()
    if r is not None:
        r.setex(f"otp:{email}", OTP_TTL_SECONDS, otp)
    else:
        raise RuntimeError("Redis unavailable — cannot generate OTP")
    if db is not None:
        log = OTPLog(
            email=email,
            otp_hash=_hash_otp(otp),
            ip_address=ip_address,
        )
        db.add(log)
        db.commit()
    return otp


def verify_otp(email: str, otp: str, db: Optional[DBSession] = None) -> bool:
    r = _get_redis()
    if r is None:
        return False
    stored = r.get(f"otp:{email}")
    if stored is None:
        return False
    r.delete(f"otp:{email}")
    is_valid = stored == otp
    if db is not None and is_valid:
        log = db.query(OTPLog).filter(
            OTPLog.email == email,
            OTPLog.verified == False,
        ).order_by(OTPLog.created_at.desc()).first()
        if log:
            log.verified = True
            log.verified_at = datetime.now(timezone.utc)
            db.commit()
    return is_valid
