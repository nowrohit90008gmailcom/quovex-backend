"""Seed 241 realistic users from around the world."""
import uuid
import random
from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal
from app.models import User, Session as StudySession, LeaderboardSnapshot
from app.core.constants import EXAM_TAGS_BY_COUNTRY, SUPPORTED_COUNTRIES
from app.models import LeaderboardTrack, LeaderboardScope, LeaderboardPeriod
from app.services.leaderboard_service import compute_leaderboard

random.seed(42)

NOW = datetime.now(timezone.utc)

NAMES_BY_COUNTRY = {
    "India": [
        ("Aarav", "Sharma"), ("Vivaan", "Verma"), ("Aditya", "Patel"), ("Vihaan", "Reddy"),
        ("Arjun", "Kumar"), ("Sai", "Nair"), ("Dhruv", "Singh"), ("Reyansh", "Gupta"),
        ("Ananya", "Das"), ("Diya", "Iyer"), ("Isha", "Menon"), ("Kavya", "Shah"),
        ("Myra", "Joshi"), ("Sara", "Bose"), ("Priya", "Chatterjee"), ("Rohan", "Mehta"),
        ("Amit", "Chakraborty"), ("Neha", "Kapoor"), ("Raj", "Mittal"), ("Pooja", "Yadav"),
        ("Vikram", "Sethi"), ("Anjali", "Rao"), ("Karan", "Malhotra"), ("Ishaan", "Bajaj"),
        ("Kriti", "Saxena"), ("Manish", "Pandey"), ("Swati", "Banerjee"), ("Nikhil", "Ghosh"),
        ("Deepa", "Nanda"), ("Siddharth", "Prasad"),
    ],
    "US": [
        ("James", "Smith"), ("Emma", "Johnson"), ("Liam", "Williams"), ("Olivia", "Brown"),
        ("Noah", "Jones"), ("Ava", "Garcia"), ("Ethan", "Miller"), ("Sophia", "Davis"),
        ("Mason", "Rodriguez"), ("Isabella", "Martinez"), ("Logan", "Anderson"), ("Mia", "Taylor"),
        ("Lucas", "Thomas"), ("Charlotte", "Jackson"), ("Elijah", "White"), ("Amelia", "Harris"),
        ("Oliver", "Clark"), ("Harper", "Lewis"), ("Aiden", "Walker"), ("Evelyn", "Hall"),
        ("Carter", "Allen"), ("Abigail", "Young"), ("Grayson", "King"), ("Emily", "Wright"),
        ("Michael", "Scott"), ("Sarah", "Adams"), ("David", "Baker"), ("Jessica", "Nelson"),
        ("Daniel", "Hill"), ("Ashley", "Campbell"),
    ],
    "UK": [
        ("Oliver", "Smith"), ("George", "Jones"), ("Harry", "Williams"), ("Jack", "Taylor"),
        ("Charlie", "Davies"), ("Thomas", "Evans"), ("Oscar", "Wilson"), ("James", "Thomas"),
        ("William", "Roberts"), ("Henry", "Johnson"), ("Amelia", "Brown"), ("Olivia", "Wright"),
        ("Isla", "Thompson"), ("Emily", "Walker"), ("Poppy", "White"), ("Ava", "Edwards"),
        ("Jessica", "Green"), ("Lily", "Hall"), ("Sophie", "Wood"), ("Grace", "Harris"),
        ("Florence", "Martin"), ("Alice", "Jackson"), ("Charlotte", "Clarke"), ("Freya", "Turner"),
        ("Mia", "Hill"), ("Ella", "Cooper"), ("Lucy", "Ward"), ("Layla", "Cox"),
        ("Rosie", "Baker"), ("Daisy", "Watson"),
    ],
    "Bangladesh": [
        ("Mohammad", "Hossain"), ("Abdul", "Rahman"), ("Md", "Islam"), ("Fahim", "Ahmed"),
        ("Rafiq", "Hasan"), ("Jahid", "Ali"), ("Shahidul", "Khan"), ("Nazmul", "Sarker"),
        ("Tanvir", "Chowdhury"), ("Rubel", "Miah"), ("Farzana", "Akter"), ("Fatima", "Begum"),
        ("Nusrat", "Jahan"), ("Shahida", "Khatun"), ("Rokeya", "Sultana"), ("Sadia", "Islam"),
        ("Nasrin", "Haque"), ("Taslima", "Nasrin"), ("Shamima", "Parvin"), ("Morsheda", "Easmin"),
        ("Sohel", "Rana"), ("Kamal", "Pasha"), ("Azizur", "Rahman"), ("Shafiq", "Uddin"),
        ("Mizanur", "Rahman"), ("Hasan", "Mahmud"), ("Musa", "Ibrahim"), ("Ismail", "Hossain"),
        ("Faruk", "Mia"), ("Shah", "Alam"),
    ],
    "Nigeria": [
        ("Chinedu", "Okafor"), ("Adebayo", "Ogunlade"), ("Chiamaka", "Nwosu"), ("Olusegun", "Adebayo"),
        ("Ngozi", "Okonkwo"), ("Tunde", "Balogun"), ("Funke", "Akinlade"), ("Kelechi", "Ikeji"),
        ("Yetunde", "Olawale"), ("Emeka", "Okeke"), ("Chisom", "Eze"), ("Bolaji", "Ogunbiyi"),
        ("Ifeanyi", "Okoro"), ("Simisola", "Adebayo"), ("Ayodele", "Fashola"), ("Folake", "Ogunlesi"),
        ("Obinna", "Okeke"), ("Adesola", "Akinwande"), ("Chukwudi", "Okpara"), ("Omotola", "Oyedele"),
        ("Uchenna", "Okafor"), ("Titilayo", "Ogun"), ("Chibuzo", "Nwachukwu"), ("Oluwaseun", "Adebayo"),
        ("Chioma", "Okoro"), ("Oluwafemi", "Adeyemi"), ("Ezinne", "Okafor"), ("Tobi", "Ogunbiyi"),
        ("Amara", "Okeke"), ("Somto", "Okafor"),
    ],
}

