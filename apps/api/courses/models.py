from django.db import models


class MigrationMeta(models.Model):
    """
    Mixin of bookkeeping fields that make content migration-ready.

    All fields are optional so existing/native content is unaffected and the
    public API is unchanged (serializers don't expose these). They let an
    importer record where a row came from and trace it back to the source.
    """

    class SourcePlatform(models.TextChoices):
        NATIVE = "native", "Native (created here)"
        LEARNWORLDS = "learnworlds", "LearnWorlds"
        CSV = "csv", "CSV import"
        OTHER = "other", "Other"

    # ID of this record on the source platform (e.g. LearnWorlds course id).
    external_id = models.CharField(max_length=191, blank=True, db_index=True)
    source_platform = models.CharField(
        max_length=20, choices=SourcePlatform.choices,
        default=SourcePlatform.NATIVE,
    )
    # Canonical URL on the original site, for reference / redirects.
    original_url = models.URLField(blank=True)
    migration_notes = models.TextField(blank=True)
    imported_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class Category(models.Model):
    """Top-level grouping for courses (e.g. Education, Computer, Language)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(MigrationMeta):
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


class Module(MigrationMeta):
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


class Lesson(MigrationMeta):
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
