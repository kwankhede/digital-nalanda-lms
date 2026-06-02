from django.contrib import admin

from .models import AuditLog, CourseCreatorApplication


@admin.register(CourseCreatorApplication)
class CourseCreatorApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "status", "reviewed_by", "created_at")
    list_filter = ("status",)
    search_fields = ("full_name", "email", "expertise_area")
    readonly_fields = ("created_at", "updated_at", "reviewed_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "actor", "created_at")
    list_filter = ("action", "entity_type")
    search_fields = ("action", "note")
    readonly_fields = ("actor", "action", "entity_type", "entity_id", "note", "created_at")
