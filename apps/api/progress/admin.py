from django.contrib import admin

from .models import LessonProgress


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ("student", "lesson", "course", "is_completed", "watch_seconds", "last_watched_at")
    list_filter = ("is_completed",)
    search_fields = ("student__email", "lesson__title")
