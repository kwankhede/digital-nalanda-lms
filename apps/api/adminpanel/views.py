import csv
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from certificates.models import Certificate
from content.models import (
    CommunityLibrary,
    Educator,
    LearningPath,
    NewsletterSubscriber,
    School,
    Story,
)
from courses.models import Course
from enrollments.models import Enrollment
from live_sessions.models import Event, LiveSession, SessionAttendance

from .permissions import IsStaffOrAdmin

User = get_user_model()


def _monthly(qs, field):
    """Return last-6-months [{month, count}] for a queryset's date field."""
    since = timezone.now() - timedelta(days=180)
    rows = (
        qs.filter(**{f"{field}__gte": since})
        .annotate(m=TruncMonth(field))
        .values("m")
        .annotate(count=Count("id"))
        .order_by("m")
    )
    return [
        {"month": r["m"].strftime("%b %Y") if r["m"] else "", "count": r["count"]}
        for r in rows
    ]


class AdminStatsView(APIView):
    """GET /api/admin/stats/ — operational metrics for the admin dashboard."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        totals = {
            "students": User.objects.filter(role="student").count(),
            "total_users": User.objects.count(),
            "enrollments": Enrollment.objects.count(),
            "completed_enrollments": Enrollment.objects.filter(status="completed").count(),
            "certificates": Certificate.objects.count(),
            "live_attendance": SessionAttendance.objects.filter(attendance_status="attended").count(),
            "newsletter_subscribers": NewsletterSubscriber.objects.count(),
            "courses": Course.objects.count(),
            "live_sessions": LiveSession.objects.count(),
            "events": Event.objects.count(),
            "schools": School.objects.count(),
            "learning_paths": LearningPath.objects.count(),
            "educators": Educator.objects.count(),
            "community_libraries": CommunityLibrary.objects.count(),
            "stories": Story.objects.count(),
        }
        completion_rate = (
            round(totals["completed_enrollments"] / totals["enrollments"] * 100)
            if totals["enrollments"] else 0
        )
        return Response({
            "totals": totals,
            "completion_rate": completion_rate,
            "student_growth": _monthly(User.objects.filter(role="student"), "date_joined"),
            "enrollment_growth": _monthly(Enrollment.objects, "enrolled_at"),
            "newsletter_growth": _monthly(NewsletterSubscriber.objects, "created_at"),
        })


class NewsletterListView(APIView):
    """GET /api/admin/newsletter/ — subscriber list (admin)."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        subs = NewsletterSubscriber.objects.all().values("id", "email", "created_at")
        return Response(list(subs))


class NewsletterExportView(APIView):
    """GET /api/admin/newsletter/export/ — CSV download (admin)."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="newsletter_subscribers.csv"'
        writer = csv.writer(response)
        writer.writerow(["email", "subscribed_at"])
        for s in NewsletterSubscriber.objects.all():
            writer.writerow([s.email, s.created_at.isoformat()])
        return response
