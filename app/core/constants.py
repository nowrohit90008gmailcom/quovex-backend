"""Shared constants for exam tags, subjects, academic sequences, and filtering logic."""

from typing import Optional

# ─── Academic advancement sequences ────────────────────────────────────────────

SCHOOL_CLASS_SEQUENCE = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11", "Class 12",
]

COLLEGE_YEAR_SEQUENCE = [
    "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year",
]


def next_class(current: str, inst_type: str) -> tuple[str, bool]:
    current_clean = current.strip()
    if inst_type == "school":
        if current_clean in SCHOOL_CLASS_SEQUENCE:
            idx = SCHOOL_CLASS_SEQUENCE.index(current_clean)
            if idx + 1 < len(SCHOOL_CLASS_SEQUENCE):
                return SCHOOL_CLASS_SEQUENCE[idx + 1], False
            return "Passed Out (Class 12)", True
    elif inst_type == "college":
        if current_clean in COLLEGE_YEAR_SEQUENCE:
            idx = COLLEGE_YEAR_SEQUENCE.index(current_clean)
            if idx + 1 < len(COLLEGE_YEAR_SEQUENCE):
                return COLLEGE_YEAR_SEQUENCE[idx + 1], False
            return f"Passed Out ({current_clean})", True
    elif inst_type == "coaching":
        return current_clean, False
    return current_clean, False


# ─── Exam tags by country ─────────────────────────────────────────────────────

EXAM_TAGS_BY_COUNTRY = {
    "India": [
        {"tag": "JEE Main", "category": "competitive", "country": "India"},
        {"tag": "JEE Advanced", "category": "competitive", "country": "India"},
        {"tag": "NEET", "category": "competitive", "country": "India"},
        {"tag": "UPSC CSE", "category": "competitive", "country": "India"},
        {"tag": "GATE", "category": "competitive", "country": "India"},
        {"tag": "CBSE Class 10", "category": "school_board", "country": "India"},
        {"tag": "CBSE Class 12", "category": "school_board", "country": "India"},
        {"tag": "ICSE Class 10", "category": "school_board", "country": "India"},
        {"tag": "ICSE Class 12", "category": "school_board", "country": "India"},
        {"tag": "State Board", "category": "school_board", "country": "India"},
        {"tag": "CAT", "category": "competitive", "country": "India"},
        {"tag": "CLAT", "category": "competitive", "country": "India"},
        {"tag": "NDA", "category": "competitive", "country": "India"},
        {"tag": "SSC CGL", "category": "competitive", "country": "India"},
        {"tag": "Bank PO", "category": "competitive", "country": "India"},
        {"tag": "CA Foundation", "category": "competitive", "country": "India"},
        {"tag": "CUET", "category": "competitive", "country": "India"},
        {"tag": "State PSC", "category": "competitive", "country": "India"},
    ],
    "US": [
        {"tag": "SAT", "category": "competitive", "country": "US"},
        {"tag": "ACT", "category": "competitive", "country": "US"},
        {"tag": "AP", "category": "school_board", "country": "US"},
        {"tag": "GRE", "category": "competitive", "country": "US"},
        {"tag": "GMAT", "category": "competitive", "country": "US"},
        {"tag": "MCAT", "category": "competitive", "country": "US"},
        {"tag": "LSAT", "category": "competitive", "country": "US"},
        {"tag": "USMLE", "category": "competitive", "country": "US"},
        {"tag": "TOEFL", "category": "competitive", "country": "US"},
        {"tag": "IELTS", "category": "competitive", "country": "US"},
    ],
    "UK": [
        {"tag": "GCSE", "category": "school_board", "country": "UK"},
        {"tag": "A-Level", "category": "school_board", "country": "UK"},
        {"tag": "UCAT", "category": "competitive", "country": "UK"},
        {"tag": "LNAT", "category": "competitive", "country": "UK"},
        {"tag": "BMAT", "category": "competitive", "country": "UK"},
        {"tag": "IELTS", "category": "competitive", "country": "UK"},
    ],
    "Bangladesh": [
        {"tag": "SSC", "category": "school_board", "country": "Bangladesh"},
        {"tag": "HSC", "category": "school_board", "country": "Bangladesh"},
        {"tag": "BUET", "category": "competitive", "country": "Bangladesh"},
        {"tag": "DU Admission", "category": "competitive", "country": "Bangladesh"},
        {"tag": "BCS", "category": "competitive", "country": "Bangladesh"},
    ],
    "Nigeria": [
        {"tag": "WAEC", "category": "school_board", "country": "Nigeria"},
        {"tag": "JAMB", "category": "competitive", "country": "Nigeria"},
        {"tag": "POST-UTME", "category": "competitive", "country": "Nigeria"},
    ],
}

ALL_COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
    "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba",
    "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
    "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
    "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
    "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
    "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "UK", "US", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe",
]

SUPPORTED_COUNTRIES = sorted(ALL_COUNTRIES)


# ─── Subjects per exam tag (for seed.py and quiz gen) ─────────────────────────

