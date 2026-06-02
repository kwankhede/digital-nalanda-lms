from django.conf import settings
from django.db import models


class LessonProgress(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="lesson_progress",
        on_delete=models.CASCADE,
    )
    course = models.ForeignKey(
        "courses.Course",
        related_name="lesson_progress",
        on_delete=models.CASCADE,
    )
    lesson = models.ForeignKey(
        "courses.Lesson",
        related_name="progress",
        on_delete=models.CASCADE,
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    watch_seconds = models.PositiveIntegerField(default=0)
    last_watched_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # One progress row per student per lesson.
        unique_together = ("student", "lesson")
        ordering = ["lesson__order", "id"]

    def __str__(self):
        return f"{self.student} · {self.lesson} · {'done' if self.is_completed else 'in progress'}"
