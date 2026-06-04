from datetime import timedelta

from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _safe(fn, default=0):
    """Run a query callable, returning default if anything goes wrong."""
    try:
        return fn()
    except Exception:
        return default


def _is(user, roles):
    """True if the user's role is in `roles`, or they are staff/superuser
    (treated as admin)."""
    if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
        if "admin" in roles or "super_admin" in roles:
            return True
    return getattr(user, "role", None) in roles


# Friendly labels for common audit-log actions.
_ACTION_LABELS = {
    "user_role_changed": "Role changed",
    "application_approved": "Application approved",
    "application_rejected": "Application rejected",
    "course_approved": "Course approved",
    "course_rejected": "Course rejected",
    "course_published": "Course published",
    "course_submitted": "Course submitted",
}


def _humanize_action(action):
    if action in _ACTION_LABELS:
        return _ACTION_LABELS[action]
    return (action or "activity").replace("_", " ").capitalize()


class DashboardSummaryView(APIView):
    """GET /api/dashboard/summary/ — role-tailored dashboard data.

    Every query is wrapped defensively so a missing relation/app never 500s;
    failed lookups simply contribute 0 (or an empty list).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, "role", "student") or "student"

        if _is(user, {"admin", "super_admin"}):
            data = self._admin(user)
        elif _is(user, {"course_creator"}):
            data = self._creator(user)
        elif _is(user, {"mentor"}):
            data = self._mentor(user)
        elif _is(user, {"event_manager"}):
            data = self._event_manager(user)
        elif _is(user, {"content_manager", "library_coordinator"}):
            data = self._content_manager(user)
        else:
            data = self._student(user)

        data["role"] = role
        return Response(data)

    # ------------------------------------------------------------------ admin
    def _admin(self, user):
        from users.models import User
        from courses.models import Course
        from content.models import School
        from live_sessions.models import LiveSession
        from certificates.models import Certificate
        from creators.models import CourseCreatorApplication, AuditLog
        from assistant.models import CounsellingRequest

        metrics = {
            "users": _safe(lambda: User.objects.count()),
            "students": _safe(lambda: User.objects.filter(role="student").count()),
            "teachers": _safe(
                lambda: User.objects.filter(role="course_creator").count()
            ),
            "courses": _safe(lambda: Course.objects.count()),
            "schools": _safe(lambda: School.objects.count()),
            "live_classes": _safe(lambda: LiveSession.objects.count()),
            "certificates": _safe(lambda: Certificate.objects.count()),
        }

        pending = []
        apps_pending = _safe(
            lambda: CourseCreatorApplication.objects.filter(
                status=CourseCreatorApplication.Status.PENDING
            ).count()
        )
        if apps_pending:
            pending.append({
                "label": "Teacher applications to review",
                "count": apps_pending,
                "href": "/admin/applications",
            })

        courses_review = _safe(
            lambda: Course.objects.filter(status="submitted").count()
        )
        if courses_review:
            pending.append({
                "label": "Courses awaiting review",
                "count": courses_review,
                "href": "/admin/course-reviews",
            })

        counselling_open = _safe(
            lambda: CounsellingRequest.objects.exclude(
                status=CounsellingRequest.Status.CLOSED
            ).count()
        )
        if counselling_open:
            pending.append({
                "label": "Counselling requests open",
                "count": counselling_open,
                "href": "/admin/counselling",
            })

        recent = _safe(self._admin_recent, default=[])
        return {"metrics": metrics, "pending": pending, "recent": recent}

    def _admin_recent(self):
        from creators.models import AuditLog

        out = []
        for log in AuditLog.objects.all()[:8]:
            label = _humanize_action(log.action)
            suffix = ""
            if log.entity_type:
                suffix = f" {log.entity_type}#{log.entity_id}"
            out.append({
                "text": f"{label}{suffix}".strip(),
                "at": log.created_at.isoformat(),
            })
        return out

    # ---------------------------------------------------------------- creator
    def _creator(self, user):
        from courses.models import Course
        from enrollments.models import Enrollment

        own = Course.objects.filter(created_by=user)
        metrics = {
            "draft": _safe(lambda: own.filter(status="draft").count()),
            "submitted": _safe(lambda: own.filter(status="submitted").count()),
            "published": _safe(lambda: own.filter(status="published").count()),
            "rejected": _safe(lambda: own.filter(status="rejected").count()),
            "students": _safe(
                lambda: Enrollment.objects.filter(course__created_by=user)
                .values("student").distinct().count()
            ),
        }

        pending = []
        drafts = metrics["draft"]
        if drafts:
            pending.append({
                "label": "Drafts to submit",
                "count": drafts,
                "href": "/creator/dashboard",
            })
        rejected = metrics["rejected"]
        if rejected:
            pending.append({
                "label": "Rejected — needs changes",
                "count": rejected,
                "href": "/creator/dashboard",
            })

        def _recent():
            out = []
            for c in own.order_by("-updated_at")[:6]:
                out.append({
                    "text": f"'{c.title}' is {c.status}",
                    "at": c.updated_at.isoformat(),
                })
            return out

        recent = _safe(_recent, default=[])
        return {"metrics": metrics, "pending": pending, "recent": recent}

    # ----------------------------------------------------------------- mentor
    def _mentor(self, user):
        from assistant.models import CounsellingRequest
        from assignments.models import Submission

        counselling_open = _safe(
            lambda: CounsellingRequest.objects.exclude(
                status=CounsellingRequest.Status.CLOSED
            ).count()
        )
        submissions_to_grade = _safe(
            lambda: Submission.objects.filter(
                status=Submission.Status.SUBMITTED
            ).count()
        )

        metrics = {
            "counselling_open": counselling_open,
            "submissions_to_grade": submissions_to_grade,
        }

        pending = []
        if counselling_open:
            pending.append({
                "label": "Counselling to answer",
                "count": counselling_open,
                "href": "/admin/counselling",
            })
        if submissions_to_grade:
            pending.append({
                "label": "Assignments to grade",
                "count": submissions_to_grade,
                "href": "/creator/assignments",
            })

        return {"metrics": metrics, "pending": pending, "recent": []}

    # ---------------------------------------------------------- event_manager
    def _event_manager(self, user):
        from live_sessions.models import LiveSession, Event

        now = timezone.now()
        upcoming_sessions = _safe(
            lambda: LiveSession.objects.filter(start_time__gte=now)
            .exclude(status=LiveSession.Status.CANCELLED).count()
        )
        upcoming_events = _safe(
            lambda: Event.objects.filter(start_time__gte=now)
            .exclude(status=Event.Status.CANCELLED).count()
        )

        metrics = {
            "upcoming_sessions": upcoming_sessions,
            "upcoming_events": upcoming_events,
        }

        pending = []
        week = _safe(
            lambda: LiveSession.objects.filter(
                start_time__gte=now, start_time__lte=now + timedelta(days=7)
            ).exclude(status=LiveSession.Status.CANCELLED).count()
        )
        if week:
            pending.append({
                "label": "Upcoming classes this week",
                "count": week,
                "href": "/events",
            })

        return {"metrics": metrics, "pending": pending, "recent": []}

    # -------------------------------------------------------- content_manager
    def _content_manager(self, user):
        from content.models import School, Educator, Story, StudyMaterial

        metrics = {
            "schools": _safe(lambda: School.objects.count()),
            "educators": _safe(lambda: Educator.objects.count()),
            "stories": _safe(lambda: Story.objects.count()),
            "study_materials": _safe(lambda: StudyMaterial.objects.count()),
        }

        pending = []
        unpublished = _safe(
            lambda: School.objects.filter(is_published=False).count()
        )
        if unpublished:
            pending.append({
                "label": "Unpublished schools",
                "count": unpublished,
                "href": "/admin/schools",
            })

        return {"metrics": metrics, "pending": pending, "recent": []}

    # ---------------------------------------------------------------- student
    def _student(self, user):
        from enrollments.models import Enrollment
        from certificates.models import Certificate
        from assignments.models import Assignment, Submission

        enrolled = _safe(
            lambda: Enrollment.objects.filter(student=user).count()
        )
        in_progress = _safe(
            lambda: Enrollment.objects.filter(student=user)
            .exclude(status=Enrollment.Status.COMPLETED).count()
        )
        certificates = _safe(
            lambda: Certificate.objects.filter(student=user).count()
        )

        def _assignments_due():
            course_ids = Enrollment.objects.filter(student=user).values_list(
                "course_id", flat=True
            )
            submitted_ids = Submission.objects.filter(
                student=user
            ).values_list("assignment_id", flat=True)
            return Assignment.objects.filter(
                course_id__in=list(course_ids), is_published=True
            ).exclude(id__in=list(submitted_ids)).count()

        assignments_due = _safe(_assignments_due)

        metrics = {
            "enrolled": enrolled,
            "in_progress": in_progress,
            "certificates": certificates,
            "assignments_due": assignments_due,
        }

        pending = []
        if assignments_due:
            pending.append({
                "label": "Assignments to submit",
                "count": assignments_due,
                "href": "/dashboard",
            })
        if in_progress:
            pending.append({
                "label": "Continue learning",
                "count": in_progress,
                "href": "/dashboard",
            })

        return {"metrics": metrics, "pending": pending, "recent": []}
