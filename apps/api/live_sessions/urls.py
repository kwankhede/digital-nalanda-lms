from django.urls import path

from .views import (
    AdminEventDetailView,
    AdminEventListCreateView,
    AdminLiveSessionDetailView,
    AdminLiveSessionListCreateView,
    EventDetailView,
    EventListView,
    HomeRecordingsView,
    HomeUpcomingView,
    JoinSessionView,
    LiveSessionDetailView,
    LiveSessionListView,
    MentorSessionsView,
    RecordingsView,
    SessionAttendanceListView,
    UpcomingEventsView,
    UpcomingLiveSessionsView,
)

urlpatterns = [
    # Live sessions (public reads)
    path("live-sessions/", LiveSessionListView.as_view(), name="live-session-list"),
    path("live-sessions/upcoming/", UpcomingLiveSessionsView.as_view(), name="live-session-upcoming"),
    path("live-sessions/recordings/", RecordingsView.as_view(), name="live-session-recordings"),
    path("live-sessions/<slug:slug>/", LiveSessionDetailView.as_view(), name="live-session-detail"),
    path("live-sessions/<slug:slug>/join/", JoinSessionView.as_view(), name="live-session-join"),
    path("live-sessions/<slug:slug>/attendance/", SessionAttendanceListView.as_view(), name="live-session-attendance"),

    # Events (public reads)
    path("events/", EventListView.as_view(), name="event-list"),
    path("events/upcoming/", UpcomingEventsView.as_view(), name="event-upcoming"),
    path("events/<slug:slug>/", EventDetailView.as_view(), name="event-detail"),

    # Homepage unified
    path("home/recordings/", HomeRecordingsView.as_view(), name="home-recordings"),
    path("home/upcoming/", HomeUpcomingView.as_view(), name="home-upcoming"),

    # Admin
    path("admin/live-sessions/", AdminLiveSessionListCreateView.as_view(), name="admin-live-session-list-create"),
    path("admin/live-sessions/<int:pk>/", AdminLiveSessionDetailView.as_view(), name="admin-live-session-detail"),
    path("admin/events/", AdminEventListCreateView.as_view(), name="admin-event-list-create"),
    path("admin/events/<int:pk>/", AdminEventDetailView.as_view(), name="admin-event-detail"),

    # Mentor
    path("mentor/live-sessions/", MentorSessionsView.as_view(), name="mentor-live-sessions"),
]