INSTITUTION_TYPES = ["school", "college", "coaching", "self_study"]

SCHOOL_CLASSES = [f"Class {i}" for i in range(1, 13)]
COLLEGE_YEARS = [f"{i} Year" for i in range(1, 6)]

AGE_RANGES = {
    "school": (10, 18),
    "college": (17, 28),
    "coaching": (15, 25),
    "self_study": (16, 35),
}


def pick_name(country):
    names = NAMES_BY_COUNTRY.get(country, NAMES_BY_COUNTRY["India"])
    return random.choice(names)


def pick_institution_type(age):
    if age >= 14:
        return random.choices(INSTITUTION_TYPES, weights=[3, 3, 2, 1])[0]
    return "school"


def pick_class_or_year(inst_type, age):
    if inst_type == "school":
        cls_num = min(12, max(1, age - 5))
        return f"Class {cls_num}"
    elif inst_type == "college":
        yr = min(5, max(1, age - 16))
        return f"{yr} Year"
    elif inst_type == "coaching":
        cls_num = min(12, max(8, age - 5))
        return f"Class {cls_num}"
    return None


def pick_exam_tags(country, inst_type, class_or_year):
    tags_data = EXAM_TAGS_BY_COUNTRY.get(country, EXAM_TAGS_BY_COUNTRY["India"])
    if inst_type == "school" and class_or_year:
        try:
            cls_num = int(class_or_year.split()[-1])
            if cls_num <= 10:
                available = [t for t in tags_data if t["category"] == "school_board"]
            else:
                available = [t for t in tags_data if t["category"] in ("school_board", "competitive")]
        except (ValueError, IndexError):
            available = tags_data
    elif inst_type == "college":
        available = [t for t in tags_data if t["category"] == "competitive"]
    else:
        available = tags_data
    if not available:
        return None
    count = random.randint(0, min(3, len(available)))
    return [t["tag"] for t in random.sample(available, count)] if count > 0 else None


def make_email(first, last, n):
    domains = ["example.com", "mail.com", "test.org", "demo.net"]
    return f"{first.lower()}.{last.lower()}{n}@{random.choice(domains)}"


