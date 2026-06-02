from django.conf import settings
from django.db import models


class CourseCreatorApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="creator_applications",
        on_delete=models.CASCADE,
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    expertise_area = models.CharField(max_length=200, blank=True)
    current_role = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    teaching_experience = models.TextField(blank=True)
    proposed_course_topics = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="reviewed_applications",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.status})"


class AuditLog(models.Model):
    """Simple audit trail for important governance actions."""

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="audit_logs",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    action = models.CharField(max_length=60)
    entity_type = models.CharField(max_length=60, blank=True)
    entity_id = models.CharField(max_length=60, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} · {self.entity_type}#{self.entity_id}"


def log_action(actor, action, entity_type="", entity_id="", note=""):
    AuditLog.objects.create(
        actor=actor if (actor and actor.is_authenticated) else None,
        action=action, entity_type=entity_type,
        entity_id=str(entity_id), note=note,
    )