SUBJECTS = {
    "JEE Main": ["Physics", "Chemistry", "Mathematics"],
    "JEE Advanced": ["Physics", "Chemistry", "Mathematics"],
    "NEET": ["Physics", "Chemistry", "Biology"],
    "UPSC CSE": ["History", "Geography", "Polity", "Economy"],
    "GATE": ["Mathematics", "Computer Science", "Aptitude"],
    "CBSE Class 10": ["Mathematics", "Science", "Social Science", "English"],
    "CBSE Class 12": ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
    "ICSE Class 10": ["Mathematics", "Science", "English"],
    "ICSE Class 12": ["Physics", "Chemistry", "Mathematics", "English"],
    "State Board": ["Mathematics", "Science", "Social Science"],
    "SAT": ["Mathematics", "Reading", "Writing"],
    "ACT": ["English", "Mathematics", "Reading", "Science"],
    "AP": ["Mathematics", "Physics", "Chemistry"],
    "GRE": ["Quantitative", "Verbal", "Analytical Writing"],
    "GMAT": ["Quantitative", "Verbal", "Data Insights"],
    "MCAT": ["Biology", "Chemistry", "Physics", "Psychology"],
    "LSAT": ["Logical Reasoning", "Analytical Reasoning", "Reading Comprehension"],
    "USMLE": ["Anatomy", "Physiology", "Pathology", "Pharmacology"],
    "A-Level": ["Mathematics", "Physics", "Chemistry", "Biology"],
    "GCSE": ["Mathematics", "English", "Science"],
    "UCAT": ["Verbal Reasoning", "Decision Making", "Quantitative Reasoning", "Abstract Reasoning"],
    "LNAT": ["Critical Thinking", "Essay Writing"],
    "BMAT": ["Thinking Skills", "Scientific Knowledge", "Mathematics"],
    "SSC": ["Mathematics", "Science", "English"],
    "HSC": ["Physics", "Chemistry", "Mathematics", "Biology"],
    "BUET": ["Physics", "Chemistry", "Mathematics"],
    "DU Admission": ["Mathematics", "English", "General Knowledge"],
    "BCS": ["Bangla", "English", "Mathematics", "General Knowledge"],
    "WAEC": ["Mathematics", "English", "Science"],
    "JAMB": ["English", "Mathematics", "Chemistry", "Physics"],
    "POST-UTME": ["English", "Mathematics", "General Knowledge"],
    "CAT": ["Quantitative Aptitude", "Data Interpretation", "Verbal Ability", "Logical Reasoning"],
    "CLAT": ["Legal Reasoning", "Logical Reasoning", "Quantitative Techniques", "English", "General Knowledge"],
    "NDA": ["Mathematics", "General Ability", "English"],
    "SSC CGL": ["General Intelligence", "Quantitative Aptitude", "English", "General Awareness"],
    "Bank PO": ["Reasoning", "Quantitative Aptitude", "English", "General Awareness"],
    "CA Foundation": ["Accounting", "Business Laws", "Quantitative Aptitude", "Economics"],
    "CUET": ["English", "General Test", "Domain Subject"],
    "State PSC": ["General Studies", "Optional Subject", "Essay"],
    "IELTS": ["Listening", "Reading", "Writing", "Speaking"],
    "TOEFL": ["Reading", "Listening", "Speaking", "Writing"],
}


# ─── Filtering logic ──────────────────────────────────────────────────────────

def get_education_level(institution_type: Optional[str], class_or_year: Optional[str]) -> str:
    """Determine education level for exam tag filtering."""
    if not institution_type:
        return "competitive"
    inst = institution_type.lower()
    if inst == "school" and class_or_year:
        cls = class_or_year.strip().lower()
        try:
            num = int(cls.replace("class ", ""))
            if 1 <= num <= 10:
                return "school_1_to_10"
            if num in (11, 12):
                return "school_11_to_12"
        except ValueError:
            pass
    if inst == "college" and class_or_year:
        cls = class_or_year.strip().lower()
        if cls.startswith("1st") or cls.startswith("2nd"):
            return "college_1st_2nd"
        return "college_3rd_plus"
    if inst in ("coaching", "self_study"):
        return "competitive"
    return "competitive"


def get_filtered_tags(
    country: Optional[str] = None,
    education_level: Optional[str] = None,
) -> list[dict]:
    """Return exam tags filtered by country and education level."""
    tags = EXAM_TAGS_BY_COUNTRY.get(country, [])
    if not tags:
        tags = [t for tag_list in EXAM_TAGS_BY_COUNTRY.values() for t in tag_list]

    if education_level:
        if education_level == "school_1_to_10":
            tags = [t for t in tags if t["category"] == "school_board"]
        elif education_level == "school_11_to_12":
            tags = [t for t in tags if t["category"] in ("school_board", "competitive")]
        elif education_level == "college_1st_2nd":
            tags = []
        elif education_level in ("college_3rd_plus", "competitive"):
            tags = [t for t in tags if t["category"] == "competitive"]

    return tags
