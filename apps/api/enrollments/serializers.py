from rest_framework import serializers

from courses.models import Lesson
from courses.serializers import CourseListSerializer
from progress.models import LessonProgress

from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id", "course", "status", "enrolled_at", "completed_at",
            "progress_percentage", "completed_lessons", "total_lessons",
        ]

    def get_completed_lessons(self, obj):
        return LessonProgress.objects.filter(
            student=obj.student, course=obj.course,
            is_completed=True, lesson__is_published=True,
        ).count()

    def get_total_lessons(self, obj):
        return Lesson.objects.filter(
            module__course=obj.course, is_published=True
        ).count()
