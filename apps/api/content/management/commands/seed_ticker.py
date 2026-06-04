from django.core.management.base import BaseCommand
from content.models import TickerItem

SAMPLES = [
    ("CUET UG 2026 registration is now open — apply before the last date.", "https://nalanda-academy.org/"),
    ("JEE Main 2026 Session 1 exam scheduled for January 2026.", "https://nalanda-academy.org/"),
    ("NEET UG 2026 application window expected to open in February.", "https://nalanda-academy.org/"),
    ("Nalanda Scholarship 2026 applications close on March 31, 2026.", "https://nalanda-academy.org/"),
    ("UPSC Civil Services 2026 notification released — start preparing now.", "https://nalanda-academy.org/"),
]


class Command(BaseCommand):
    help = "Seed sample ticker notices (idempotent by text)."

    def handle(self, *args, **opts):
        created = 0
        for i, (text, link) in enumerate(SAMPLES):
            _, made = TickerItem.objects.get_or_create(text=text, defaults=dict(link=link, order=i))
            created += int(made)
        self.stdout.write(self.style.SUCCESS(
            f"Ticker seeded. New: {created}. Total now: {TickerItem.objects.count()}."
        ))
