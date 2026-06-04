from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from enrollments.models import Enrollment

from .models import Assignment, Submission
from .serializers import AssignmentSerializer, MyAssignmentSerializer, SubmissionSerializer

CREATOR_ROLES = {"course_creator", "admin", "content_manager", "super_admin"}
GRADER_ROLES = {"mentor", "course_creator", "admin", "content_manager", "super_admin"}


def _is(user, roles):
    return user.is_staff or user.is_superuser or getattr(user, "role", None) in roles


def _can_manage_course(user, course):
    if _is(user, {"admin", "content_manager", "super_admin"}):
        return True
    return course.created_by_id == user.id


# ---------- Creator: manage assignments on own courses ----------

class CourseAssignmentsView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Assignment.objects.filter(course_id=self.kwargs["pk"])

    def create(self, request, *args, **kwargs):
        course = get_object_or_404(Course, pk=self.kwargs["pk"])
        if not (_is(request.user, CREATOR_ROLES) and _can_manage_course(request.user, course)):
            return Response(status=status.HTTP_403_FORBIDDEN)
        ser = self.get_serializer(data={**request.data, "course": course.id})
        ser.is_valid(raise_exception=True)
        ser.save(created_by=request.user, course=course)
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Prevent IDOR: admins see all; course owners see their own; students
        # see only published assignments in courses they are enrolled in.
        u = self.request.user
        base = Assignment.objects.select_related("course")
        if _is(u, {"admin", "content_manager", "super_admin"}):
            return base
        own = base.filter(course__created_by=u)
        course_ids = Enrollment.objects.filter(student=u).values_list("course_id", flat=True)
        enrolled = base.filter(is_published=True, course_id__in=course_ids)
        return (own | enrolled).distinct()

    def update(self, request, *a, **k):
        if not _can_manage_course(request.user, self.get_object().course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *a, **k)

    def destroy(self, request, *a, **k):
        if not _can_manage_course(request.user, self.get_object().course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *a, **k)


# ---------- Student ----------

class MyAssignmentsView(generics.ListAPIView):
    """Assignments from courses the student is enrolled in, with own submission."""

    serializer_class = MyAssignmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        course_ids = Enrollment.objects.filter(student=self.request.user).values_list("course_id", flat=True)
        qs = list(Assignment.objects.filter(course_id__in=course_ids, is_published=True).select_related("course"))
        subs = {s.assignment_id: s for s in Submission.objects.filter(student=self.request.user)}
        for a in qs:
            a._my_sub = subs.get(a.id)
        return qs


class SubmitAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        assignment = get_object_or_404(Assignment, pk=pk, is_published=True)
        if not Enrollment.objects.filter(student=request.user, course=assignment.course).exists():
            return Response({"detail": "Enroll in the course first."}, status=status.HTTP_403_FORBIDDEN)
        sub, _ = Submission.objects.get_or_create(assignment=assignment, student=request.user)
        sub.text_response = request.data.get("text_response", sub.text_response)
        sub.file_url = request.data.get("file_url", sub.file_url)
        sub.status = Submission.Status.SUBMITTED
        sub.submitted_at = timezone.now()
        sub.save()
        return Response(SubmissionSerializer(sub).data)


# ---------- Grading (teacher/mentor/admin) ----------

class AssignmentSubmissionsView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        assignment = get_object_or_404(Assignment, pk=self.kwargs["pk"])
        u = self.request.user
        # Only the course's owner/admin can see its submissions (no blanket
        # "any mentor sees every course" access — that was an IDOR).
        if not _can_manage_course(u, assignment.course):
            return Submission.objects.none()
        return assignment.submissions.select_related("student")


class GradeSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        sub = get_object_or_404(Submission.objects.select_related("assignment__course", "student"), pk=pk)
        u = request.user
        if not _can_manage_course(u, sub.assignment.course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sub.score = request.data.get("score", sub.score)
        sub.feedback = request.data.get("feedback", sub.feedback)
        sub.status = Submission.Status.GRADED
        sub.graded_by = u
        sub.graded_at = timezone.now()
        sub.save()
        try:
            from notifications.models import notify
            notify(sub.student, "assignment", "Assignment graded",
                   f"{sub.assignment.title}: {sub.score}/{sub.assignment.max_score}", "/dashboard")
        except Exception:
            pass
        return Response(SubmissionSerializer(sub).data)


class MyCourseAssignmentsView(generics.ListAPIView):
    """All assignments for courses the teacher owns (for the grading page)."""

    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        u = self.request.user
        if not _is(u, CREATOR_ROLES):
            return Assignment.objects.none()
        return Assignment.objects.filter(course__created_by=u).select_related("course")
