from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        COURSE = "course", "Course"
        ASSIGNMENT = "assignment", "Assignment"
        LIVE_CLASS = "live_class", "Live Class"
        EVENT = "event", "Event"
        CERTIFICATE = "certificate", "Certificate"
        ANNOUNCEMENT = "announcement", "Announcement"
        DISCUSSION = "discussion", "Discussion"
        COUNSELLING = "counselling", "Counselling"
        SYSTEM = "system", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="notifications", on_delete=models.CASCADE
    )
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} · {self.type} · {self.title}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, related_name="notification_pref", on_delete=models.CASCADE
    )
    # Notification types the user has muted (in-app).
    muted_types = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"Prefs for {self.user}"


def notify(user, type, title, message="", link=""):
    """Create an in-app notification unless the user muted this type. Best-effort."""
    if user is None:
        return None
    pref = NotificationPreference.objects.filter(user=user).first()
    if pref and type in (pref.muted_types or []):
        return None
    return Notification.objects.create(
        user=user, type=type, title=title, message=message, link=link
    )
