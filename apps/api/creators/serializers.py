from rest_framework import serializers

from .models import AuditLog, CourseCreatorApplication


class CreatorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCreatorApplication
        fields = [
            "id", "full_name", "email", "phone", "expertise_area",
            "current_role", "bio", "teaching_experience",
            "proposed_course_topics", "linkedin_url", "portfolio_url",
            "status", "admin_notes", "reviewed_at", "created_at",
        ]
        read_only_fields = ["email", "status", "admin_notes", "reviewed_at", "created_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = ["id", "actor_email", "action", "entity_type", "entity_id", "note", "created_at"]
