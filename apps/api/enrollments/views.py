from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.email import send_email
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

        # Best-effort confirmation (in-app + email); never blocks enrollment.
        try:
            from notifications.models import notify
            notify(
                request.user, "course", "You're enrolled 🎉",
                f"You are now enrolled in {course.title}.",
                f"/courses/{course.slug}",
            )
        except Exception:
            pass
        send_email(
            f"You're enrolled in {course.title}",
            request.user.email,
            (
                f"Hi {request.user.full_name or 'there'},\n\n"
                f"You're enrolled in \"{course.title}\" on Digital Nalanda.\n"
                f"Start learning any time — your progress is saved as you go.\n\n"
                f"Open the course: {self._course_url(course)}\n\n"
                "— Digital Nalanda"
            ),
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _course_url(course):
        from django.conf import settings as dj_settings
        base = getattr(dj_settings, "FRONTEND_URL", "").rstrip("/")
        return f"{base}/courses/{course.slug}"


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
