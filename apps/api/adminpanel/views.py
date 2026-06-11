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


class AdminAttentionView(APIView):
    """
    GET /api/admin/attention/ — the operations "needs attention" inbox.

    One call returns everything waiting on a human, each with a count, the
    age of the oldest waiting item (days), and a small preview list. Born out
    of the gap analysis: unanswered queues are invisible until someone goes
    looking — this endpoint makes them impossible to miss.
    """

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    PREVIEW = 5

    def get(self, request):
        from assignments.models import Submission
        from assistant.models import CounsellingRequest
        from creators.models import CourseCreatorApplication

        now = timezone.now()

        def age_days(dt):
            return (now - dt).days if dt else None

        # Pending teacher applications
        apps_qs = CourseCreatorApplication.objects.filter(
            status=CourseCreatorApplication.Status.PENDING
        ).order_by("created_at")
        applications = {
            "count": apps_qs.count(),
            "oldest_days": age_days(apps_qs.values_list("created_at", flat=True).first()),
            "items": [
                {"id": a.id, "title": a.full_name, "waiting_days": age_days(a.created_at)}
                for a in apps_qs[: self.PREVIEW]
            ],
            "link": "/admin/applications",
        }

        # Courses submitted for review
        review_qs = Course.objects.filter(status=Course.Status.SUBMITTED).order_by("submitted_at")
        course_reviews = {
            "count": review_qs.count(),
            "oldest_days": age_days(review_qs.values_list("submitted_at", flat=True).first()),
            "items": [
                {"id": c.id, "title": c.title, "waiting_days": age_days(c.submitted_at or c.updated_at)}
                for c in review_qs[: self.PREVIEW]
            ],
            "link": "/admin/course-reviews",
        }

        # Counselling requests with no reply yet
        open_counselling = CounsellingRequest.objects.filter(
            status__in=[CounsellingRequest.Status.OPEN, CounsellingRequest.Status.IN_REVIEW]
        ).order_by("created_at")
        counselling = {
            "count": open_counselling.count(),
            "oldest_days": age_days(open_counselling.values_list("created_at", flat=True).first()),
            "items": [
                {"id": r.id, "title": r.subject, "waiting_days": age_days(r.created_at)}
                for r in open_counselling[: self.PREVIEW]
            ],
            "link": "/admin/counselling",
        }

        # Ungraded assignment submissions
        ungraded_qs = Submission.objects.filter(
            status=Submission.Status.SUBMITTED
        ).select_related("assignment").order_by("submitted_at")
        ungraded = {
            "count": ungraded_qs.count(),
            "oldest_days": age_days(ungraded_qs.values_list("submitted_at", flat=True).first()),
            "items": [
                {"id": sub.id, "title": sub.assignment.title, "waiting_days": age_days(sub.submitted_at)}
                for sub in ungraded_qs[: self.PREVIEW]
            ],
            "link": "/creator/assignments",
        }

        total = (
            applications["count"] + course_reviews["count"]
            + counselling["count"] + ungraded["count"]
        )
        return Response({
            "total_waiting": total,
            "queues": {
                "teacher_applications": applications,
                "course_reviews": course_reviews,
                "counselling": counselling,
                "ungraded_submissions": ungraded,
            },
        })
