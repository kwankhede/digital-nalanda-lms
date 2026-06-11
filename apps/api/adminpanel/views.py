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

from .permissions import IsStaffOrAdmin, IsSuperAdmin

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


def build_attention_payload(preview=5):
    """Everything waiting on a human: counts, oldest ages, previews."""
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
            for a in apps_qs[:preview]
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
            for c in review_qs[:preview]
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
            for r in open_counselling[:preview]
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
            for sub in ungraded_qs[:preview]
        ],
        "link": "/creator/assignments",
    }

    total = (
        applications["count"] + course_reviews["count"]
        + counselling["count"] + ungraded["count"]
    )
    return {
        "total_waiting": total,
        "queues": {
            "teacher_applications": applications,
            "course_reviews": course_reviews,
            "counselling": counselling,
            "ungraded_submissions": ungraded,
        },
    }


class AdminAttentionView(APIView):
    """GET /api/admin/attention/ — the operations "needs attention" inbox."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        return Response(build_attention_payload())


class CommandCenterView(APIView):
    """
    GET /api/admin/command-center/ — the Super Admin morning view.

    Four blocks:
      today    — signups, logins, enrollments, lessons completed (since 00:00 local)
      live     — sessions in the next 48h, flagging any without a join link
      alerts   — things silently going wrong (stale queues, past events still
                 "scheduled", published paths with no courses, dead courses)
      queues   — the full operations inbox (same shape as /api/admin/attention/)
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        from datetime import timedelta

        from progress.models import LessonProgress

        now = timezone.now()
        today_start = timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)
        horizon_48h = now + timedelta(hours=48)

        today = {
            "signups": User.objects.filter(date_joined__gte=today_start).count(),
            "logins": User.objects.filter(last_login__gte=today_start).count(),
            "enrollments": Enrollment.objects.filter(enrolled_at__gte=today_start).count(),
            "lessons_completed": LessonProgress.objects.filter(
                is_completed=True, completed_at__gte=today_start
            ).count(),
        }

        # --- live sessions in the next 48 hours
        sessions = LiveSession.objects.filter(
            status=LiveSession.Status.SCHEDULED,
            start_time__gte=now,
            start_time__lte=horizon_48h,
        ).order_by("start_time")
        live = [
            {
                "id": s.id,
                "title": s.title,
                "slug": s.slug,
                "start_time": s.start_time.isoformat(),
                "has_join_link": bool(s.zoom_join_url),
            }
            for s in sessions
        ]

        # --- alerts
        alerts = []
        attention = build_attention_payload(preview=3)
        for key, q in attention["queues"].items():
            if q["count"] and (q["oldest_days"] or 0) >= 7:
                alerts.append({
                    "severity": "high",
                    "message": f"{q['count']} item(s) in {key.replace('_', ' ')} — oldest waiting {q['oldest_days']} days",
                    "link": q["link"],
                })
        for sess in live:
            if not sess["has_join_link"]:
                alerts.append({
                    "severity": "high",
                    "message": f"Live session \"{sess['title']}\" starts soon but has no join link",
                    "link": "/events/dashboard",
                })
        stale_events = Event.objects.filter(
            status=Event.Status.SCHEDULED, start_time__lt=now
        ).count()
        if stale_events:
            alerts.append({
                "severity": "medium",
                "message": f"{stale_events} past event(s) still marked as scheduled — mark completed or cancelled",
                "link": "/events/dashboard",
            })
        empty_paths = LearningPath.objects.filter(
            is_published=True, path_courses__isnull=True
        ).distinct().count()
        if empty_paths:
            alerts.append({
                "severity": "medium",
                "message": f"{empty_paths} published learning path(s) have no courses linked",
                "link": "/admin/dashboard",
            })
        month_ago = now - timedelta(days=30)
        dead_courses = (
            Course.objects.filter(status=Course.Status.PUBLISHED)
            .exclude(enrollments__enrolled_at__gte=month_ago)
            .exclude(lesson_progress__last_watched_at__gte=month_ago)
            .distinct()
            .count()
        )
        if dead_courses:
            alerts.append({
                "severity": "low",
                "message": f"{dead_courses} published course(s) had no learner activity in 30 days",
                "link": "/admin/dashboard",
            })

        # --- people & roles snapshot
        role_counts = {
            r["role"]: r["n"]
            for r in User.objects.values("role").annotate(n=Count("id")).order_by("-n")
        }
        week_ago = now - timedelta(days=7)
        people = {
            "total": User.objects.count(),
            "by_role": role_counts,
            "new_this_week": User.objects.filter(date_joined__gte=week_ago).count(),
            "active_this_week": User.objects.filter(last_login__gte=week_ago).count(),
            "unverified_emails": User.objects.filter(email_verified=False).count(),
        }

        # --- platform snapshot (read-only visibility into configuration)
        from django.conf import settings as dj
        platform = {
            "debug": bool(dj.DEBUG),
            "email_backend": dj.EMAIL_BACKEND.split(".")[-2] if "." in dj.EMAIL_BACKEND else dj.EMAIL_BACKEND,
            "database_engine": dj.DATABASES["default"]["ENGINE"].rsplit(".", 1)[-1],
            "frontend_url": getattr(dj, "FRONTEND_URL", ""),
            "time_zone": dj.TIME_ZONE,
        }
        if platform["email_backend"] == "console":
            alerts.append({
                "severity": "low",
                "message": "Emails are using the console backend — real emails are NOT being sent (fine in dev).",
                "link": "/admin/command-center",
            })

        # Reminder-cron heartbeat: warn if sessions are imminent but no
        # reminder batch has ever been logged in the last 7 days.
        from live_sessions.models import SessionReminderLog
        recent_reminders = SessionReminderLog.objects.filter(sent_at__gte=week_ago).count()
        if live and recent_reminders == 0:
            alerts.append({
                "severity": "medium",
                "message": "Sessions are coming up but no reminders were sent in 7 days — is the send_session_reminders cron running?",
                "link": "/admin/command-center",
            })

        return Response({
            "today": today,
            "live_next_48h": live,
            "alerts": alerts,
            "attention": attention,
            "people": people,
            "platform": platform,
            "generated_at": now.isoformat(),
        })


