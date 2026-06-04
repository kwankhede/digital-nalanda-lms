from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, LiveSession, SessionAttendance
from .permissions import IsAdminRole, IsMentorOrAdmin
from .serializers import (
    EventSerializer,
    EventWriteSerializer,
    HomeItemSerializer,
    HomeRecordingSerializer,
    LiveSessionSerializer,
    LiveSessionWriteSerializer,
    PublicLiveSessionSerializer,
    SessionAttendanceSerializer,
)


def _visible_sessions():
    return (
        LiveSession.objects.exclude(status=LiveSession.Status.CANCELLED)
        .select_related("course", "mentor")
    )


# ---------------- Live sessions (public reads) ----------------

class LiveSessionListView(generics.ListAPIView):
    serializer_class = PublicLiveSessionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = _visible_sessions()
        course = self.request.query_params.get("course")
        if course:
            qs = qs.filter(course_id=course)
        return qs


class UpcomingLiveSessionsView(generics.ListAPIView):
    serializer_class = PublicLiveSessionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return _visible_sessions().filter(start_time__gte=timezone.now())


class RecordingsView(generics.ListAPIView):
    """GET /api/live-sessions/recordings/ — completed, public, has recording."""

    serializer_class = HomeRecordingSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            LiveSession.objects.filter(
                status=LiveSession.Status.COMPLETED,
                is_recording_public=True,
            )
            .exclude(recording_url="")
            .select_related("course", "mentor")
            .order_by("-start_time")
        )


class LiveSessionDetailView(generics.RetrieveAPIView):
    queryset = LiveSession.objects.select_related("course", "mentor")
    serializer_class = PublicLiveSessionSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class JoinSessionView(APIView):
    """POST /api/live-sessions/<slug>/join/ — record attendance, return URL."""

    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        session = get_object_or_404(LiveSession, slug=slug)
        attendance, _ = SessionAttendance.objects.get_or_create(
            student=request.user, session=session
        )
        attendance.attendance_status = SessionAttendance.AttendanceStatus.ATTENDED
        attendance.joined_at = timezone.now()
        attendance.save()
        return Response({"zoom_join_url": session.zoom_join_url})


# ---------------- Events (public reads) ----------------

class EventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Event.objects.exclude(status=Event.Status.CANCELLED)


class UpcomingEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Event.objects.exclude(status=Event.Status.CANCELLED).filter(
            start_time__gte=timezone.now()
        )


class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


# ---------------- Homepage unified endpoints ----------------

class HomeRecordingsView(APIView):
    """GET /api/home/recordings/ — last 5 public recordings, newest first."""

    permission_classes = [AllowAny]

    def get(self, request):
        qs = (
            LiveSession.objects.filter(
                status=LiveSession.Status.COMPLETED,
                is_recording_public=True,
            )
            .exclude(recording_url="")
            .select_related("course", "mentor")
            .order_by("-start_time")[:5]
        )
        return Response(HomeRecordingSerializer(qs, many=True).data)


class HomeUpcomingView(APIView):
    """
    GET /api/home/upcoming/ — upcoming live sessions + events, chronological,
    excluding cancelled.

    Defaults are tuned for the homepage card (max 10, next 30 days). The
    dedicated Live Classes & Events page passes larger values:
      ?limit=100&days=365
    Both are clamped so the endpoint can't be abused.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        def _int_param(name, default, max_value):
            try:
                val = int(request.query_params.get(name, default))
            except (TypeError, ValueError):
                val = default
            return max(1, min(val, max_value))

        limit = _int_param("limit", 10, 100)
        days = _int_param("days", 30, 365)

        now = timezone.now()
        horizon = now + timedelta(days=days)

        sessions = list(
            LiveSession.objects.exclude(status=LiveSession.Status.CANCELLED)
            .filter(start_time__gte=now, start_time__lte=horizon)
            .select_related("mentor")
        )
        events = list(
            Event.objects.exclude(status=Event.Status.CANCELLED)
            .filter(start_time__gte=now, start_time__lte=horizon)
        )
        combined = sorted(sessions + events, key=lambda o: o.start_time)[:limit]
        return Response(HomeItemSerializer(combined, many=True).data)


# ---------------- Admin management ----------------

class AdminLiveSessionListCreateView(generics.ListCreateAPIView):
    queryset = LiveSession.objects.select_related("course", "mentor")
    serializer_class = LiveSessionWriteSerializer
    permission_classes = [IsAdminRole]
    pagination_class = None


class AdminLiveSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionWriteSerializer
    permission_classes = [IsAdminRole]


class AdminEventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventWriteSerializer
    permission_classes = [IsAdminRole]
    pagination_class = None


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventWriteSerializer
    permission_classes = [IsAdminRole]


# ---------------- Mentor ----------------

class MentorSessionsView(generics.ListAPIView):
    serializer_class = LiveSessionSerializer
    permission_classes = [IsMentorOrAdmin]
    pagination_class = None

    def get_queryset(self):
        return LiveSession.objects.filter(
            mentor=self.request.user
        ).select_related("course", "mentor")


class SessionAttendanceListView(generics.ListAPIView):
    serializer_class = SessionAttendanceSerializer
    permission_classes = [IsMentorOrAdmin]
    pagination_class = None

    def get_queryset(self):
        session = get_object_or_404(LiveSession, slug=self.kwargs["slug"])
        user = self.request.user
        if not (user.is_staff or getattr(user, "role", None) == "admin"):
            if session.mentor_id != user.id:
                return SessionAttendance.objects.none()
        return session.attendance.select_related("student")


from django.http import HttpResponse  # noqa: E402
from .calendar import build_ics  # noqa: E402


def session_calendar_ics(request, slug):
    """GET /api/live-sessions/<slug>/calendar.ics — public ICS download."""
    session = get_object_or_404(LiveSession, slug=slug)
    ics = build_ics(session)
    resp = HttpResponse(ics, content_type="text/calendar; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="{slug}.ics"'
    return resp
