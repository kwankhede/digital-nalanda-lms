from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course, Lesson, Module

from .course_serializers import (
    AdminCourseReviewSerializer,
    CreatorCourseSerializer,
    CreatorLessonSerializer,
    CreatorModuleSerializer,
)
from .models import log_action
from .permissions import IsAdminRole, IsCourseCreator

EDITABLE = {Course.Status.DRAFT, Course.Status.REJECTED}


def _can_edit(user, course):
    if user.is_staff or user.is_superuser or getattr(user, "role", None) in (
        "admin", "content_manager", "super_admin"
    ):
        return True
    return course.created_by_id == user.id and course.status in EDITABLE


def _unique_course_slug(title):
    base = slugify(title) or "course"
    slug, i = base, 2
    while Course.objects.filter(slug=slug).exists():
        slug = f"{base}-{i}"
        i += 1
    return slug


# ---------------- Creator course management ----------------

class CreatorCourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CreatorCourseSerializer
    permission_classes = [IsCourseCreator]
    pagination_class = None

    def get_queryset(self):
        return Course.objects.filter(created_by=self.request.user).select_related("category")

    def perform_create(self, serializer):
        course = serializer.save(
            created_by=self.request.user,
            primary_instructor=self.request.user,
            status=Course.Status.DRAFT,
            is_published=False,
            slug=_unique_course_slug(serializer.validated_data["title"]),
        )
        log_action(self.request.user, "course_created", "Course", course.id)


class CreatorCourseDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CreatorCourseSerializer
    permission_classes = [IsCourseCreator]

    def get_queryset(self):
        return Course.objects.filter(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        if not _can_edit(request.user, course):
            return Response(
                {"detail": "This course can't be edited in its current state."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)


class SubmitCourseView(APIView):
    permission_classes = [IsCourseCreator]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk, created_by=request.user)
        if course.status not in EDITABLE:
            return Response(
                {"detail": "Only draft or rejected courses can be submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        course.status = Course.Status.SUBMITTED
        course.submitted_at = timezone.now()
        course.rejected_reason = ""
        course.save(update_fields=["status", "submitted_at", "rejected_reason"])
        log_action(request.user, "course_submitted", "Course", course.id)
        return Response(CreatorCourseSerializer(course).data)


class _OwnedModuleMixin:
    permission_classes = [IsCourseCreator]

    def _course_ok(self, user, course):
        return _can_edit(user, course)


class CreatorModuleCreateView(APIView):
    permission_classes = [IsCourseCreator]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        if not _can_edit(request.user, course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        ser = CreatorModuleSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        module = ser.save(course=course)
        return Response(CreatorModuleSerializer(module).data, status=status.HTTP_201_CREATED)


class CreatorModuleDetailView(APIView):
    permission_classes = [IsCourseCreator]

    def _get(self, request, pk):
        module = get_object_or_404(Module, pk=pk)
        if not _can_edit(request.user, module.course):
            return None
        return module

    def patch(self, request, pk):
        module = self._get(request, pk)
        if not module:
            return Response(status=status.HTTP_403_FORBIDDEN)
        ser = CreatorModuleSerializer(module, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        module = self._get(request, pk)
        if not module:
            return Response(status=status.HTTP_403_FORBIDDEN)
        module.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CreatorLessonCreateView(APIView):
    permission_classes = [IsCourseCreator]

    def post(self, request, pk):
        module = get_object_or_404(Module, pk=pk)
        if not _can_edit(request.user, module.course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        data = dict(request.data)
        data["slug"] = data.get("slug") or slugify(data.get("title", "lesson"))
        ser = CreatorLessonSerializer(data=data)
        ser.is_valid(raise_exception=True)
        lesson = ser.save(module=module)
        return Response(CreatorLessonSerializer(lesson).data, status=status.HTTP_201_CREATED)


class CreatorLessonDetailView(APIView):
    permission_classes = [IsCourseCreator]

    def _get(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        if not _can_edit(request.user, lesson.module.course):
            return None
        return lesson

    def patch(self, request, pk):
        lesson = self._get(request, pk)
        if not lesson:
            return Response(status=status.HTTP_403_FORBIDDEN)
        ser = CreatorLessonSerializer(lesson, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk):
        lesson = self._get(request, pk)
        if not lesson:
            return Response(status=status.HTTP_403_FORBIDDEN)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------- Admin course review ----------------

class AdminCourseReviewListView(generics.ListAPIView):
    serializer_class = AdminCourseReviewSerializer
    permission_classes = [IsAdminRole]
    pagination_class = None

    def get_queryset(self):
        qs = Course.objects.select_related("created_by", "category")
        status_f = self.request.query_params.get("status")
        return qs.filter(status=status_f) if status_f else qs


class AdminCourseReviewDetailView(generics.RetrieveUpdateAPIView):
    """GET + PATCH (admin can edit fields / assign instructor before publishing)."""

    queryset = Course.objects.select_related("created_by")
    serializer_class = AdminCourseReviewSerializer
    permission_classes = [IsAdminRole]


class _CourseTransition(APIView):
    permission_classes = [IsAdminRole]
    action = ""

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        now = timezone.now()
        a = self.action
        if a == "approve":
            course.status = Course.Status.APPROVED
            course.approved_by = request.user
            course.approved_at = now
        elif a == "reject":
            course.status = Course.Status.REJECTED
            course.rejected_reason = request.data.get("reason", "")
            course.is_published = False
        elif a == "publish":
            course.status = Course.Status.PUBLISHED
            course.is_published = True
            course.published_at = now
        elif a == "unpublish":
            course.status = Course.Status.DRAFT
            course.is_published = False
        elif a == "archive":
            course.status = Course.Status.ARCHIVED
            course.is_published = False
        course.save()
        log_action(request.user, f"course_{a}", "Course", course.id,
                   note=course.rejected_reason if a == "reject" else "")
        if course.created_by_id and a in ("publish", "approve", "reject"):
            try:
                from notifications.models import notify
                titles = {"publish": "Your course is published 🎉",
                          "approve": "Your course was approved",
                          "reject": "Your course needs changes"}
                notify(course.created_by, "course", titles[a], course.title,
                       f"/creator/courses/{course.id}/edit")
            except Exception:
                pass
        return Response(AdminCourseReviewSerializer(course).data)


class AdminApproveCourseView(_CourseTransition):
    action = "approve"


class AdminRejectCourseView(_CourseTransition):
    action = "reject"


class AdminPublishCourseView(_CourseTransition):
    action = "publish"


class AdminUnpublishCourseView(_CourseTransition):
    action = "unpublish"


class AdminArchiveCourseView(_CourseTransition):
    action = "archive"


# ---------------- Visual curriculum builder ----------------

from .course_serializers import CurriculumModuleSerializer  # noqa: E402


def _editable_or_admin(user, course):
    return _can_edit(user, course)


class CurriculumView(APIView):
    """GET /api/creator/courses/<id>/curriculum/ — full nested tree (owner/admin)."""

    permission_classes = [IsCourseCreator]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        is_admin = request.user.is_staff or getattr(request.user, "role", None) in (
            "admin", "content_manager", "super_admin"
        )
        if not is_admin and course.created_by_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        modules = course.modules.prefetch_related("lessons").all()
        return Response({
            "course": {"id": course.id, "title": course.title, "status": course.status},
            "modules": CurriculumModuleSerializer(modules, many=True).data,
        })


class CurriculumReorderView(APIView):
    """
    POST /api/creator/courses/<id>/reorder/
    Body: {"modules": [{"id": <m>, "lessons": [<l>, <l>...]}, ...]}
    Persists module order, lesson order, and moves lessons between modules.
    """

    permission_classes = [IsCourseCreator]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        if not _can_edit(request.user, course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        module_ids = {m.id for m in course.modules.all()}
        for m_index, m in enumerate(request.data.get("modules", [])):
            mid = m.get("id")
            if mid not in module_ids:
                continue
            Module.objects.filter(id=mid).update(order=m_index)
            for l_index, lid in enumerate(m.get("lessons", [])):
                # Move (set module) + order; scoped to this course's lessons.
                Lesson.objects.filter(id=lid, module__course=course).update(
                    module_id=mid, order=l_index
                )
        return Response({"detail": "Order saved."})


class DuplicateModuleView(APIView):
    permission_classes = [IsCourseCreator]

    def post(self, request, pk):
        module = get_object_or_404(Module, pk=pk)
        if not _can_edit(request.user, module.course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        lessons = list(module.lessons.all())
        new_module = Module.objects.create(
            course=module.course, title=f"{module.title} (copy)",
            order=module.course.modules.count(),
        )
        for l in lessons:
            Lesson.objects.create(
                module=new_module, title=l.title,
                slug=f"{l.slug}-copy-{new_module.id}", lesson_type=l.lesson_type,
                youtube_video_id=l.youtube_video_id, content=l.content,
                resource_url=l.resource_url, order=l.order,
                duration_minutes=l.duration_minutes, is_preview=l.is_preview,
                is_published=l.is_published,
            )
        return Response(CurriculumModuleSerializer(new_module).data, status=status.HTTP_201_CREATED)


class DuplicateLessonView(APIView):
    permission_classes = [IsCourseCreator]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        if not _can_edit(request.user, lesson.module.course):
            return Response(status=status.HTTP_403_FORBIDDEN)
        new = Lesson.objects.create(
            module=lesson.module, title=f"{lesson.title} (copy)",
            slug=f"{lesson.slug}-copy", lesson_type=lesson.lesson_type,
            youtube_video_id=lesson.youtube_video_id, content=lesson.content,
            resource_url=lesson.resource_url, order=lesson.module.lessons.count(),
            duration_minutes=lesson.duration_minutes, is_preview=lesson.is_preview,
            is_published=lesson.is_published,
        )
        from .course_serializers import CreatorLessonSerializer
        return Response(CreatorLessonSerializer(new).data, status=status.HTTP_201_CREATED)
