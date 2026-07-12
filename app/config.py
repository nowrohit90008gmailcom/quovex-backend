from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "Quovex API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    DATABASE_URL: str = "sqlite:///./studytimer.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    FIREBASE_PROJECT_ID: str = "quovex-84b14"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"
    FIREBASE_SERVICE_ACCOUNT_JSON: Optional[str] = ""
    CEREBRAS_API_KEY: str = ""
    CEREBRAS_API_KEYS: str = ""
    CEREBRAS_MODEL: str = "llama3.1-8b-instruct"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    STRIPE_SECRET_KEY: str = ""
    REWARD_BUDGET_CAP_PERCENT: int = 35
    BASE_POINTS_PER_HOUR: int = 100
    DIMINISHING_RETURNS_AFTER_HOURS: int = 6
    MAX_DAILY_HOURS_FLAG: int = 12
    SOCIAL_UNLOCK_MINUTES_PER_HOUR: int = 15
    SOCIAL_UNLOCK_AD_BONUS_MINUTES: int = 5
    SOCIAL_UNLOCK_AD_COOLDOWN_HOURS: int = 2
    APP_LOCK_MAX_CREDITS: int = 90
    APP_LOCK_CREDITS_PER_HOUR: int = 15
    APP_LOCK_UNLOCK_MINUTES: int = 15
    APP_LOCK_AD_UNLOCK_MINUTES: int = 5
    APP_LOCK_MAX_AD_UNLOCKS_PER_HOUR: int = 2
    EMAIL_HOST: str = ""
    EMAIL_PORT: int = 587
    EMAIL_USER: str = ""
    EMAIL_PASS: str = ""
    BREVO_API_KEY: str = ""
    FROM_EMAIL: str = ""
    QUIZ_SET_SIZE: int = 10
    QUIZ_QUESTION_TIME_LIMIT_SECONDS: int = 25
    MAX_QUIZ_ATTEMPTS_PER_SUBJECT_PER_DAY: int = 5

    UPLOAD_DIR: str = "/app/uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
