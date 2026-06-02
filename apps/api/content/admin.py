from django.contrib import admin

from .models import (
    CommunityLibrary,
    Educator,
    LearningPath,
    NewsletterSubscriber,
    School,
)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "course_count", "order", "is_published")
    list_editable = ("course_count", "order", "is_published")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ("name", "course_count", "order", "is_published")
    list_editable = ("course_count", "order", "is_published")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Educator)
class EducatorAdmin(admin.ModelAdmin):
    list_display = ("name", "expertise", "school", "is_featured", "order")
    list_editable = ("is_featured", "order")
    search_fields = ("name", "expertise")


@admin.register(CommunityLibrary)
class CommunityLibraryAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "order")
    list_editable = ("order",)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
    search_fields = ("email",)
    readonly_fields = ("created_at",)
