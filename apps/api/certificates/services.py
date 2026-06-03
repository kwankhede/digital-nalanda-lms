from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction

from enrollments.models import Enrollment

from .models import Certificate, next_certificate_number
from .pdf import render_certificate_pdf


class NotEligible(Exception):
    """Raised when a course isn't completed, so no certificate can issue."""


def _eligible_enrollment(student, course) -> Enrollment:
    enrollment = Enrollment.objects.filter(student=student, course=course).first()
    if (
        not enrollment
        or enrollment.status != Enrollment.Status.COMPLETED
        or enrollment.progress_percentage < 100
    ):
        raise NotEligible(
            "Certificate can only be generated for a completed course (100%)."
        )
    return enrollment


@transaction.atomic
def issue_certificate(student, course, generated_by=Certificate.GeneratedBy.SYSTEM):
    """
    Idempotently issue (or return existing) certificate for a completed course.
    Raises NotEligible if the course isn't completed.
    """
    enrollment = _eligible_enrollment(student, course)

    certificate = Certificate.objects.filter(student=student, course=course).first()
    if certificate:
        return certificate

    completion = enrollment.completed_at.date() if enrollment.completed_at else None
    certificate = Certificate.objects.create(
        student=student,
        course=course,
        certificate_number=next_certificate_number(),
        completion_date=completion,
        percentage_completed=enrollment.progress_percentage,
        generated_by=generated_by,
    )
    _save_pdf(certificate)
    try:
        from notifications.models import notify
        notify(student, "certificate", "Certificate issued 🎉",
               f"You earned a certificate for {course.title}.", "/dashboard")
    except Exception:
        pass
    return certificate


def _save_pdf(certificate) -> None:
    """Render the PDF and store it via default storage (local now, R2 later)."""
    pdf = render_certificate_pdf(certificate)
    path = f"certificates/{certificate.certificate_number}.pdf"
    if default_storage.exists(path):
        default_storage.delete(path)
    default_storage.save(path, ContentFile(pdf))
    certificate.certificate_pdf_url = default_storage.url(path)
    certificate.save(update_fields=["certificate_pdf_url", "updated_at"])


def regenerate_pdf(certificate) -> None:
    """Admin action: re-render the stored PDF (e.g. after a template change)."""
    _save_pdf(certificate)


def get_pdf_bytes(certificate) -> bytes:
    """Return the stored PDF bytes, rendering on the fly if missing."""
    path = f"certificates/{certificate.certificate_number}.pdf"
    if default_storage.exists(path):
        with default_storage.open(path, "rb") as fh:
            return fh.read()
    return render_certificate_pdf(certificate)
