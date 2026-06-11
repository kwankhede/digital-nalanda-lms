from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


def _unique_slug(model, title, instance_pk=None):
    """Generate a unique slug for a model from a title."""
    base = slugify(title)[:200] or "item"
    slug = base
    i = 2
    qs = model.objects.all()
    if instance_pk:
        qs = qs.exclude(pk=instance_pk)
    while qs.filter(slug=slug).exists():
        slug = f"{base}-{i}"
        i += 1
    return slug


class LiveSession(models.Model):
    """
    A scheduled live class / workshop.

    Phase 1: Zoom links are entered manually by admins (no Zoom API). Recording
    fields are filled in after the class. Field shape anticipates a future Zoom
    integration that could auto-populate join URLs, recordings, and attendance.
    """

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        LIVE = "live", "Live"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    course = models.ForeignKey(
        "courses.Course", related_name="live_sessions",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="mentored_sessions",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    zoom_join_url = models.URLField(blank=True)
    zoom_password = models.CharField(max_length=100, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED
    )
    is_featured = models.BooleanField(default=False)

    # Recording (filled in after the class)
    recording_url = models.URLField(blank=True)
    recording_thumbnail_url = models.URLField(blank=True)
    recording_title = models.CharField(max_length=200, blank=True)
    recording_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_recording_public = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(LiveSession, self.title, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} @ {self.start_time:%Y-%m-%d %H:%M}"

    @property
    def is_upcoming(self):
        return (
            self.status != self.Status.CANCELLED
            and self.start_time >= timezone.now()
        )


class Event(models.Model):
    """Workshops, webinars, community/offline events."""

    class EventType(models.TextChoices):
        WORKSHOP = "workshop", "Workshop"
        WEBINAR = "webinar", "Webinar"
        LIVE_CLASS = "live_class", "Live Class"
        OFFLINE_EVENT = "offline_event", "Offline Event"
        COMMUNITY_EVENT = "community_event", "Community Event"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    event_type = models.CharField(
        max_length=20, choices=EventType.choices, default=EventType.WORKSHOP
    )
    speaker_name = models.CharField(max_length=150, blank=True)
    speaker_title = models.CharField(max_length=150, blank=True)
    speaker_photo_url = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    online_url = models.URLField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    registration_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED
    )
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(Event, self.title, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_event_type_display()})"


class SessionAttendance(models.Model):
    """Records that a student attended a live session (manual for now)."""

    class AttendanceStatus(models.TextChoices):
        REGISTERED = "registered", "Registered"
        ATTENDED = "attended", "Attended"
        MISSED = "missed", "Missed"

    session = models.ForeignKey(
        LiveSession, related_name="attendance", on_delete=models.CASCADE
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="session_attendance",
        on_delete=models.CASCADE,
    )
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    attendance_status = models.CharField(
        max_length=20, choices=AttendanceStatus.choices,
        default=AttendanceStatus.REGISTERED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "session")
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.student} · {self.session} · {self.attendance_status}"


class SessionReminderLog(models.Model):
    """
    Records that a reminder batch was sent for a session, making the
    `send_session_reminders` management command idempotent. One row per
    (session, kind) regardless of how many recipients were notified.
    """

    class Kind(models.TextChoices):
        DAY_BEFORE = "24h", "24 hours before"
        SOON = "30m", "30 minutes before"

    session = models.ForeignKey(
        LiveSession, related_name="reminder_logs", on_delete=models.CASCADE
    )
    kind = models.CharField(max_length=10, choices=Kind.choices)
    sent_at = models.DateTimeField(auto_now_add=True)
    recipients_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("session", "kind")
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.session} · {self.kind} · {self.recipients_count} sent"
