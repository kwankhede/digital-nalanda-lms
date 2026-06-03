from django.conf import settings
from django.db import models

from courses.models import Course


class CourseVersion(models.Model):
    """
    An immutable snapshot of a course's full curriculum at a point in time.

    The live Course/Module/Lesson rows are the *working draft* that creators
    edit. Each published copy (and any manual checkpoint) is frozen here as a
    JSON snapshot so we can show history, diff working-vs-published, compare any
    two versions, and roll back. Snapshots never change after creation.
    """

    course = models.ForeignKey(
        Course, related_name="versions", on_delete=models.CASCADE
    )
    version_number = models.PositiveIntegerField()
    label = models.CharField(max_length=160, blank=True)
    change_summary = models.TextField(blank=True)
    # Full course + modules + lessons tree. See services.build_snapshot().
    snapshot = models.JSONField(default=dict)
    # True when this snapshot represents a published (student-facing) copy.
    is_published_snapshot = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="course_versions",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version_number"]
        unique_together = ("course", "version_number")
        indexes = [models.Index(fields=["course", "-version_number"])]

    def __str__(self):
        tag = " (published)" if self.is_published_snapshot else ""
        return f"{self.course_id} v{self.version_number}{tag}"
