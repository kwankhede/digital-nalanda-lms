from django.contrib import admin

from .models import Assignment, Submission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "assignment_type", "due_date", "max_score", "is_published")
    list_filter = ("assignment_type", "is_published")
    search_fields = ("title", "course__title")


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("assignment", "student", "status", "score", "submitted_at")
    list_filter = ("status",)
    search_fields = ("student__email", "assignment__title")
