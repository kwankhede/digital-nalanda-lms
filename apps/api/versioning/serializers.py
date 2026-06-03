from rest_framework import serializers

from .models import CourseVersion


class CourseVersionListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    module_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = CourseVersion
        fields = [
            "id", "version_number", "label", "change_summary",
            "is_published_snapshot", "created_by_name", "created_at",
            "module_count", "lesson_count",
        ]

    def get_created_by_name(self, obj):
        u = obj.created_by
        return (getattr(u, "full_name", "") or getattr(u, "email", "")) if u else "System"

    def get_module_count(self, obj):
        return len(obj.snapshot.get("modules", []))

    def get_lesson_count(self, obj):
        return sum(len(m.get("lessons", [])) for m in obj.snapshot.get("modules", []))


class CourseVersionDetailSerializer(CourseVersionListSerializer):
    class Meta(CourseVersionListSerializer.Meta):
        fields = CourseVersionListSerializer.Meta.fields + ["snapshot"]