class AdminReportsIndexView(APIView):
    """GET /api/admin/reports/ — all report segments with live counts."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        from .reports import SEGMENTS

        out = []
        for key, (label, desc, category, fn, metric_label) in SEGMENTS.items():
            try:
                count = fn().count()
            except Exception:
                count = 0
            out.append({
                "key": key, "label": label, "description": desc,
                "category": category, "count": count,
                "metric_label": metric_label,
            })
        return Response({"segments": out})


class AdminReportDetailView(APIView):
    """GET /api/admin/reports/<key>/?limit=50 — users in one segment."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request, key):
        from .reports import SEGMENTS

        seg = SEGMENTS.get(key)
        if not seg:
            return Response({"detail": "Unknown report."}, status=404)
        label, desc, category, fn, metric_label = seg
        limit = min(int(request.query_params.get("limit", 50)), 500)
        qs = fn()
        users = []
        for u in qs[:limit]:
            users.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "date_joined": u.date_joined.isoformat() if u.date_joined else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "metric": getattr(u, "metric", None),
            })
        return Response({
            "key": key, "label": label, "description": desc,
            "metric_label": metric_label, "count": qs.count(), "users": users,
        })


class AdminUsersExportView(APIView):
    """GET /api/admin/users/export/ — CSV of all users (the free version of
    LearnWorlds' "Export users report"). Optional ?report=<segment_key>."""

    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        from .reports import SEGMENTS

        key = request.query_params.get("report")
        if key and key in SEGMENTS:
            qs = SEGMENTS[key][3]()
            filename = f"users_{key}.csv"
        else:
            qs = User.objects.all().order_by("-date_joined")
            filename = "users_all.csv"

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow([
            "email", "full_name", "role", "date_joined", "last_login",
            "email_verified", "is_active", "metric",
        ])
        for u in qs:
            writer.writerow([
                u.email, u.full_name, u.role,
                u.date_joined.isoformat() if u.date_joined else "",
                u.last_login.isoformat() if u.last_login else "",
                getattr(u, "email_verified", ""), u.is_active,
                getattr(u, "metric", ""),
            ])
        return response
