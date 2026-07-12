"""Test divergence analysis directly."""
import sys, traceback
from app.db.session import SessionLocal
from app.services.analytics_service import get_divergence_analysis

db = SessionLocal()
try:
    result = get_divergence_analysis(db, days=30)
    print('SUCCESS:', result)
except Exception as e:
    traceback.print_exc()
finally:
    db.close()