def seed_users(total=241):
    db = SessionLocal()
    existing = db.query(User).count()
    if existing > 1:
        print(f"Database already has {existing} users. Skipping seed.")
        db.close()
        return

    countries_pool = []
    for c in ["India", "US", "UK", "Bangladesh", "Nigeria"]:
        names = NAMES_BY_COUNTRY[c]
        ratio = {"India": 80, "US": 60, "UK": 40, "Bangladesh": 36, "Nigeria": 25}[c]
        countries_pool.extend([c] * ratio)
    random.shuffle(countries_pool)
    countries_pool = countries_pool[:total]

    created = []
    for i, country in enumerate(countries_pool):
        first, last = pick_name(country)
        age = random.randint(*AGE_RANGES.get(random.choice(INSTITUTION_TYPES), (10, 35)))
        inst_type = pick_institution_type(age)
        class_or_year = pick_class_or_year(inst_type, age)
        exam_tags = pick_exam_tags(country, inst_type, class_or_year)

        user = User(
            firebase_uid=f"firebase_{uuid.uuid4().hex[:16]}",
            email=make_email(first, last, i),
            display_name=f"{first} {last}",
            full_name=f"{first} {last}",
            age=age,
            country=country,
            state=random.choice([None, "California", "Texas", "Maharashtra", "Karnataka", "Lagos"]) if country == "US" else None,
            institution_type=inst_type,
            institution_name=f"{first}'s {inst_type.title()}" if random.random() > 0.3 else None,
            class_or_year=class_or_year,
            exam_tags=exam_tags,
            points_total=random.randint(100, 50000),
            verified_minutes_total=random.randint(60, 30000),
            quiz_points_total=random.randint(0, 2000),
            verified_quiz_score=random.randint(0, 500),
            streak_count=random.randint(0, 60),
            streak_frozen_until=None if random.random() > 0.1 else NOW + timedelta(hours=random.randint(1, 48)),
            daily_study_target_minutes=random.choice([60, 90, 120, 150, 180, 240]),
            profile_complete=random.random() > 0.15,
            language=random.choice(["en", "hi", "bn", "yo", "ha"]),
            app_lock_enabled=random.random() > 0.5,
            app_lock_credits=random.randint(0, 90),
            locked_app_packages=random.choice([None, ["com.instagram", "com.facebook"], ["com.youtube"]]) if random.random() > 0.5 else None,
            notification_prefs={
                "daily_recap": random.random() > 0.2,
                "streak_reminder": random.random() > 0.1,
                "rank_change": random.random() > 0.3,
                "badge_unlock": random.random() > 0.1,
                "weak_subject_nudge": random.random() > 0.3,
            },
            referral_code=f"USER{uuid.uuid4().hex[:8].upper()}",
            created_at=NOW - timedelta(days=random.randint(1, 180)),
        )
        db.add(user)
        created.append(user)

    db.commit()
    print(f"Seeded {len(created)} users")
    db.close()


def seed_sessions(count_per_user=(0, 15)):
    db = SessionLocal()
    existing = db.query(StudySession).count()
    if existing > 0:
        print(f"Database already has {existing} sessions. Skipping.")
        db.close()
        return

    users = db.query(User).all()
    total = 0
    for user in users:
        num_sessions = random.randint(*count_per_user)
        for _ in range(num_sessions):
            mins_ago = random.randint(30, 60 * 24 * 7)
            start = NOW - timedelta(minutes=mins_ago)
            duration = random.randint(15, 180)
            end = start + timedelta(minutes=duration)
            verified = duration if random.random() > 0.08 else 0
            flagged = random.random() < 0.05
            session = StudySession(
                user_id=user.id,
                mode=random.choice(["focus", "exam", "pomodoro", "custom"]),
                start_time=start,
                end_time=end,
                raw_minutes=duration,
                verified_minutes=verified,
                points_base=verified,
                points_awarded=verified,
                is_active=False,
                flagged=flagged,
                flag_reason="Suspicious pattern" if flagged else None,
                anti_cheat_score=random.random() * 0.4 if not flagged else random.uniform(0.6, 1.0),
                locked_app_count=random.randint(0, 3),
                created_at=start,
            )
            db.add(session)
            total += 1
    db.commit()
    print(f"Seeded {total} study sessions")
    db.close()


def seed_leaderboards():
    db = SessionLocal()
    existing = db.query(LeaderboardSnapshot).count()
    if existing > 0:
        print(f"Database already has {existing} leaderboard snapshots. Skipping.")
        db.close()
        return

    now = datetime.now(timezone.utc)
    tracks_periods = [
        (LeaderboardTrack.study, LeaderboardPeriod.week),
        (LeaderboardTrack.study, LeaderboardPeriod.month),
        (LeaderboardTrack.study, LeaderboardPeriod.all_time),
        (LeaderboardTrack.quiz, LeaderboardPeriod.week),
        (LeaderboardTrack.quiz, LeaderboardPeriod.month),
        (LeaderboardTrack.quiz, LeaderboardPeriod.all_time),
        (LeaderboardTrack.overall, LeaderboardPeriod.week),
        (LeaderboardTrack.overall, LeaderboardPeriod.month),
        (LeaderboardTrack.overall, LeaderboardPeriod.all_time),
    ]

    total = 0
    for track, period in tracks_periods:
        entries = compute_leaderboard(
            db, track, LeaderboardScope.global_,
            period, limit=500,
        )
        for entry in entries:
            snap = LeaderboardSnapshot(
                user_id=uuid.UUID(entry["user_id"]),
                track=track,
                scope=LeaderboardScope.global_,
                period=period,
                rank=entry["rank"],
                verified_minutes=entry.get("score", 0),
                points=entry.get("score", 0),
                country=entry.get("country"),
                exam_tag=entry.get("exam_tag"),
                snapshot_at=now,
                is_frozen=(period == LeaderboardPeriod.month),
            )
            db.add(snap)
            total += 1
    db.commit()
    print(f"Seeded {total} leaderboard snapshots")
    db.close()


if __name__ == "__main__":
    seed_users(241)
    seed_sessions()
    seed_leaderboards()
