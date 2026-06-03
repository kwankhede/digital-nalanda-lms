from rest_framework import serializers

from .models import ChatMessage, CounsellingRequest


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "text", "created_at"]


class CounsellingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assigned_name = serializers.SerializerMethodField()

    class Meta:
        model = CounsellingRequest
        fields = [
            "id", "category", "subject", "message", "status",
            "student_name", "assigned_name", "mentor_reply",
            "created_at", "updated_at",
        ]
        read_only_fields = ["status", "mentor_reply", "created_at", "updated_at"]

    def get_student_name(self, obj):
        return obj.student.full_name or obj.student.get_username()

    def get_assigned_name(self, obj):
        return obj.assigned_to.full_name if obj.assigned_to else None
