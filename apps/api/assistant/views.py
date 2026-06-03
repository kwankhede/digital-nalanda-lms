from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from creators.permissions import IsAdminRole  # admins/content_manager/super_admin

from . import ai, bot
from .models import ChatMessage, CounsellingRequest
from .serializers import ChatMessageSerializer, CounsellingSerializer

CREATOR_ROLES = {"course_creator", "admin", "content_manager", "super_admin"}
MENTOR_ADMIN = {"mentor", "admin", "content_manager", "super_admin"}


def _is(user, roles):
    return user.is_staff or user.is_superuser or getattr(user, "role", None) in roles


# ---------- AI assistant (creator/admin only; suggestion-only) ----------

class AICourseSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _is(request.user, CREATOR_ROLES):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(ai.course_summary(
            request.data.get("title", ""), request.data.get("description", "")))


class AILessonSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _is(request.user, CREATOR_ROLES):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(ai.lesson_summary(
            request.data.get("title", ""), request.data.get("content", "")))


# ---------- Nalanda chatbot (logged-in users) ----------

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        msgs = ChatMessage.objects.filter(user=request.user)[:100]
        return Response(ChatMessageSerializer(msgs, many=True).data)

    def post(self, request):
        text = (request.data.get("message") or "").strip()
        if not text:
            return Response({"detail": "Message required."}, status=400)
        ChatMessage.objects.create(user=request.user, role="user", text=text)
        reply = bot.answer(text)
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
        return Response(CounsellingSerializer(req).data)
