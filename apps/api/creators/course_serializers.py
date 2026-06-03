from rest_framework import serializers

from courses.models import Course, Lesson, Module


class CreatorCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "short_description", "description",
            "category", "level", "language", "thumbnail_url", "is_free",
            "status", "rejected_reason", "submitted_at", "approved_at",
            "published_at", "created_at", "updated_at",
        ]
        read_only_fields = [
            "slug", "status", "rejected_reason", "submitted_at", "approved_at",
            "published_at", "created_at", "updated_at",
        ]


class CreatorModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ["id", "course", "title", "order"]
        read_only_fields = ["course"]


class CreatorLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id", "module", "title", "slug", "lesson_type",
            "youtube_video_id", "content", "resource_url", "live_session",
            "blocks", "order", "duration_minutes", "is_preview", "is_published",
        ]
        read_only_fields = ["module"]


class AdminCourseReviewSerializer(serializers.ModelSerializer):
    creator_email = serializers.EmailField(source="created_by.email", read_only=True, default=None)

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "short_description", "description",
            "category", "level", "language", "thumbnail_url", "is_free",
            "status", "created_by", "creator_email", "primary_instructor",
            "rejected_reason", "submitted_at", "approved_at", "published_at",
        ]
        read_only_fields = ["status", "created_by", "submitted_at", "approved_at", "published_at"]


class CurriculumLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id", "title", "slug", "lesson_type", "youtube_video_id",
            "content", "resource_url", "live_session", "blocks", "order",
            "duration_minutes", "is_preview", "is_published",
        ]


class CurriculumModuleSerializer(serializers.ModelSerializer):
    lessons = CurriculumLessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "order", "lessons"]
