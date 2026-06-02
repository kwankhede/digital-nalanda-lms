from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course

from .models import Enrollment
from .serializers import EnrollmentSerializer


class EnrollView(APIView):
    """POST /api/courses/<slug>/enroll/ — enroll the logged-in student."""

    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        course = get_object_or_404(Course, slug=slug, is_published=True)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user, course=course
        )
        serializer = EnrollmentSerializer(enrollment)
        if not created:
            # Idempotent: already enrolled is not an error, just report it.
            return Response(
                {"detail": "Already enrolled.", "enrollment": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyEnrollmentsView(generics.ListAPIView):
    """GET /api/my/enrollments/ — all of the student's enrollments."""

    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return (
            Enrollment.objects.filter(student=self.request.user)
            .select_related("course", "course__category")
        )


class MyCoursesView(MyEnrollmentsView):
    """
    GET /api/my/courses/ — courses the student is enrolled in (active or
    completed), each with its progress. Excludes cancelled enrollments.
    """

    def get_queryset(self):
        return super().get_queryset().exclude(
            status=Enrollment.Status.CANCELLED
        )
