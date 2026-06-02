from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Lesson
from enrollments.models import Enrollment
from enrollments.serializers import EnrollmentSerializer
from enrollments.services import recalc_progress

from .models import LessonProgress
from .serializers import LessonProgressSerializer, WatchProgressInputSerializer


def _require_enrollment(user, course):
    """Return the enrollment or None — progress requires being enrolled."""
    return Enrollment.objects.filter(student=user, course=course).first()


class MyProgressView(generics.ListAPIView):
    """
    GET /api/my/progress/ — the student's lesson progress.
    Optional filter: ?course=<slug>
    """

    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = LessonProgress.objects.filter(student=self.request.user)
        course_slug = self.request.query_params.get("course")
        if course_slug:
            qs = qs.filter(course__slug=course_slug)
        return qs


class LessonProgressView(APIView):
    """POST /api/lessons/<id>/progress/ — record watch time (heartbeat)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk, is_published=True)
        course = lesson.module.course
        if not _require_enrollment(request.user, course):
            return Response(
                {"detail": "Enroll in the course first."},
                status=status.HTTP_403_FORBIDDEN,
            )
        data = WatchProgressInputSerializer(data=request.data)
        data.is_valid(raise_exception=True)

        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user, lesson=lesson,
            defaults={"course": course},
        )
        if "watch_seconds" in data.validated_data:
            # Keep the max watched position.
            progress.watch_seconds = max(
                progress.watch_seconds, data.validated_data["watch_seconds"]
            )
        progress.last_watched_at = timezone.now()
        progress.save()
        return Response(LessonProgressSerializer(progress).data)


class LessonCompleteView(APIView):
    """POST /api/lessons/<id>/complete/ — mark a lesson complete."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk, is_published=True)
        course = lesson.module.course
        if not _require_enrollment(request.user, course):
            return Response(
                {"detail": "Enroll in the course first."},
                status=status.HTTP_403_FORBIDDEN,
            )
        progress, _ = LessonProgress.objects.get_or_create(
            student=request.user, lesson=lesson,
            defaults={"course": course},
        )
        if not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save(update_fields=["is_completed", "completed_at"])

        # Auto-recalculate the enrollment's progress percentage / completion.
        enrollment = recalc_progress(request.user, course)
        return Response({
            "lesson": LessonProgressSerializer(progress).data,
            "enrollment": EnrollmentSerializer(enrollment).data if enrollment else None,
        })
