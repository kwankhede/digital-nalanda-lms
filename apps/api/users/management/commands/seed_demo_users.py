"""Create demo users for every role — LOCAL DEVELOPMENT ONLY.

Never run in production. Passwords are intentionally simple and public.
"""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()
PASSWORD = "ChangeMe123!"

# (email, role, is_staff, is_superuser, full_name)
DEMO = [
    ("superadmin@digitalnalanda.org", "super_admin", True, True, "Super Admin"),
    ("admin@digitalnalanda.org", "admin", True, False, "Admin User"),
    ("content@digitalnalanda.org", "content_manager", True, False, "Content Manager"),
    ("teacher@digitalnalanda.org", "course_creator", False, False, "Teacher Creator"),
    ("mentor@digitalnalanda.org", "mentor", False, False, "Mentor User"),
    ("events@digitalnalanda.org", "event_manager", True, False, "Event Manager"),
    ("student@digitalnalanda.org", "student", False, False, "Student User"),
    ("volunteer@digitalnalanda.org", "volunteer", False, False, "Volunteer User"),
]


class Command(BaseCommand):
    help = "Create demo users for every role (LOCAL DEV ONLY)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force", action="store_true",
            help="Override the production safety guard (NOT recommended).",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG and not options.get("force"):
            self.stderr.write(self.style.ERROR(
                "Refusing to seed demo users with DEBUG=False (production). "
                "These accounts use a public password. Use `createsuperuser` "
                "instead, or pass --force only if you fully understand the risk."
            ))
            return

        for email, role, is_staff, is_super, name in DEMO:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"username": email, "role": role, "full_name": name,
                          "is_staff": is_staff, "is_superuser": is_super},
            )
            # Keep role/flags in sync and (re)set the demo password.
            user.role = role
            user.full_name = name
            user.is_staff = is_staff
            user.is_superuser = is_super
            user.set_password(PASSWORD)
            user.save()
            self.stdout.write(f"  {'created' if created else 'updated'}: {email} ({role})")
        self.stdout.write(self.style.WARNING(
            "\n⚠  DEMO USERS — local development only. "
            "Never use these passwords in production."
        ))
        self.stdout.write(self.style.SUCCESS(f"Done. All passwords: {PASSWORD}"))
