import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


def generate_verification_code() -> str:
    """Short, random, URL-safe code used for public verification."""
    return secrets.token_urlsafe(8)


class Certificate(models.Model):
    """
    Certificate of completion, issued when a student completes a course.

    `certificate_number` (DN-YYYY-000001) is the human-readable id; the random
    `verification_code` is the public verify/share key. PDFs are stored via
    Django's default storage (local now, swappable to Cloudflare R2 later).
    """

    class GeneratedBy(models.TextChoices):
        SYSTEM = "system", "System (auto)"
        ADMIN = "admin", "Admin"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="certificates",
        on_delete=models.CASCADE,
    )
    course = models.ForeignKey(
        "courses.Course",
        related_name="certificates",
        on_delete=models.CASCADE,
    )
    certificate_number = models.CharField(max_length=20, unique=True, editable=False)
    verification_code = models.CharField(
        max_length=32, unique=True, default=generate_verification_code, editable=False
    )
    issue_date = models.DateField(default=timezone.now)
    completion_date = models.DateField(null=True, blank=True)
    percentage_completed = models.PositiveIntegerField(default=100)
    certificate_pdf_url = models.CharField(max_length=500, blank=True)
    generated_by = models.CharField(
        max_length=20, choices=GeneratedBy.choices, default=GeneratedBy.SYSTEM
    )
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # One certificate per student per course.
        unique_together = ("student", "course")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.certificate_number} — {self.recipient_name} / {self.course.title}"

    @property
    def recipient_name(self):
        return self.student.full_name or self.student.get_username()

    @property
    def is_valid(self):
        return not self.is_revoked


def next_certificate_number() -> str:
    """Sequential per-year number: DN-YYYY-000001 (best-effort)."""
    year = timezone.now().year
    prefix = f"DN-{year}-"
    count = Certificate.objects.filter(
        certificate_number__startswith=prefix
    ).count()
    return f"{prefix}{count + 1:06d}"
