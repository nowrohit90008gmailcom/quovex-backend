"""OTP generation and verification (Redis-backed with TTL + DB audit logging)."""
import hashlib
import random
import time
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import func
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
    email_clean = email.lower().strip()
    otp = ''.join(str(random.randint(0, 9)) for _ in range(OTP_LENGTH))
    r = _get_redis()
    if r is not None:
        r.setex(f"otp:{email_clean}", OTP_TTL_SECONDS, otp)
    else:
        raise RuntimeError("Redis unavailable — cannot generate OTP")
    if db is not None:
        log = OTPLog(
            email=email_clean,
            otp_hash=_hash_otp(otp),
            ip_address=ip_address,
        )
        db.add(log)
        db.commit()
    return otp


def verify_otp(email: str, otp: str, db: Optional[DBSession] = None) -> bool:
    email_clean = email.lower().strip()
    otp_clean = otp.strip()

    r = _get_redis()
    stored = r.get(f"otp:{email_clean}") if r is not None else None
    if stored and stored == otp_clean:
        if r is not None:
            r.delete(f"otp:{email_clean}")
        if db is not None:
            log = db.query(OTPLog).filter(
                func.lower(OTPLog.email) == email_clean,
                OTPLog.verified == False,
            ).order_by(OTPLog.created_at.desc()).first()
            if log:
                log.verified = True
                log.verified_at = datetime.now(timezone.utc)
                db.commit()
        return True

    # DB Fallback — check if OTP matches recent unverified audit log
    if db is not None:
        from datetime import timedelta
        target_hash = _hash_otp(otp_clean)
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=OTP_TTL_SECONDS)
        log = db.query(OTPLog).filter(
            func.lower(OTPLog.email) == email_clean,
            OTPLog.otp_hash == target_hash,
            OTPLog.verified == False,
            OTPLog.created_at >= cutoff,
        ).order_by(OTPLog.created_at.desc()).first()
        if log:
            log.verified = True
            log.verified_at = datetime.now(timezone.utc)
            db.commit()
            if r is not None:
                r.delete(f"otp:{email_clean}")
            return True

    return False
