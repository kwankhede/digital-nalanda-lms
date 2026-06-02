from django.db import models


class School(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.CharField(max_length=300, blank=True)
    icon = models.CharField(max_length=10, blank=True)  # emoji
    image_url = models.URLField(blank=True)
    course_count = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class LearningPath(models.Model):
    name = models.CharField(max_length=140, unique=True)
    slug = models.SlugField(max_length=160, unique=True)
    description = models.CharField(max_length=300, blank=True)
    icon = models.CharField(max_length=10, blank=True)
    image_url = models.URLField(blank=True)
    course_count = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Educator(models.Model):
    name = models.CharField(max_length=150)
    expertise = models.CharField(max_length=200, blank=True)
    school = models.CharField(max_length=120, blank=True)
    photo_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class CommunityLibrary(models.Model):
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    description = models.CharField(max_length=300, blank=True)
    photo_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "community libraries"

    def __str__(self):
        return self.name


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class ImpactMetric(models.Model):
    """A single homepage impact statistic (e.g. 5000 + Students Reached)."""

    value = models.PositiveIntegerField()
    suffix = models.CharField(max_length=5, blank=True)  # "+", "%", ""
    label = models.CharField(max_length=120)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.value}{self.suffix} {self.label}"


class StoryCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "story categories"

    def __str__(self):
        return self.name


class Story(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(
        StoryCategory, related_name="stories",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    summary = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True)
    featured_image = models.URLField(blank=True)
    student_name = models.CharField(max_length=150)
    institution = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    graduation_year = models.CharField(max_length=10, blank=True)
    quote = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "-published_at", "-created_at"]
        verbose_name_plural = "stories"

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base = slugify(self.title) or "story"
            slug = base
            i = 2
            while Story.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class StoryMedia(models.Model):
    """Additional media for a story — future-ready for galleries / video."""

    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    story = models.ForeignKey(Story, related_name="media", on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.IMAGE)
    url = models.URLField()
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "story media"

    def __str__(self):
        return f"{self.story.title} — {self.media_type}"
