"""Support router - contact form submissions."""
import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from app.core.security import get_current_user
from app.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support"])


class ContactFormIn(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactFormOut(BaseModel):
    success: bool
    message: str


@router.post("/contact", response_model=ContactFormOut)
async def submit_contact_form(
    body: ContactFormIn,
    current_user: User = Depends(get_current_user),
):
    """Submit a support contact form. Logs the submission."""
    logger.info(
        f"Contact form submitted - user: {current_user.id}, "
        f"name: {body.name}, email: {body.email}, "
        f"subject: {body.subject}, message: {body.message[:100]}..."
    )
    return ContactFormOut(
        success=True,
        message="Your message has been received. We will respond within the indicated timeframe.",
    )
