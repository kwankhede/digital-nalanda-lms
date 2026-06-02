"""Seed homepage content (schools, paths, educators, libraries). Idempotent."""
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from content.models import CommunityLibrary, Educator, LearningPath, School

SCHOOLS = [
    ("Arts School", "🎨", "Literature, history & the humanities.", 12),
    ("Management School", "📊", "Business, leadership & enterprise.", 9),
    ("Law School", "⚖️", "Constitution, rights & justice.", 7),
    ("Design School", "✏️", "Visual, product & digital design.", 6),
    ("Buddhist Studies", "☸️", "Philosophy, ethics & mindful living.", 5),
    ("Data Science", "📈", "Data, statistics & applied AI.", 8),
    ("Media & Communication", "🎙️", "Journalism, media & storytelling.", 6),
    ("Civil Thought", "🏛️", "Civic life, governance & policy.", 5),
    ("Social Science", "🌍", "Society, economics & change.", 10),
    ("Interdisciplinary Studies", "🧩", "Cross-field critical thinking.", 4),
]

PATHS = [
    ("UPSC Foundation Path", "🏛️", "Build the base for civil services preparation.", 6),
    ("Critical Thinking Path", "🧠", "Reason clearly, argue well, decide better.", 4),
    ("English Communication Path", "💬", "Speak and write English with confidence.", 5),
    ("Buddhist Studies Path", "☸️", "Philosophy, ethics, and mindful living.", 4),
    ("Leadership Development Path", "🌟", "Lead teams and communities with purpose.", 5),
]

EDUCATORS = [
    ("Anoop Kumar", "Political Science & Public Policy", "Civil Thought"),
    ("Priya Sharma", "English & Communication", "Media & Communication"),
    ("Ravikant Kisana", "History & Social Theory", "Social Science"),
    ("Samdish Chumber", "Economics", "Management School"),
    ("Meera Joshi", "Data Science & Statistics", "Data Science"),
    ("Arjun Rao", "Law & Constitution", "Law School"),
]

LIBRARIES = [
    ("Nalanda Library, Wardha", "Wardha, Maharashtra", "Our flagship community learning centre."),
    ("Nagpur Reading Hub", "Nagpur, Maharashtra", "Books, internet access, and study space."),
    ("Patna Knowledge Centre", "Patna, Bihar", "Free resources for competitive exam aspirants."),
    ("Aurangabad Library", "Aurangabad, Maharashtra", "A quiet place to learn and grow."),
]


class Command(BaseCommand):
    help = "Seed homepage content."

    def handle(self, *args, **options):
        for i, (name, icon, desc, count) in enumerate(SCHOOLS):
            School.objects.update_or_create(
                slug=slugify(name),
                defaults={"name": name, "icon": icon, "description": desc,
                          "course_count": count, "order": i},
            )
        for i, (name, icon, desc, count) in enumerate(PATHS):
            LearningPath.objects.update_or_create(
                slug=slugify(name),
                defaults={"name": name, "icon": icon, "description": desc,
                          "course_count": count, "order": i},
            )
        for i, (name, exp, school) in enumerate(EDUCATORS):
            Educator.objects.update_or_create(
                name=name,
                defaults={"expertise": exp, "school": school, "order": i},
            )
        for i, (name, loc, desc) in enumerate(LIBRARIES):
            CommunityLibrary.objects.update_or_create(
                name=name,
                defaults={"location": loc, "description": desc, "order": i},
            )
        self.stdout.write(self.style.SUCCESS(
            f"Seeded {School.objects.count()} schools, "
            f"{LearningPath.objects.count()} paths, "
            f"{Educator.objects.count()} educators, "
            f"{CommunityLibrary.objects.count()} libraries."
        ))
