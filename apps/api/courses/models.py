from django.db import models


class Category(models.Model):
    """Top-level grouping for courses (e.g. Education, Computer, Language)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    class Level(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, related_name="courses", on_delete=models.SET_NULL, null=True
    )
    level = models.CharField(
        max_length=20, choices=Level.choices, default=Level.BEGINNER
    )
    language = models.CharField(max_length=50, default="English")
    thumbnail_url = models.URLField(blank=True)
    is_free = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Module(models.Model):
    """A section within a course that groups lessons."""

    course = models.ForeignKey(
        Course, related_name="modules", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    class LessonType(models.TextChoices):
        YOUTUBE = "youtube", "YouTube"
        VIDEO = "video", "Video"
        TEXT = "text", "Text"
        PDF = "pdf", "PDF"
        QUIZ = "quiz", "Quiz"

    module = models.ForeignKey(
        Module, related_name="lessons", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220)
    lesson_type = models.CharField(
        max_length=20, choices=LessonType.choices, default=LessonType.YOUTUBE
    )
    youtube_video_id = models.CharField(max_length=40, blank=True)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("module", "slug")

    def __str__(self):
        return self.title
