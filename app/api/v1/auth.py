"""Auth router - handles user registration/profile via Firebase tokens,
and admin dashboard login via email + password (JWT)."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from fastapi import Request

from app.core.security import get_current_user, verify_firebase_token, get_or_create_user
from app.core.jwt import create_access_token
from app.core.constants import SUPPORTED_COUNTRIES, get_filtered_tags
from app.db.session import get_db
from app.models import User, AdminRole
from app.schemas import AuthTokenIn, AuthFirebaseIn, AuthOut, UserProfileOut, UserUpdateIn
from app.services.otp_service import generate_otp, verify_otp
from app.services.email_service import send_otp_email
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


# ─── Admin Dashboard Login ────────────────────────────────────────────────────

class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str


class AdminLoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileOut


@router.post("/admin-login", response_model=AdminLoginOut)
@limiter.limit("5/minute")
async def admin_login(body: AdminLoginIn, request: Request, db: Session = Depends(get_db)):
    """
    Email + password login for the admin dashboard.
    Returns a signed JWT (not a Firebase token).
    Only works for users with an admin_role set.
    """
    from passlib.context import CryptContext
    import os

    pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = db.query(User).filter(User.email == body.email).first()

    # Dev mode shortcut: allow login with password "dev" if no password set
    dev_mode = os.environ.get("ENVIRONMENT", "development") == "development"

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.admin_role is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access only")

    if user.is_banned:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended")

    # Verify password
    if user.password_hash:
        if not pwd_ctx.verify(body.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    elif dev_mode and body.password == "dev":
        # Dev mode: no password set yet, accept "dev" as password
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No password set for this admin account. Contact the system administrator."
        )

    token = create_access_token(str(user.id), extra_claims={"role": user.admin_role.value if user.admin_role else None})

    return AdminLoginOut(
        access_token=token,
        user=UserProfileOut.model_validate(user),
    )


# ─── Email OTP Login ──────────────────────────────────────────────────────────

class SendOtpIn(BaseModel):
    email: EmailStr

class SendOtpOut(BaseModel):
    success: bool
    message: str
    otp: Optional[str] = None  # only returned in development mode

class VerifyOtpIn(BaseModel):
    email: EmailStr
    otp: str
    referral_code: Optional[str] = None

class VerifyOtpOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileOut


@router.post("/send-otp", response_model=SendOtpOut)
@limiter.limit("5/minute")
async def send_otp(body: SendOtpIn, request: Request, db: Session = Depends(get_db)):
    """Generate and send a 6-digit OTP to the given email."""
    otp = generate_otp(body.email, db=db, ip_address=request.client.host if request.client else None)
    sent = send_otp_email(body.email, otp)
    from app.config import settings
    return SendOtpOut(
        success=sent,
        message="OTP sent to email" if sent else "Failed to send OTP",
        otp=otp if settings.ENVIRONMENT == "development" else None,
    )


@router.post("/verify-otp", response_model=VerifyOtpOut)
@limiter.limit("5/minute")
async def verify_otp_endpoint(body: VerifyOtpIn, request: Request, db: Session = Depends(get_db)):
    """Verify OTP and return a JWT for the authenticated user."""
    if not verify_otp(body.email, body.otp, db=db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired OTP")

    from app.core.security import get_or_create_user
    firebase_uid = f"email:{body.email}"
    user = get_or_create_user(db, firebase_uid, body.email, body.email.split("@")[0], body.referral_code)

    if user.is_banned:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended")

    token = create_access_token(str(user.id), token_type="email_auth")

    return VerifyOtpOut(
        access_token=token,
        user=UserProfileOut.model_validate(user),
    )


# ─── Public metadata endpoints ───────────────────────────────────────────────

class SupportedCountryOut(BaseModel):
    countries: list[str]


class CountryExamTagOut(BaseModel):
    tag: str
    category: str
    country: str


@router.get("/supported-countries", response_model=SupportedCountryOut)
async def get_supported_countries():
    """Get list of supported countries for exam tag filtering."""
    return SupportedCountryOut(countries=SUPPORTED_COUNTRIES)


@router.get("/country-exam-tags", response_model=list[CountryExamTagOut])
async def get_country_exam_tags(
    country: str = "",
    education_level: str = "",
):
    """Get exam tags filtered by country and education level."""
    tags = get_filtered_tags(country=country or None, education_level=education_level or None)
    return [CountryExamTagOut(**t) for t in tags]


# ─── Mobile App Login (Firebase) ─────────────────────────────────────────────

@router.post("/login", response_model=AuthOut)
async def login(body: AuthTokenIn, db: Session = Depends(get_db)):
    """
    Verify Firebase token and return the user profile.
    Creates a new user if this is first login.
    """
    payload = verify_firebase_token(body.firebase_token)
    firebase_uid = payload.get("uid")
    email = payload.get("email")
    display_name = payload.get("name")

    user = get_or_create_user(db, firebase_uid, email, display_name, body.referral_code)

    if user.is_banned:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended")

    if body.device_id and not user.device_id:
        user.device_id = body.device_id
        db.commit()
        db.refresh(user)

    return AuthOut(user=UserProfileOut.model_validate(user))


@router.post("/firebase", response_model=AuthOut)
async def firebase_login(
    body: AuthFirebaseIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sync Firebase user to backend after Firebase Auth sign-in.
    Used by the Flutter app after Google Sign-In or Email+OTP.
    """
    is_new_user = not current_user.firebase_uid
    if body.display_name and body.display_name != current_user.display_name:
        current_user.display_name = body.display_name
    if body.email and body.email != current_user.email:
        current_user.email = body.email
    if body.avatar_url and body.avatar_url != current_user.avatar_url:
        current_user.avatar_url = body.avatar_url
    if not current_user.firebase_uid and body.firebase_uid:
        current_user.firebase_uid = body.firebase_uid
    if is_new_user and body.referral_code and not current_user.referred_by_id:
        from app.core.security import _ensure_referral_code
        referrer = db.query(User).filter(User.referral_code == body.referral_code).first()
        if referrer and referrer.id != current_user.id:
            current_user.referred_by_id = referrer.id
            current_user.points_total += 100
        _ensure_referral_code(current_user, db)
    db.commit()
    db.refresh(current_user)

    return AuthOut(user=UserProfileOut.model_validate(current_user))


# ─── Profile ─────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfileOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return UserProfileOut.model_validate(current_user)


@router.patch("/me", response_model=UserProfileOut)
async def update_me(
    body: UserUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile (name, country, exam tags, etc.)."""
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserProfileOut.model_validate(current_user)
