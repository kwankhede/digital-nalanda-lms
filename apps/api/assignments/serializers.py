from rest_framework import serializers

from .models import Assignment, Submission


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_title", "lesson", "title", "description",
            "assignment_type", "external_url", "due_date", "max_score", "is_published",
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    max_score = serializers.IntegerField(source="assignment.max_score", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "assignment_title", "student", "student_name",
            "text_response", "file_url", "score", "max_score", "feedback",
            "status", "submitted_at", "graded_at",
        ]
        read_only_fields = ["student", "score", "feedback", "status", "graded_at"]

    def get_student_name(self, obj):
        return obj.student.full_name or obj.student.get_username()


class MyAssignmentSerializer(serializers.ModelSerializer):
    """Assignment + this student's submission (if any)."""

    course_title = serializers.CharField(source="course.title", read_only=True)
    submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_title", "title", "description",
            "assignment_type", "external_url", "due_date", "max_score", "submission",
        ]

    def get_submission(self, obj):
        sub = getattr(obj, "_my_sub", None)
        return SubmissionSerializer(sub).data if sub else None
