"""OTP generation and verification (in-memory with TTL + DB audit logging)."""
import hashlib
import random
import time
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session as DBSession

from app.models import OTPLog

_otp_store: dict[str, dict] = {}

OTP_LENGTH = 6
OTP_TTL_SECONDS = 600


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def generate_otp(email: str, db: Optional[DBSession] = None, ip_address: Optional[str] = None) -> str:
    otp = ''.join(str(random.randint(0, 9)) for _ in range(OTP_LENGTH))
    _otp_store[email] = {
        "otp": otp,
        "expires_at": time.time() + OTP_TTL_SECONDS,
    }
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
    entry = _otp_store.pop(email, None)
    if entry is None:
        return False
    if time.time() > entry["expires_at"]:
        return False
    is_valid = entry["otp"] == otp
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


def cleanup_expired():
    now = time.time()
    expired = [k for k, v in _otp_store.items() if v["expires_at"] < now]
    for k in expired:
        del _otp_store[k]
