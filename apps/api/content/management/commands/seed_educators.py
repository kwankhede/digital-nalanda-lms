"""Seed 20 educators/mentors (idempotent on name). Add more anytime via admin.

Photos use ui-avatars.com placeholders (brand colours); replace photo_url with
real headshots in Django admin whenever they're available.
"""
from urllib.parse import quote
from django.core.management.base import BaseCommand
from content.models import Educator

# (name, expertise, school, bio)
EDUCATORS = [
    ("Anoop Kumar", "Political Science & Public Policy", "School of Social Sciences",
     "Founder-educator guiding students through civic life, governance and the idea of an equal India."),
    ("Ravikant Kisana", "History & Social Theory", "School of Social Sciences",
     "Teaches history and caste studies, connecting the past to today's struggles for justice."),
    ("Samdish Chumber", "Economics", "School of Social Sciences",
     "Makes economics intuitive — from household budgets to national policy."),
    ("Adv. Meera Krishnan", "Constitutional Law", "School of Law",
     "Practising advocate who demystifies the Constitution and the rights it guarantees."),
    ("Prof. Anant Kumar", "Leadership & Ethics", "School of Critical Thought",
     "Mentors students on leadership for social change and a life of purpose."),
    ("Dr. Priya Sharma", "English & Communication", "School of Design",
     "Helps first-generation learners find their voice in spoken and written English."),
    ("Meera Joshi", "Data Science & Statistics", "School of Data Science",
     "From statistics to applied AI — turning curiosity into data fluency."),
    ("Arjun Rao", "Jurisprudence", "School of Law",
     "Explores the philosophy of law and how rules shape a fair society."),
    ("Sunita Patil", "Sociology", "School of Social Sciences",
     "Studies communities and change, grounding theory in lived experience."),
    ("Ven. Tenzin Dorje", "Buddhist Philosophy", "School of Buddhist Studies",
     "Introduces mindfulness, ethics and the teachings of the Buddha."),
    ("Rahul Verma", "Machine Learning", "School of Data Science",
     "Hands-on mentor for machine learning, data mining and big data projects."),
    ("Kavita Nair", "Graphic & Visual Design", "School of Design",
     "Teaches design thinking, typography and visual storytelling."),
    ("Dr. Imran Sheikh", "Epistemology & Logic", "School of Critical Thought",
     "Trains students to reason clearly, argue well and question deeply."),
    ("Lakshmi Iyer", "Psychology", "School of Social Sciences",
     "Brings psychology to everyday life and learning."),
    ("Vikram Singh", "Public Administration", "School of Social Sciences",
     "Prepares aspirants for civil services with clarity and discipline."),
    ("Fatima Ansari", "Editorial & Journalism", "School of Design",
     "Mentor for editorial analysis, media literacy and storytelling."),
    ("Deepak Gaikwad", "Mathematics", "School of Data Science",
     "Makes mathematics approachable, from fundamentals to reasoning."),
    ("Ananya Bose", "Constitutional History", "School of Law",
     "Connects the freedom struggle to the making of the Indian Constitution."),
    ("Suresh Meghwal", "Geography & Environment", "School of Social Sciences",
     "Teaches geography with a focus on people, place and sustainability."),
    ("Dr. Neha Kulkarni", "Research Methods", "School of Critical Thought",
     "Guides students in research, ethics and evidence-based thinking."),
]


def avatar(name: str) -> str:
    return (
        "https://ui-avatars.com/api/?name=" + quote(name)
        + "&background=0b1f4d&color=ffffff&size=256&bold=true&font-size=0.4"
    )


class Command(BaseCommand):
    help = "Seed 20 educators/mentors (idempotent)."

    def handle(self, *args, **options):
        for i, (name, expertise, school, bio) in enumerate(EDUCATORS):
            Educator.objects.update_or_create(
                name=name,
                defaults={
                    "title": "Educator & Mentor",
                    "expertise": expertise,
                    "school": school,
                    "bio": bio,
                    "long_bio": (
                        f"{bio} At Digital Nalanda, {name.split()[0]} mentors learners "
                        f"in {expertise.lower()}, with a focus on free, accessible education "
                        f"for students from rural and marginalised communities."
                    ),
                    "photo_url": avatar(name),
                    "is_featured": i < 6,   # first 6 highlighted on the homepage
                    "order": i,
                },
            )
        self.stdout.write(self.style.SUCCESS(
            f"Seeded/updated {len(EDUCATORS)} educators. Total: {Educator.objects.count()}."
        ))
