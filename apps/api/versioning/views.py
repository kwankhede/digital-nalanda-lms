from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course

from . import services
from .models import CourseVersion
from .serializers import CourseVersionDetailSerializer, CourseVersionListSerializer

ADMIN_ROLES = {"admin", "content_manager", "super_admin"}
EDITABLE = {Course.Status.DRAFT, Course.Status.REJECTED}


def _is_admin(user):
    return bool(
        user.is_staff or user.is_superuser
        or getattr(user, "role", None) in ADMIN_ROLES
    )


def _can_view(user, course):
    return _is_admin(user) or course.created_by_id == user.id


def _can_edit(user, course):
    if _is_admin(user):
        return True
    return course.created_by_id == user.id and course.status in EDITABLE


class CourseVersionListView(APIView):
    """GET list versions / POST create a manual checkpoint (owner or admin)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        if not _can_view(request.user, course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        versions = course.versions.all()
        return Response(CourseVersionListSerializer(versions, many=True).data)

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        if not _can_edit(request.user, course):
            return Response(
                {"detail": "You can't checkpoint this course."},
                status=status.HTTP_403_FORBIDDEN,
            )
        v = services.create_version(
            course, user=request.user,
            label=request.data.get("label", "") or "Manual checkpoint",
            change_summary=request.data.get("change_summary", ""),
        )
        return Response(
            CourseVersionListSerializer(v).data, status=status.HTTP_201_CREATED
        )


class CourseVersionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, number):
        course = get_object_or_404(Course, pk=pk)
        if not _can_view(request.user, course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        v = get_object_or_404(CourseVersion, course=course, version_number=number)
        return Response(CourseVersionDetailSerializer(v).data)


class WorkingDiffView(APIView):
    """Diff the current working draft against the latest published snapshot."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        if not _can_view(request.user, course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        data = services.diff_working_vs_published(course)
        data["has_changes"] = services.has_changes(data["diff"])
        return Response(data)


class CompareVersionsView(APIView):
    """Compare two saved versions (a -> b)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk, a, b):
        course = get_object_or_404(Course, pk=pk)
        if not _can_view(request.user, course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        va = get_object_or_404(CourseVersion, course=course, version_number=a)
        vb = get_object_or_404(CourseVersion, course=course, version_number=b)
        diff = services.diff_snapshots(va.snapshot, vb.snapshot)
        return Response({
            "from_version": va.version_number,
            "to_version": vb.version_number,
            "has_changes": services.has_changes(diff),
            "diff": diff,
        })


class RestoreVersionView(APIView):
    """Roll the working draft back to a saved version (owner-editable or admin)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk, number):
        course = get_object_or_404(Course, pk=pk)
        if not _can_edit(request.user, course):
            return Response(
                {"detail": "This course can't be restored in its current state."},
                status=status.HTTP_403_FORBIDDEN,
            )
        v = get_object_or_404(CourseVersion, course=course, version_number=number)
        services.restore_version(course, v, user=request.user)
        try:
            from creators.models import log_action
            log_action(request.user, "course_restored", "Course", course.id,
                       note=f"restored to v{number}")
        except Exception:
            pass
        return Response({
            "detail": f"Restored to version {number}.",
            "versions": CourseVersionListSerializer(course.versions.all(), many=True).data,
        })
