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
        from certificates.services import issue_certificate, NotEligible
        try:
            issue_certificate(student, course)
        except NotEligible:
            pass

    return enrollment
