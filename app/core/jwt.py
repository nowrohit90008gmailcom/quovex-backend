"""
JWT utilities for admin dashboard authentication.
Separate from Firebase auth — used only for the admin dashboard login.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8-hour sessions for admins


def create_access_token(subject: str, extra_claims: dict | None = None, *, token_type: str = "admin_dashboard") -> str:
    """
    Create a signed JWT for a user.
    `subject` is the user's UUID (str).
    `token_type` can be "admin_dashboard" or "email_auth".
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": token_type,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT. Returns the payload dict.
    Accepts "admin_dashboard" or "email_auth" token types.
    Raises HTTP 401 on any failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") not in ("admin_dashboard", "email_auth"):
            raise credentials_exception
        subject: str = payload.get("sub")
        if subject is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception
