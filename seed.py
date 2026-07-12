#!/usr/bin/env python3
"""
seed.py — Populate the StudyTimer database with realistic seed data.
Run: docker exec -it studytimer_backend python seed.py
  OR: python seed.py  (from backend root with DB running)
"""
import asyncio
import uuid
import random
import math
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.core.constants import EXAM_TAGS_BY_COUNTRY, SUBJECTS
from app.models import (
    User, Session as StudySession, QuizQuestion, QuizSession, QuizAnswer,
    LeaderboardSnapshot, Reward, AdRevenueLog, UserSubjectProficiency,
    StudyMode, QuestionType, QuestionStatus, Difficulty,
    LeaderboardTrack, LeaderboardScope, LeaderboardPeriod,
    RewardStatus, RewardType, AdminRole,
)
from app.db.session import Base

# ─── Config ───────────────────────────────────────────────────────────────────

SEED_USERS = 50
SEED_DAYS_BACK = 60   # generate 60 days of historical data
NOW = datetime.now(tz=timezone.utc)

COUNTRIES = ["India"] * 35 + ["US"] * 6 + ["UK"] * 4 + ["Bangladesh"] * 3 + ["Nigeria"] * 2

FIRST_NAMES = [
    "Priya", "Rohan", "Aisha", "Dev", "Meera", "Arjun", "Sunita", "Vijay",
    "Pooja", "Ravi", "Kavitha", "Nikhil", "Divya", "Rajesh", "Anita",
    "Suresh", "Lakshmi", "Kiran", "Sanjay", "Uma", "Rahul", "Shreya",
    "Amit", "Nisha", "Vikram", "Deepa", "Sanjana", "Akash", "Pallavi",
    "Harsh", "Neha", "Yash", "Swati", "Tarun", "Ritu", "Manish", "Anjali",
    "Gaurav", "Prerna", "Varun", "Sneha", "Aarav", "Simran", "Kartik",
    "Ishaan", "Aditi", "Siddharth", "Tanvi", "Abhishek", "Komal",
]
LAST_NAMES = [
    "Sharma", "Mehta", "Khan", "Kumar", "Patel", "Singh", "Rao", "Iyer",
    "Nair", "Verma", "Gupta", "Joshi", "Reddy", "Chatterjee", "Malhotra",
    "Kapoor", "Mishra", "Agarwal", "Das", "Shah", "Bose", "Tiwari",
    "Pandey", "Pillai", "Srivastava", "Bhatt", "Saxena", "Bajaj", "Kohli",
    "Anand", "Choudhury", "Dubey", "Ghosh", "Khanna", "Menon", "Nanda",
    "Oberoi", "Prasad", "Rana", "Shetty", "Tyagi", "Upadhyay", "Vyas",
    "Yadav", "Zaveri", "Banerjee", "Chakraborty", "Datta", "Goswami", "Halder",
]

