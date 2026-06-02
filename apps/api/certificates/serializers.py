from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    """Owner-facing certificate data (dashboard + generate response)."""

    course_title = serializers.CharField(source="course.title", read_only=True)
    course_slug = serializers.SlugField(source="course.slug", read_only=True)
    recipient_name = serializers.CharField(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            "id", "certificate_number", "verification_code", "course_title",
            "course_slug", "recipient_name", "issue_date", "completion_date",
            "percentage_completed", "is_revoked",
        ]


class CertificateVerifySerializer(serializers.ModelSerializer):
    """
    PUBLIC verification payload. Intentionally minimal — no email, no IDs,
    no private profile info.
    """

    student_name = serializers.CharField(source="recipient_name", read_only=True)
    course_name = serializers.CharField(source="course.title", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "student_name", "course_name", "certificate_number",
            "issue_date", "status",
        ]

    def get_status(self, obj):
        return "valid" if obj.is_valid else "invalid"
