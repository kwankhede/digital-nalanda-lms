from django.contrib import admin

from .models import SessionReminderLog, Event, LiveSession, SessionAttendance


class AttendanceInline(admin.TabularInline):
    model = SessionAttendance
    extra = 0
    readonly_fields = ("student", "joined_at", "left_at", "duration_minutes", "attendance_status")


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "mentor", "start_time", "status", "is_featured")
    list_filter = ("status", "is_featured")
    search_fields = ("title", "mentor__email", "course__title")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [AttendanceInline]
    fieldsets = (
        (None, {"fields": ("title", "slug", "description", "course", "mentor", "is_featured")}),
        ("Schedule", {"fields": ("start_time", "end_time", "status")}),
        ("Zoom (manual)", {"fields": ("zoom_join_url", "zoom_password")}),
        ("Recording", {"fields": (
            "recording_url", "recording_thumbnail_url", "recording_title",
            "recording_duration_minutes", "is_recording_public",
        )}),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "event_type", "speaker_name", "start_time", "status", "is_featured")
    list_filter = ("event_type", "status", "is_featured")
    search_fields = ("title", "speaker_name")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(SessionAttendance)
class SessionAttendanceAdmin(admin.ModelAdmin):
    list_display = ("student", "session", "attendance_status", "joined_at")
    list_filter = ("attendance_status",)
    search_fields = ("student__email", "session__title")


@admin.register(SessionReminderLog)
class SessionReminderLogAdmin(admin.ModelAdmin):
    list_display = ("session", "kind", "sent_at", "recipients_count")
    list_filter = ("kind",)
