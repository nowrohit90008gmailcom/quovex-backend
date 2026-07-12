"""Analytics service - revenue, DAU, geo, retention, and divergence monitoring."""
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.models import AdRevenueLog, Session as SessionModel, User


def get_revenue_by_placement(
    db: Session,
    days: int = 30,
) -> List[dict]:
    """Revenue broken down by placement type over the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    is_pg = "postgresql" in str(db.bind.url) if db.bind else False
    # BUG FIX: On SQLite, func.date/strftime returns a string, but SQLAlchemy
    # tries to apply the Date column processor (fromisoformat) on it → TypeError.
    # Fix: cast to String to bypass the Date type coercion.
    if is_pg:
        day_expr = func.date_trunc("day", AdRevenueLog.date).label("day")
    else:
        from sqlalchemy import cast, String
        day_expr = cast(func.strftime("%Y-%m-%d", AdRevenueLog.date), String).label("day")
    
    rows = (
        db.query(
            day_expr,
            AdRevenueLog.placement_type,
            func.sum(AdRevenueLog.estimated_revenue_usd).label("revenue"),
            func.sum(AdRevenueLog.impressions).label("impressions"),
        )
        .filter(AdRevenueLog.date >= since)
        .group_by("day", AdRevenueLog.placement_type)
        .order_by("day")
        .all()
    )
    return [
        {
            "day": str(r.day)[:10],
            "placement_type": r.placement_type,
            "revenue_usd": float(r.revenue or 0),
            "impressions": int(r.impressions or 0),
        }
        for r in rows
    ]


def get_geo_breakdown(db: Session, days: int = 30) -> List[dict]:
    """DAU and revenue by country over the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    dau_by_country = (
        db.query(
            User.country,
            func.count(func.distinct(SessionModel.user_id)).label("dau"),
            func.sum(SessionModel.verified_minutes).label("total_minutes"),
        )
        .join(User, SessionModel.user_id == User.id)
        .filter(SessionModel.start_time >= since)
        .group_by(User.country)
        .order_by(func.count(func.distinct(SessionModel.user_id)).desc())
        .all()
    )

    revenue_by_country = (
        db.query(
            AdRevenueLog.country,
            func.sum(AdRevenueLog.estimated_revenue_usd).label("revenue"),
            func.sum(AdRevenueLog.impressions).label("impressions"),
        )
        .filter(AdRevenueLog.date >= since)
        .group_by(AdRevenueLog.country)
        .order_by(func.sum(AdRevenueLog.estimated_revenue_usd).desc())
        .all()
    )

    result = []
    for row in dau_by_country:
        country = row.country or "Unknown"
        rev_row = next((r for r in revenue_by_country if r.country == country), None)
        result.append({
            "country": country,
            "dau": row.dau,
            "total_minutes": int(row.total_minutes or 0),
            "revenue_usd": float(rev_row.revenue) if rev_row else 0,
            "impressions": int(rev_row.impressions) if rev_row else 0,
        })

    for row in revenue_by_country:
        if not any(r["country"] == row.country for r in result):
            result.append({
                "country": row.country or "Unknown",
                "dau": 0,
                "total_minutes": 0,
                "revenue_usd": float(row.revenue or 0),
                "impressions": int(row.impressions or 0),
            })

    return result


def get_divergence_analysis(db: Session, days: int = 30) -> dict:
    """Compare points vs verified-minutes trends to detect ad-grinding."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    is_pg = "postgresql" in str(db.bind.url) if db.bind else False
    # BUG FIX: On SQLite, strftime returns a raw string. SQLAlchemy's Date column
    # processor tries to call fromisoformat on it → TypeError.
    # Fix: cast to String so SQLAlchemy skips the Date coercion step.
    if is_pg:
        day_expr = func.date_trunc("day", SessionModel.start_time).label("day")
    else:
        from sqlalchemy import cast, String
        day_expr = cast(func.strftime("%Y-%m-%d", SessionModel.start_time), String).label("day")

    rows = (
        db.query(
            day_expr,
            func.sum(SessionModel.verified_minutes).label("total_minutes"),
            func.sum(SessionModel.points_awarded).label("total_points"),
            func.count(func.distinct(SessionModel.user_id)).label("users"),
        )
        .filter(SessionModel.start_time >= since, SessionModel.is_active == False)
        .group_by("day")
        .order_by("day")
        .all()
    )

    daily = [
        {
            "day": str(r.day)[:10] if r.day else None,
            "verified_minutes": int(r.total_minutes or 0),
            "points_awarded": int(r.total_points or 0),
            "active_users": r.users,
        }
        for r in rows
    ]

    total_minutes = sum(d["verified_minutes"] for d in daily)
    total_points = sum(d["points_awarded"] for d in daily)
    ratio = total_points / total_minutes if total_minutes > 0 else 0

    return {
        "daily_trend": daily,
        "total_verified_minutes": total_minutes,
        "total_points_awarded": total_points,
        "points_per_minute_ratio": round(ratio, 4),
        "alert": ratio > 2.0,
        "alert_message": "Points-to-minutes ratio is abnormally high — possible ad-grinding" if ratio > 2.0 else None,
    }
