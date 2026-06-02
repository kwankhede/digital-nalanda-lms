"""Seed the database with example Digital Nalanda courses.

Idempotent: uses get_or_create / update_or_create so re-running won't duplicate.
Run with:  python manage.py seed_courses
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Category, Course, Lesson, Module

CATEGORIES = [
    ("Education", "education"),
    ("Computer", "computer"),
    ("Language", "language"),
    ("Skill Development", "skill-development"),
    ("Personal Growth", "personal-growth"),
]

# (title, slug, short_desc, category_slug, level, language, thumbnail, modules)
# modules: list of (module_title, [lessons])
# lesson: (title, slug, type, youtube_id, duration, is_preview)
COURSES = [
    (
        "Digital Literacy", "digital-literacy",
        "Basic computer skills and digital tools for everyday life.",
        "computer", "beginner", "Hindi",
        "https://picsum.photos/seed/digital-literacy/600/400",
        [
            ("Getting Started", [
                ("Introduction to Computers", "intro-to-computers", "youtube", "y2srTcN3s_o", 11, True),
                ("Parts of a Computer", "parts-of-a-computer", "youtube", "Cu3R5it4cQs", 9, False),
            ]),
            ("Using the Internet", [
                ("What is the Internet?", "what-is-the-internet", "youtube", "Dxcc6ycZ73M", 8, False),
                ("Staying Safe Online", "staying-safe-online", "text", "", 5, False),
            ]),
        ],
    ),
    (
        "Spoken English", "spoken-english",
        "Improve your English speaking skills from the beginning.",
        "language", "beginner", "English",
        "https://picsum.photos/seed/spoken-english/600/400",
        [
            ("Foundations", [
                ("Everyday Greetings", "everyday-greetings", "youtube", "juKd26qkNQw", 10, True),
                ("Building Simple Sentences", "simple-sentences", "youtube", "8sb6PufjU1M", 12, False),
            ]),
        ],
    ),
    (
        "Basic Mathematics", "basic-mathematics",
        "Learn mathematics from the basics with simple examples.",
        "education", "beginner", "Hindi",
        "https://picsum.photos/seed/basic-mathematics/600/400",
        [
            ("Numbers", [
                ("Understanding Numbers", "understanding-numbers", "youtube", "X4u_yWB7oQ4", 14, True),
                ("Addition and Subtraction", "addition-subtraction", "text", "", 7, False),
            ]),
        ],
    ),
    (
        "Tally Prime Basics", "tally-prime-basics",
        "Learn accounting with Tally Prime step by step.",
        "skill-development", "intermediate", "Hindi",
        "https://picsum.photos/seed/tally-prime/600/400",
        [
            ("Introduction", [
                ("What is Tally Prime?", "what-is-tally-prime", "youtube", "Q4Y3W8oQy5A", 13, True),
                ("Creating a Company", "creating-a-company", "text", "", 8, False),
            ]),
        ],
    ),
    (
        "Personality Development", "personality-development",
        "Build confidence and improve your personality.",
        "personal-growth", "intermediate", "English",
        "https://picsum.photos/seed/personality-dev/600/400",
        [
            ("Confidence", [
                ("Building Self Confidence", "building-self-confidence", "youtube", "8jPQjjsBbIc", 15, True),
                ("Effective Communication", "effective-communication", "youtube", "HAnw168huqA", 12, False),
            ]),
        ],
    ),
]


class Command(BaseCommand):
    help = "Seed example Digital Nalanda courses."

    @transaction.atomic
    def handle(self, *args, **options):
        cats = {}
        for name, slug in CATEGORIES:
            cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
            cats[slug] = cat

        for (title, slug, short_desc, cat_slug, level, lang, thumb, modules) in COURSES:
            course, _ = Course.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "short_description": short_desc,
                    "description": short_desc + " This course is designed for beginners with practical, step-by-step lessons.",
                    "category": cats.get(cat_slug),
                    "level": level,
                    "language": lang,
                    "thumbnail_url": thumb,
                    "is_free": True,
                    "is_published": True,
                    "status": "published",
                },
            )
            for m_order, (m_title, lessons) in enumerate(modules, start=1):
                module, _ = Module.objects.update_or_create(
                    course=course, title=m_title, defaults={"order": m_order}
                )
                for l_order, (lt, lslug, ltype, yid, dur, preview) in enumerate(lessons, start=1):
                    Lesson.objects.update_or_create(
                        module=module, slug=lslug,
                        defaults={
                            "title": lt,
                            "lesson_type": ltype,
                            "youtube_video_id": yid,
                            "content": "" if ytype_has_video(ltype) else f"Notes for {lt}.",
                            "order": l_order,
                            "duration_minutes": dur,
                            "is_preview": preview,
                            "is_published": True,
                        },
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Course.objects.count()} courses, "
            f"{Category.objects.count()} categories, "
            f"{Lesson.objects.count()} lessons."
        ))


def ytype_has_video(lesson_type):
    return lesson_type in ("youtube", "video")