QUIZ_QUESTIONS_RAW = [
    # Physics – JEE
    {"text": "A body is thrown vertically upward with initial velocity u. The maximum height attained is:", "options": ["u/g", "u²/2g", "2u²/g", "u²/g"], "correct": "u²/2g", "explanation": "At maximum height v=0. Using v²=u²−2gh → h = u²/2g.", "subject": "Physics", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "The SI unit of electric field intensity is:", "options": ["C/m", "N/C", "J/C", "V·m"], "correct": "N/C", "explanation": "Electric field = Force/Charge = N/C (equivalent to V/m).", "subject": "Physics", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "Which law states that the total EMF in a closed loop equals the total potential drop?", "options": ["Faraday's Law", "Kirchhoff's Voltage Law", "Ohm's Law", "Ampere's Law"], "correct": "Kirchhoff's Voltage Law", "explanation": "KVL: sum of EMFs = sum of potential drops in any closed loop.", "subject": "Physics", "exam_tag": "JEE", "difficulty": "medium", "type": "mcq"},
    {"text": "A particle moves in a circle of radius R with constant speed v. The centripetal acceleration is:", "options": ["v/R", "v²/R", "vR", "v²R"], "correct": "v²/R", "explanation": "Centripetal acceleration a = v²/R directed towards the centre.", "subject": "Physics", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "According to the photoelectric effect, the maximum kinetic energy of emitted electrons depends on:", "options": ["Intensity of light", "Frequency of light", "Speed of light", "Amplitude of light"], "correct": "Frequency of light", "explanation": "KEmax = hf − φ; kinetic energy depends on frequency, not intensity.", "subject": "Physics", "exam_tag": "JEE", "difficulty": "medium", "type": "mcq"},
    {"text": "The de Broglie wavelength of an electron moving with velocity v is proportional to:", "options": ["v", "1/v", "v²", "1/v²"], "correct": "1/v", "explanation": "λ = h/mv; wavelength is inversely proportional to velocity.", "subject": "Physics", "exam_tag": "JEE", "difficulty": "hard", "type": "mcq"},
    {"text": "Two capacitors of capacitance C each are connected in series. The equivalent capacitance is:", "options": ["2C", "C", "C/2", "4C"], "correct": "C/2", "explanation": "For series: 1/Ceq = 1/C + 1/C = 2/C → Ceq = C/2.", "subject": "Physics", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    # Chemistry – JEE / NEET
    {"text": "Which element has the highest electronegativity?", "options": ["Oxygen", "Nitrogen", "Fluorine", "Chlorine"], "correct": "Fluorine", "explanation": "Fluorine has the highest electronegativity (3.98) on the Pauling scale.", "subject": "Chemistry", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "The IUPAC name of CH₃–CH₂–OH is:", "options": ["Methanol", "Ethanol", "Propanol", "Butanol"], "correct": "Ethanol", "explanation": "Two carbons + OH group → Ethanol.", "subject": "Chemistry", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "Which type of isomerism is shown by compounds with the same molecular formula but different functional groups?", "options": ["Chain isomerism", "Position isomerism", "Functional group isomerism", "Metameric isomerism"], "correct": "Functional group isomerism", "explanation": "Different functional groups with same molecular formula is functional group isomerism.", "subject": "Chemistry", "exam_tag": "JEE", "difficulty": "medium", "type": "mcq"},
    {"text": "The hybridisation of carbon in diamond is:", "options": ["sp", "sp²", "sp³", "sp³d"], "correct": "sp³", "explanation": "Each carbon in diamond forms 4 sigma bonds → sp³ hybridisation.", "subject": "Chemistry", "exam_tag": "NEET", "difficulty": "easy", "type": "mcq"},
    {"text": "The process by which plants synthesize glucose from CO₂ and H₂O using sunlight is:", "options": ["Respiration", "Transpiration", "Photosynthesis", "Fermentation"], "correct": "Photosynthesis", "explanation": "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ using light energy.", "subject": "Biology", "exam_tag": "NEET", "difficulty": "easy", "type": "mcq"},
    {"text": "Which organelle is known as the powerhouse of the cell?", "options": ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], "correct": "Mitochondria", "explanation": "Mitochondria produce ATP via cellular respiration, earning the 'powerhouse' title.", "subject": "Biology", "exam_tag": "NEET", "difficulty": "easy", "type": "mcq"},
    {"text": "The four nitrogenous bases present in DNA are:", "options": ["A, T, G, C", "A, U, G, C", "A, T, G, U", "U, T, G, C"], "correct": "A, T, G, C", "explanation": "DNA contains Adenine, Thymine, Guanine, Cytosine. RNA has Uracil instead of Thymine.", "subject": "Biology", "exam_tag": "NEET", "difficulty": "easy", "type": "mcq"},
    # Mathematics
    {"text": "The derivative of sin(x) with respect to x is:", "options": ["-cos(x)", "cos(x)", "-sin(x)", "tan(x)"], "correct": "cos(x)", "explanation": "d/dx[sin(x)] = cos(x) — a fundamental calculus result.", "subject": "Mathematics", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "If f(x) = x³ − 3x² + 2x − 1, then f′(x) is:", "options": ["3x² − 6x + 2", "3x² + 6x − 2", "x² − 2x + 2", "3x − 6"], "correct": "3x² − 6x + 2", "explanation": "Using power rule: d/dx[x³]=3x², d/dx[3x²]=6x, d/dx[2x]=2.", "subject": "Mathematics", "exam_tag": "JEE", "difficulty": "medium", "type": "mcq"},
    {"text": "∫x²dx equals:", "options": ["2x", "x³/3 + C", "x²/2 + C", "3x³ + C"], "correct": "x³/3 + C", "explanation": "∫xⁿdx = xⁿ⁺¹/(n+1) + C; for n=2: x³/3 + C.", "subject": "Mathematics", "exam_tag": "JEE", "difficulty": "easy", "type": "mcq"},
    {"text": "The number of solutions of sin(x) = 1 in [0, 2π] is:", "options": ["0", "1", "2", "Infinite"], "correct": "1", "explanation": "sin(x)=1 at x=π/2 only in [0,2π].", "subject": "Mathematics", "exam_tag": "JEE", "difficulty": "medium", "type": "mcq"},
    {"text": "If the sum of an AP is Sn = n(n+1)/2, the common difference d is:", "options": ["1", "2", "1/2", "n"], "correct": "1", "explanation": "Sn=n(n+1)/2 → aₙ=Sₙ−Sₙ₋₁ = n → d = aₙ − aₙ₋₁ = 1.", "subject": "Mathematics", "exam_tag": "JEE", "difficulty": "hard", "type": "mcq"},
    # UPSC / History
    {"text": "The Battle of Plassey (1757) was fought between:", "options": ["British and Marathas", "British and Nawab of Bengal", "British and Tipu Sultan", "British and Mughals"], "correct": "British and Nawab of Bengal", "explanation": "Robert Clive defeated Siraj ud-Daulah, Nawab of Bengal, establishing British dominance.", "subject": "History", "exam_tag": "UPSC", "difficulty": "easy", "type": "mcq"},
    {"text": "The Indian National Congress was founded in:", "options": ["1857", "1885", "1905", "1920"], "correct": "1885", "explanation": "INC was founded in 1885 by A.O. Hume, Dadabhai Naoroji, and Dinshaw Wacha.", "subject": "History", "exam_tag": "UPSC", "difficulty": "easy", "type": "mcq"},
    {"text": "The Directive Principles of State Policy in the Indian Constitution are inspired by:", "options": ["USA", "USSR", "Ireland", "UK"], "correct": "Ireland", "explanation": "DPSP are borrowed from the Irish Constitution.", "subject": "Polity", "exam_tag": "UPSC", "difficulty": "medium", "type": "mcq"},
    {"text": "The Tropic of Cancer passes through how many Indian states?", "options": ["6", "7", "8", "9"], "correct": "8", "explanation": "Tropic of Cancer passes through Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram.", "subject": "Geography", "exam_tag": "UPSC", "difficulty": "medium", "type": "mcq"},
    # SAT / General
    {"text": "What is the value of π correct to 2 decimal places?", "options": ["3.14", "3.15", "3.12", "3.16"], "correct": "3.14", "explanation": "π ≈ 3.14159..., rounded to 2 decimal places = 3.14.", "subject": "Mathematics", "exam_tag": "SAT", "difficulty": "easy", "type": "mcq"},
    {"text": "Which gas is most abundant in Earth's atmosphere?", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], "correct": "Nitrogen", "explanation": "Nitrogen makes up about 78% of Earth's atmosphere.", "subject": "Science", "exam_tag": "SAT", "difficulty": "easy", "type": "mcq"},
]

