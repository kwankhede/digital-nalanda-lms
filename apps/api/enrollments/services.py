from django.utils import timezone

from courses.models import Lesson
from progress.models import LessonProgress

from .models import Enrollment


def recalc_progress(student, course) -> Enrollment | None:
    """
    Recompute an enrollment's progress_percentage from completed lessons.
    Marks the enrollment completed when all published lessons are done, and
    auto-issues a certificate on completion.
    Returns the (updated) enrollment, or None if the student isn't enrolled.
    """
    try:
        enrollment = Enrollment.objects.get(student=student, course=course)
    except Enrollment.DoesNotExist:
        return None

    total = Lesson.objects.filter(
        module__course=course, is_published=True
    ).count()
    completed = LessonProgress.objects.filter(
        student=student,
        course=course,
        is_completed=True,
        lesson__is_published=True,
    ).count()

    percentage = round((completed / total) * 100) if total else 0
    enrollment.progress_percentage = percentage
    just_completed = False

    if total and completed >= total:
        if enrollment.status != Enrollment.Status.COMPLETED:
            enrollment.status = Enrollment.Status.COMPLETED
            enrollment.completed_at = timezone.now()
            just_completed = True
    else:
        # Re-opening progress moves a completed enrollment back to active.
        if enrollment.status == Enrollment.Status.COMPLETED:
            enrollment.status = Enrollment.Status.ACTIVE
            enrollment.completed_at = None

    enrollment.save(update_fields=[
        "progress_percentage", "status", "completed_at"
    ])

    # Issue the certificate AFTER the enrollment is persisted, so the
    # certificate service sees the completed status. Idempotent + best-effort.
    if just_completed:
        certificate = None
        from certificates.services import issue_certificate, NotEligible
        try:
            certificate = issue_certificate(student, course)
        except NotEligible:
            pass
        _send_completion_email(student, course, certificate)

    return enrollment


def _send_completion_email(student, course, certificate=None):
    """Congratulate the student on completing a course. Best-effort."""
    from django.conf import settings as dj_settings

    from core.email import send_email

    base = getattr(dj_settings, "FRONTEND_URL", "").rstrip("/")
    cert_line = ""
    if certificate is not None:
        cert_line = (
            "Your certificate is ready — view and download it from your "
            f"dashboard: {base}/dashboard\n"
            f"Certificate number: {certificate.certificate_number}\n\n"
        )
    send_email(
        f"Congratulations — you completed {course.title}!",
        getattr(student, "email", None),
        (
            f"Hi {getattr(student, 'full_name', '') or 'there'},\n\n"
            f"You've completed \"{course.title}\" on Digital Nalanda. "
            "Wonderful work!\n\n"
            f"{cert_line}"
            f"Find your next course: {base}/courses\n\n"
            "— Digital Nalanda"
        ),
    )
