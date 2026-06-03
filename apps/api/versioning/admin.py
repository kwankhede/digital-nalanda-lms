from django.contrib import admin

from .models import CourseVersion


@admin.register(CourseVersion)
class CourseVersionAdmin(admin.ModelAdmin):
    list_display = ("course", "version_number", "label",
                    "is_published_snapshot", "created_by", "created_at")
    list_filter = ("is_published_snapshot", "created_at")
    search_fields = ("course__title", "label", "change_summary")
    readonly_fields = ("snapshot", "created_at")
