from django.contrib import admin

from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "audience", "is_active", "start_date", "end_date")
    list_filter = ("audience", "is_active")
    search_fields = ("title",)
