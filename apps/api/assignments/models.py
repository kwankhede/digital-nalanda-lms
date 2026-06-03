from django.conf import settings
from django.db import models


class Assignment(models.Model):
    class Type(models.TextChoices):
        ESSAY = "essay", "Essay"
        PDF_UPLOAD = "pdf_upload", "PDF Upload"
        FILE_UPLOAD = "file_upload", "File Upload"
        TEXT_RESPONSE = "text_response", "Text Response"
        EXTERNAL_FORM = "external_form", "External Form"

    course = models.ForeignKey("courses.Course", related_name="assignments", on_delete=models.CASCADE)
    lesson = models.ForeignKey(
        "courses.Lesson", related_name="assignments", on_delete=models.SET_NULL, null=True, blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignment_type = models.CharField(max_length=20, choices=Type.choices, default=Type.TEXT_RESPONSE)
    external_url = models.URLField(blank=True)  # for external_form
    due_date = models.DateTimeField(null=True, blank=True)
    max_score = models.PositiveIntegerField(default=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="created_assignments",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date", "id"]

    def __str__(self):
        return f"{self.title} · {self.course.title}"


class Submission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        GRADED = "graded", "Graded"

    assignment = models.ForeignKey(Assignment, related_name="submissions", on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="submissions", on_delete=models.CASCADE)
    text_response = models.TextField(blank=True)
    file_url = models.URLField(blank=True)
    score = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="graded_submissions",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("assignment", "student")
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.student} · {self.assignment.title}"
