from rest_framework import serializers

from .models import Category, Course, Lesson, Module


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id", "title", "slug", "lesson_type", "youtube_video_id",
            "content", "order", "duration_minutes", "is_preview",
        ]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "title", "order", "lessons"]

    def get_lessons(self, obj):
        # Only expose published lessons to the public API.
        published = obj.lessons.filter(is_published=True)
        return LessonSerializer(published, many=True).data


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight payload for the course grid."""

    category = CategorySerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "short_description", "category",
            "level", "language", "thumbnail_url", "is_free",
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "short_description", "description",
            "category", "level", "language", "thumbnail_url", "is_free",
            "created_at", "updated_at", "modules",
        ]
