from django.db import models
from django.utils import timezone


class Announcement(models.Model):
    class Audience(models.TextChoices):
        ALL = "all", "All users"
        STUDENTS = "students", "Students"
        TEACHERS = "teachers", "Teachers / creators"
        MENTORS = "mentors", "Mentors"
        ADMINS = "admins", "Admins"

    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    audience = models.CharField(max_length=20, choices=Audience.choices, default=Audience.ALL)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.title

    @property
    def is_live(self):
        now = timezone.now()
        return (
            self.is_active and self.start_date <= now
            and (self.end_date is None or self.end_date >= now)
        )
