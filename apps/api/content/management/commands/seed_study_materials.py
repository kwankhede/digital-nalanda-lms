from django.core.management.base import BaseCommand
from content.models import StudyMaterial

SAMPLES = [
    ("NCERT Mathematics Class 10 — Full Textbook", "Complete NCERT textbook, chapter-wise.", "Mathematics", "pdf", "https://ncert.nic.in/textbook.php"),
    ("Algebra Practice Worksheets", "Printable practice sets with answer keys.", "Mathematics", "doc", "https://nalanda-academy.org/"),
    ("Indian Constitution — Quick Notes", "Concise revision notes on the Constitution.", "Civics", "pdf", "https://nalanda-academy.org/"),
    ("UPSC Prelims Current Affairs Compilation", "Monthly current-affairs compilation for aspirants.", "UPSC", "pdf", "https://nalanda-academy.org/"),
    ("Introduction to Python — Slides", "Beginner-friendly slides for the Python basics course.", "Computer Science", "slides", "https://nalanda-academy.org/"),
    ("Spoken English Practice Videos", "Curated playlist to build everyday English fluency.", "English", "video", "https://www.youtube.com/"),
    ("Digital Nalanda Study Guide", "How to make the most of your learning journey.", "General", "link", "https://nalanda-academy.org/"),
]


class Command(BaseCommand):
    help = "Seed sample study materials (idempotent by title)."

    def handle(self, *args, **opts):
        created = 0
        for i, (title, desc, cat, rtype, url) in enumerate(SAMPLES):
            obj, made = StudyMaterial.objects.get_or_create(
                title=title,
                defaults=dict(description=desc, category=cat, resource_type=rtype, url=url, order=i),
            )
            created += int(made)
        self.stdout.write(self.style.SUCCESS(
            f"Study materials seeded. New: {created}. Total now: {StudyMaterial.objects.count()}."
        ))
