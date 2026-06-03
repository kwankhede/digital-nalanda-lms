from django.contrib import admin

from .models import (
    CommunityLibrary,
    Educator,
    ImpactMetric,
    LearningPath,
    NewsletterSubscriber,
    School,
)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "course_count", "order", "is_featured", "is_published")
    list_editable = ("course_count", "order", "is_featured", "is_published")
    list_filter = ("is_published", "is_featured")
    search_fields = ("name", "description", "tagline")
    prepopulated_fields = {"slug": ("name",)}
    fields = ("name", "slug", "tagline", "description", "long_description",
              "icon", "image_url", "hero_image_url", "course_count",
              "order", "is_featured", "is_published")


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ("name", "course_count", "order", "is_published")
    list_editable = ("course_count", "order", "is_published")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Educator)
class EducatorAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "school", "is_featured", "order")
    list_editable = ("is_featured", "order")
    list_filter = ("school", "is_featured")
    search_fields = ("name", "expertise", "school", "bio")
    prepopulated_fields = {"slug": ("name",)}
    fields = ("name", "slug", "title", "expertise", "school", "bio", "long_bio",
              "photo_url", "linkedin_url", "website_url", "is_featured", "order")


@admin.register(CommunityLibrary)
class CommunityLibraryAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "order")
    list_editable = ("order",)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
    search_fields = ("email",)
    readonly_fields = ("created_at",)


@admin.register(ImpactMetric)
class ImpactMetricAdmin(admin.ModelAdmin):
    list_display = ("label", "value", "suffix", "order", "is_published")
    list_editable = ("value", "suffix", "order", "is_published")


from .models import Story, StoryCategory, StoryMedia  # noqa: E402


class StoryMediaInline(admin.TabularInline):
    model = StoryMedia
    extra = 1


@admin.register(StoryCategory)
class StoryCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ("title", "student_name", "institution", "is_featured", "is_published", "display_order")
    list_editable = ("is_featured", "is_published", "display_order")
    list_filter = ("is_featured", "is_published", "category")
    search_fields = ("title", "student_name", "institution")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [StoryMediaInline]