PLACEMENTS = ["post_session_double", "plus5min", "quiz_double", "social_unlock"]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def rand_date_between(start: datetime, end: datetime) -> datetime:
    delta = end - start
    secs = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=secs)


def ago(days: float = 0, hours: float = 0) -> datetime:
    return NOW - timedelta(days=days, hours=hours)


# ─── Seed functions ───────────────────────────────────────────────────────────

async def seed(db: AsyncSession) -> None:
    print("[Seeding] Seeding StudyTimer database...")

    # ── 1. Admin user ─────────────────────────────────────────────────────────
    admin_id = uuid.uuid4()
    admin = User(
        id=admin_id,
        firebase_uid="admin-seed-uid-000",
        email="admin@quovex.online",
        display_name="Quovex Admin",
        country="India",
        exam_tags=["JEE", "NEET"],
        primary_subject="Physics",
        points_total=0,
        verified_minutes_total=0,
        streak_count=0,
        admin_role=AdminRole.superadmin,
    )
    db.add(admin)
    print("  Admin user created")

    # ── 2. Regular users ──────────────────────────────────────────────────────
    users: list[User] = []
    for i in range(SEED_USERS):
        country = random.choice(COUNTRIES)
        exam_tags = [random.choice(EXAM_TAGS_BY_COUNTRY.get(country, [{"tag": "JEE"}]))["tag"]]
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        uid = uuid.uuid4()
        streak = random.randint(0, 90)
        subjects = SUBJECTS.get(exam_tags[0], ["Mathematics", "Science"])
        user = User(
            id=uid,
            firebase_uid=f"seed-uid-{i:04d}",
            email=f"{first.lower()}.{last.lower()}{i}@example.com",
            display_name=f"{first} {last}",
            country=country,
            state=None,
            exam_tags=exam_tags,
            primary_subject=subjects[0],
            points_total=0,  # will be updated after sessions
            verified_minutes_total=0,
            streak_count=streak,
            last_study_date=ago(days=0 if streak > 0 else random.randint(1, 10)),
            is_banned=(i == 47),  # one banned user for demo
            ban_reason="Repeated anti-cheat violations" if i == 47 else None,
        )
        db.add(user)
        users.append(user)

    await db.flush()
    print(f"  {SEED_USERS} regular users created")

    # ── 3. Study sessions (60 days of history) ────────────────────────────────
    total_sessions = 0
    for user in users:
        # Active users: more sessions; casual users: fewer
        is_active = random.random() < 0.6
        sessions_count = random.randint(30, 120) if is_active else random.randint(2, 20)
        total_verified_minutes = 0
        total_points = 0
        tags = user.exam_tags or ["JEE"]
        subjects = SUBJECTS.get(tags[0], ["Mathematics"])

        for _ in range(sessions_count):
            days_ago = random.uniform(0, SEED_DAYS_BACK)
            start = ago(days=days_ago)
            duration_mins = random.randint(20, 180)
            if is_active:
                duration_mins = random.randint(45, 360)
            end = start + timedelta(minutes=duration_mins)
            mode = random.choice([StudyMode.offline, StudyMode.offline, StudyMode.online])
            flagged = random.random() < 0.04

            # Points calculation (with diminishing returns after 6h)
            base_pts = min(duration_mins, 360) * (100 / 60)
            if duration_mins > 360:
                extra = duration_mins - 360
                base_pts += extra * (50 / 60)
            base_pts = int(base_pts)

            ad_doubled = not flagged and random.random() < 0.3
            pts = base_pts * 2 if ad_doubled else base_pts

            session = StudySession(
                id=uuid.uuid4(),
                user_id=user.id,
                mode=mode,
                start_time=start,
                end_time=end,
                verified_minutes=duration_mins,
                raw_minutes=duration_mins + random.randint(0, 5),
                points_awarded=pts,
                points_base=base_pts,
                ad_doubled=ad_doubled,
                ad_double_count=1 if ad_doubled else 0,
                subject_tag=random.choice(subjects),
                exam_tag=random.choice(tags),
                locked_app_count=random.randint(2, 8) if mode == StudyMode.offline else 0,
                honor_check_failures=random.randint(0, 3) if mode == StudyMode.online else 0,
                flagged=flagged,
                flag_reason="Exceeded 12-hour daily limit" if flagged else None,
                anti_cheat_score=round(random.uniform(0.7, 0.95), 2) if flagged else 0.0,
                is_active=False,
            )
            db.add(session)
            total_verified_minutes += duration_mins
            total_points += pts
            total_sessions += 1

        # Update user stats
        user.verified_minutes_total = total_verified_minutes
        user.points_total = total_points

    await db.flush()
    print(f"  {total_sessions} study sessions created")

    # ── 4. Subject proficiencies ──────────────────────────────────────────────
    for user in users:
        tags = user.exam_tags or ["JEE"]
        subjects = SUBJECTS.get(tags[0], ["Mathematics"])
        for subject in subjects:
            answered = random.randint(20, 500)
            correct = int(answered * random.uniform(0.45, 0.95))
            db.add(UserSubjectProficiency(
                id=uuid.uuid4(),
                user_id=user.id,
                subject=subject,
                exam_tag=tags[0],
                rolling_accuracy_score=round(correct / answered, 3),
                total_questions_answered=answered,
                total_correct=correct,
            ))
    await db.flush()
    print(f"  Subject proficiencies seeded")

    # ── 5. Quiz questions ─────────────────────────────────────────────────────
    live_question_ids = []
    for raw in QUIZ_QUESTIONS_RAW:
        qid = uuid.uuid4()
        q = QuizQuestion(
            id=qid,
            text=raw["text"],
            options=raw["options"],
            correct_answer=raw["correct"],
            explanation=raw["explanation"],
            question_type=QuestionType.mcq,
            subject=raw["subject"],
            exam_tag=raw["exam_tag"],
            difficulty=Difficulty[raw["difficulty"]],
            status=QuestionStatus.live,  # Auto-approved — no review gate
            generation_batch_id="seed-batch-001",
        )
        db.add(q)
        live_question_ids.append(qid)

    await db.flush()
    print(f"  {len(QUIZ_QUESTIONS_RAW)} quiz questions seeded (all live, no review queue)")

    # ── 6. Quiz sessions ──────────────────────────────────────────────────────
    total_quiz_sessions = 0
    for user in users[:30]:  # only active users have quiz sessions
        num_attempts = random.randint(3, 25)
        tags = user.exam_tags or ["JEE"]
        subjects = SUBJECTS.get(tags[0], ["Mathematics"])
        user_quiz_score = 0

        for _ in range(num_attempts):
            days_ago = random.uniform(0, SEED_DAYS_BACK)
            start = ago(days=days_ago)
            relevant_qids = live_question_ids[:6]
            if not relevant_qids:
                continue
            question_batch = random.sample(relevant_qids, min(5, len(relevant_qids)))
            total_q = len(question_batch)
            correct = random.randint(0, total_q)
            pts = correct * 10 + random.randint(0, 15)
            verified_score = pts

            qs = QuizSession(
                id=uuid.uuid4(),
                user_id=user.id,
                subject=random.choice(subjects),
                exam_tag=random.choice(tags),
                difficulty_mode=Difficulty.adaptive,
                question_ids=[str(q) for q in question_batch],
                start_time=start,
                end_time=start + timedelta(minutes=8),
                total_correct=correct,
                total_questions=total_q,
                points_earned=pts,
                verified_quiz_score_earned=verified_score,
                ad_doubled=random.random() < 0.2,
                is_complete=True,
            )
            db.add(qs)
            user_quiz_score += verified_score
            total_quiz_sessions += 1

        user.quiz_points_total = random.randint(100, 5000)
        user.verified_quiz_score = user_quiz_score

    await db.flush()
    print(f"  {total_quiz_sessions} quiz sessions seeded")

    # ── 7. Leaderboard snapshots ──────────────────────────────────────────────
    sorted_by_study = sorted(users, key=lambda u: u.verified_minutes_total, reverse=True)
    sorted_by_quiz = sorted(users, key=lambda u: u.verified_quiz_score, reverse=True)
    sorted_overall = sorted(users, key=lambda u: u.points_total + u.verified_quiz_score, reverse=True)

    for period in [LeaderboardPeriod.week, LeaderboardPeriod.month, LeaderboardPeriod.all_time]:
        for i, user in enumerate(sorted_by_study):
            db.add(LeaderboardSnapshot(
                id=uuid.uuid4(), user_id=user.id,
                track=LeaderboardTrack.study, scope=LeaderboardScope.global_,
                period=period, rank=i + 1,
                verified_minutes=user.verified_minutes_total,
                points=user.points_total,
                country=user.country, exam_tag=(user.exam_tags or ["JEE"])[0],
                snapshot_at=ago(hours=1),
                is_frozen=(period == LeaderboardPeriod.month),
            ))
        for i, user in enumerate(sorted_by_quiz):
            db.add(LeaderboardSnapshot(
                id=uuid.uuid4(), user_id=user.id,
                track=LeaderboardTrack.quiz, scope=LeaderboardScope.global_,
                period=period, rank=i + 1,
                verified_quiz_score=user.verified_quiz_score,
                points=user.quiz_points_total,
                country=user.country, exam_tag=(user.exam_tags or ["JEE"])[0],
                snapshot_at=ago(hours=1),
                is_frozen=(period == LeaderboardPeriod.month),
            ))
        for i, user in enumerate(sorted_overall):
            db.add(LeaderboardSnapshot(
                id=uuid.uuid4(), user_id=user.id,
                track=LeaderboardTrack.overall, scope=LeaderboardScope.global_,
                period=period, rank=i + 1,
                verified_minutes=user.verified_minutes_total,
                verified_quiz_score=user.verified_quiz_score,
                points=user.points_total + user.quiz_points_total,
                country=user.country, exam_tag=(user.exam_tags or ["JEE"])[0],
                snapshot_at=ago(hours=1),
                is_frozen=(period == LeaderboardPeriod.month),
            ))

    await db.flush()
    print(f"  Leaderboard snapshots seeded ({len(users) * 3 * 3} rows)")

    # ── 8. Rewards (top 10 from each track) ──────────────────────────────────
    reward_configs = [
        (1, "top_3", RewardType.giftcard, 50.0, "Amazon Gift Card — Study Champion"),
        (2, "top_3", RewardType.giftcard, 50.0, "Amazon Gift Card — Runner Up"),
        (3, "top_3", RewardType.giftcard, 50.0, "Amazon Gift Card — Third Place"),
        (4, "top_10", RewardType.giftcard, 25.0, "Amazon Gift Card — Top 10"),
        (5, "top_10", RewardType.giftcard, 25.0, "Amazon Gift Card — Top 10"),
        (6, "top_10", RewardType.badge, None, "Top 10 Monthly Badge"),
        (7, "top_10", RewardType.badge, None, "Top 10 Monthly Badge"),
        (8, "top_10", RewardType.badge, None, "Top 10 Monthly Badge"),
        (9, "top_10", RewardType.badge, None, "Top 10 Monthly Badge"),
        (10, "top_10", RewardType.badge, None, "Top 10 Monthly Badge"),
    ]
    reward_statuses = [
        RewardStatus.sent, RewardStatus.sent, RewardStatus.approved,
        RewardStatus.kyc_review, RewardStatus.kyc_review, RewardStatus.approved,
        RewardStatus.pending, RewardStatus.pending, RewardStatus.rejected, RewardStatus.sent,
    ]
    current_month = NOW.strftime("%Y-%m")
    last_month = (NOW.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

    for track, user_list in [
        (LeaderboardTrack.study, sorted_by_study),
        (LeaderboardTrack.quiz, sorted_by_quiz),
    ]:
        for (rank, tier, rtype, amount, desc), status in zip(reward_configs, reward_statuses):
            user = user_list[rank - 1] if len(user_list) >= rank else user_list[-1]
            db.add(Reward(
                id=uuid.uuid4(),
                user_id=user.id,
                track=track,
                period_month=last_month,
                tier=tier,
                rank_at_freeze=rank,
                reward_type=rtype,
                reward_amount_usd=amount,
                reward_description=f"{desc} — {track.value.title()} Track",
                status=status,
                kyc_verified=status in [RewardStatus.approved, RewardStatus.sent],
                kyc_verification_id=f"WA-{last_month}-{rank:02d}" if status in [RewardStatus.approved, RewardStatus.sent] else None,
                claimed_at=ago(days=3) if status != RewardStatus.pending else None,
                sent_at=ago(days=1) if status == RewardStatus.sent else None,
                admin_notes="Verified via WhatsApp" if status == RewardStatus.sent else None,
            ))

    await db.flush()
    print(f"  Rewards seeded (2 tracks × 10 = 20 rewards)")

    # ── 9. Ad revenue logs (60 days) ─────────────────────────────────────────
    for day_offset in range(SEED_DAYS_BACK):
        day = ago(days=day_offset)
        for placement in PLACEMENTS:
            impressions = random.randint(200, 2000)
            ecpm = round(random.uniform(0.5, 3.5), 3)
            db.add(AdRevenueLog(
                id=uuid.uuid4(),
                date=day,
                placement_type=placement,
                country="India",
                impressions=impressions,
                estimated_revenue_usd=round(impressions * ecpm / 1000, 4),
                ecpm=ecpm,
            ))
    await db.flush()
    print(f"  {SEED_DAYS_BACK * len(PLACEMENTS)} ad revenue log entries seeded")

    await db.commit()
    print("[Seeding] Seed data inserted successfully.")
    print(f"   Users: {SEED_USERS + 1} (incl. 1 admin)")
    print(f"   Sessions: {total_sessions}")
    print(f"   Quiz Questions: {len(QUIZ_QUESTIONS_RAW)} ({len(live_question_ids)} live)")
    print(f"   Quiz Sessions: {total_quiz_sessions}")
    print(f"   Rewards: 20")
    print(f"   Ad Revenue Logs: {SEED_DAYS_BACK * len(PLACEMENTS)}")


# ─── Entry point ──────────────────────────────────────────────────────────────

async def main():
    # Ensure the DB URL uses aiosqlite for create_async_engine
    db_url = settings.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
    engine = create_async_engine(db_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        await seed(db)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
