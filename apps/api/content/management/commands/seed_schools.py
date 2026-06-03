"""Seed the six flagship Digital Nalanda schools (idempotent on slug).

These match the homepage illustrations. Admins can add more at any time via
Django admin or the /api/admin/schools/ API — no code change needed.
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from content.models import School

SCHOOLS = [
    ("School of Law", "⚖️", "Constitution, rights & justice.",
     "Constitution, rights & justice",
     "Study constitutional law, jurisprudence and the Indian penal framework with a focus on social justice and equal access to the law.",
     "school-law.webp", 7),
    ("School of Social Sciences", "👥", "Society, economics & change.",
     "Understand society and drive change",
     "Sociology, psychology, political science and economics — the tools to understand communities and lead social transformation.",
     "school-social.webp", 10),
    ("School of Buddhist Studies", "☸️", "Philosophy, ethics & mindful living.",
     "Wisdom for a life of purpose",
     "Explore Buddhist philosophy, ethics and mindful living — \"The mind is everything; what you think you become.\"",
     "school-buddhist.webp", 5),
    ("School of Data Science", "🧠", "Data, statistics & applied AI.",
     "Data, statistics & applied AI",
     "From statistics and machine learning to data mining and big data — build the skills that power modern, evidence-based decisions.",
     "school-data.webp", 8),
    ("School of Design", "✏️", "Visual, product & digital design.",
     "Design that creates impact",
     "Design theory, graphic design, typography, user experience and visual communication for creators who want to shape the world.",
     "school-design.webp", 6),
    ("School of Critical Thought", "💡", "Reason clearly, argue well, decide better.",
     "Think clearly. Question deeply.",
     "Philosophy, logic, epistemology and ethics — develop the critical thinking that underpins every other discipline.",
     "school-critical.webp", 5),
]


class Command(BaseCommand):
    help = "Seed the six flagship schools (idempotent)."

    def handle(self, *args, **options):
        for i, (name, icon, desc, tagline, long_desc, img, courses) in enumerate(SCHOOLS):
            School.objects.update_or_create(
                slug=slugify(name),
                defaults={
                    "name": name,
                    "icon": icon,
                    "tagline": tagline,
                    "description": desc,
                    "long_description": long_desc,
                    "image_url": f"/images/home/{img}",
                    "course_count": courses,
                    "order": i,
                    "is_featured": True,
                    "is_published": True,
                },
            )
        self.stdout.write(self.style.SUCCESS(
            f"Seeded/updated {len(SCHOOLS)} schools. Total now: {School.objects.count()}."
        ))
