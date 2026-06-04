from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from django.core.cache import cache

from creators.permissions import IsAdminRole  # admins/content_manager/super_admin

from . import ai, bot
from .models import ChatMessage, CounsellingRequest
from .serializers import ChatMessageSerializer, CounsellingSerializer
from core.email import send_email

CREATOR_ROLES = {"course_creator", "admin", "content_manager", "super_admin"}
MENTOR_ADMIN = {"mentor", "admin", "content_manager", "super_admin"}


def _is(user, roles):
    return user.is_staff or user.is_superuser or getattr(user, "role", None) in roles


# ---------- AI assistant (creator/admin only; suggestion-only) ----------

class AICourseSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai"

    def post(self, request):
        if not _is(request.user, CREATOR_ROLES):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(ai.course_summary(
            request.data.get("title", ""), request.data.get("description", "")))


class AILessonSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai"

    def post(self, request):
        if not _is(request.user, CREATOR_ROLES):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(ai.lesson_summary(
            request.data.get("title", ""), request.data.get("content", "")))


# ---------- Public AI course summary (any visitor) ----------

class PublicCourseSummaryView(APIView):
    """AI summary of a published course, available to everyone (read-only).

    Throttled and cached per course so a public, AI-backed endpoint can't be
    abused to run up Gemini cost.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai"

    def get(self, request, slug):
        from courses.models import Course
        cache_key = f"course_ai_summary:{slug}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        course = get_object_or_404(Course, slug=slug, status="published")
        text = course.description or course.short_description or ""
        data = ai.course_summary(course.title, text)
        cache.set(cache_key, data, 60 * 60 * 6)  # 6 hours
        return Response(data)


# ---------- Nalanda chatbot (logged-in users) ----------

class ChatView(APIView):
    # Open to everyone — visitors can ask the assistant before signing up.
    # History is only stored for logged-in users; throttled to limit abuse.
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "chat"

    def get(self, request):
        if not request.user.is_authenticated:
            return Response([])
        msgs = ChatMessage.objects.filter(user=request.user)[:100]
        return Response(ChatMessageSerializer(msgs, many=True).data)

    def post(self, request):
        text = (request.data.get("message") or "").strip()
        if not text:
            return Response({"detail": "Message required."}, status=400)
        reply = bot.answer(text)
        if request.user.is_authenticated:
            ChatMessage.objects.create(user=request.user, role="user", text=text)
            ChatMessage.objects.create(user=request.user, role="bot", text=reply)
        return Response({"reply": reply})


# ---------- Counselling ----------

class CounsellingListCreateView(generics.ListCreateAPIView):
    serializer_class = CounsellingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return CounsellingRequest.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class CounsellingDetailView(generics.RetrieveAPIView):
    serializer_class = CounsellingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Students see only their own.
        return CounsellingRequest.objects.filter(student=self.request.user)


class CounsellingManageListView(generics.ListAPIView):
    """Mentors/admins see all requests (assigned to them or unassigned)."""

    serializer_class = CounsellingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        if not _is(self.request.user, MENTOR_ADMIN):
            return CounsellingRequest.objects.none()
        qs = CounsellingRequest.objects.select_related("student", "assigned_to")
        status_f = self.request.query_params.get("status")
        return qs.filter(status=status_f) if status_f else qs


class CounsellingReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not _is(request.user, MENTOR_ADMIN):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            req = CounsellingRequest.objects.get(pk=pk)
        except CounsellingRequest.DoesNotExist:
            return Response(status=404)
        action = request.data.get("action", "reply")
        if action == "assign":
            req.assigned_to = request.user
            req.status = CounsellingRequest.Status.IN_REVIEW
        elif action == "close":
            req.status = CounsellingRequest.Status.CLOSED
        else:
            req.mentor_reply = request.data.get("mentor_reply", req.mentor_reply)
            req.status = CounsellingRequest.Status.REPLIED
            if not req.assigned_to:
                req.assigned_to = request.user
        req.save()
        if action not in ("assign",):
            try:
                from notifications.models import notify
                notify(req.student, "counselling", "Mentor replied to your request",
                       req.subject, "/dashboard/counselling")
            except Exception:
                pass

        data = CounsellingSerializer(req).data
        if action == "reply":
            send_email(
                "You have a reply to your counselling request",
                getattr(req.student, "email", None),
                f"A mentor has replied to your counselling request "
                f"\"{req.subject}\".\n\n"
                "You can read the reply under Dashboard -> Counselling."
                "\n\n— Digital Nalanda",
            )
        return Response(data)
