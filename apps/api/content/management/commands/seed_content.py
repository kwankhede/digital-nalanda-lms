"""Seed homepage content (schools, paths, educators, libraries). Idempotent."""
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from content.models import CommunityLibrary, Educator, ImpactMetric, LearningPath, School, Story

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

IMPACT = [
    (5000, "+", "Students Reached"),
    (600, "+", "Successful Learners"),
    (20, "+", "Educators"),
    (14, "", "Community Libraries"),
    (100, "%", "Free Education"),
]

STORIES = [
    ("From village to first job", "Roopa Nagenahalli", "Azim Premji University", "Karnataka", "2019",
     "When I joined Nalanda in 2017, I couldn't write a paragraph in English — I studied in Kannada and was a school drop-out. Nalanda gave me my first real chance to study properly."),
    ("A learning home far from home", "Chetan Kant", "TISS Mumbai", "Odisha", "2020",
     "I'm from a village in Odisha; my parents died when I was young. I could join Nalanda only because it taught students free of cost and provided stipends."),
    ("Studying abroad, once unimaginable", "Raviraj Gajbhiye", "University of Alberta, Canada", "Maharashtra", "2021",
     "Studying abroad never crossed my mind before Nalanda. It's the only place I derive my inspiration, motivation and confidence from."),
    ("A family that believes in equality", "Karuna Patel", "Central University of Punjab", "Bihar", "2022",
     "I met students from different states at Nalanda. Nalanda is like a family that believes in equality and equal access to education."),
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
        from django.utils import timezone
        for i, (title, name, inst, city, year, quote) in enumerate(STORIES):
            Story.objects.update_or_create(
                student_name=name, title=title,
                defaults={
                    "summary": quote[:140], "content": quote, "quote": quote,
                    "institution": inst, "city": city, "graduation_year": year,
                    "is_featured": True, "is_published": True,
                    "display_order": i, "published_at": timezone.now(),
                },
            )
        for i, (value, suffix, label) in enumerate(IMPACT):
            ImpactMetric.objects.update_or_create(
                label=label,
                defaults={"value": value, "suffix": suffix, "order": i},
            )
        self.stdout.write(self.style.SUCCESS(
            f"Seeded {School.objects.count()} schools, "
            f"{LearningPath.objects.count()} paths, "
            f"{Educator.objects.count()} educators, "
            f"{CommunityLibrary.objects.count()} libraries, "
            f"{ImpactMetric.objects.count()} impact metrics, "
            f"{Story.objects.count()} stories."
        ))
