"""Send OTP emails via Gmail SMTP. Falls back to console logging if not configured."""
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"


def _read_template() -> str:
    path = TEMPLATE_DIR / "otp_email.html"
    if path.exists():
        return path.read_text(encoding="utf-8")
    logger.warning("OTP email template not found at %s", path)
    return "<html><body><h1>Your OTP: {{otp}}</h1></body></html>"


def _otp_to_html_characters(otp: str) -> str:
    style = (
        "display:inline-block;width:40px;height:52px;"
        "line-height:52px;text-align:center;margin:0 5px;"
        "background:#0A0E1A;border:1.5px solid rgba(255,255,255,0.1);"
        "border-radius:10px;"
        "font-family:Montserrat,sans-serif;font-size:24px;font-weight:700;"
        "color:#FFC857;"
    )
    return "".join(f'<span style="{style}">{ch}</span>' for ch in otp)


def send_otp_email(to_email: str, otp: str) -> bool:
    """Send an OTP email via Gmail SMTP. Logs to console if SMTP not configured."""
    if not settings.EMAIL_USER or not settings.EMAIL_PASS:
        logger.info("=" * 50)
        logger.info("EMAIL OTP for %s: %s", to_email, otp)
        logger.info("=" * 50)
        return True

    try:
        html = _read_template().replace("{{otp_characters}}", _otp_to_html_characters(otp))

        msg = MIMEMultipart("alternative")
        msg["From"] = settings.EMAIL_USER
        msg["To"] = to_email
        msg["Subject"] = "Your Quovex Verification Code"
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            server.sendmail(settings.EMAIL_USER, to_email, msg.as_string())

        logger.info("OTP email sent to %s via Gmail SMTP", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send OTP email to %s: %s", to_email, e)
        return False
