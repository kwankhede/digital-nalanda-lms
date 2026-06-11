"""
Report segments for the Super Admin Reports page — the free-platform
equivalent of LearnWorlds' Reports Center. Each segment returns a queryset
of users (optionally annotated with a per-user metric).

Excluded by design (free platform / not yet built): paid enrollments,
in-app purchases, campaigns, seats/user-groups, mobile-app segments,
score-based segments (quizzes not built yet).
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone

User = get_user_model()


def _now():
    return timezone.now()


# ---------------------------------------------------------------- activity
def monthly_active_users():
    return User.objects.filter(last_login__gte=_now() - timedelta(days=30))


def logged_in_last_30_days():
    return monthly_active_users()


def not_enrolled_2_months():
    cutoff = _now() - timedelta(days=60)
    return User.objects.filter(role="student").exclude(
        enrollments__enrolled_at__gte=cutoff
    ).distinct()


def users_at_risk():
    """Inactive 30–60 days with <51% average progress."""
    from django.db.models import Avg

    now = _now()
    return (
        User.objects.filter(
            last_login__lt=now - timedelta(days=30),
            last_login__gte=now - timedelta(days=60),
        )
        .annotate(avg_progress=Avg("enrollments__progress_percentage"))
        .filter(avg_progress__lt=51)
    )


def enrolled_but_inactive():
    """Enrolled in the last 30 days but no login in the last 7."""
    now = _now()
    return User.objects.filter(
        enrollments__enrolled_at__gte=now - timedelta(days=30)
    ).filter(Q(last_login__lt=now - timedelta(days=7)) | Q(last_login__isnull=True)).distinct()


def initiated_a_course():
    return User.objects.filter(enrollments__isnull=False).distinct()


# ---------------------------------------------------------------- growth
def registered_today():
    today = timezone.localtime(_now()).replace(hour=0, minute=0, second=0, microsecond=0)
    return User.objects.filter(date_joined__gte=today)


def registered_this_week():
    return User.objects.filter(date_joined__gte=_now() - timedelta(days=7))


def registered_before_a_month():
    return User.objects.filter(date_joined__lt=_now() - timedelta(days=30))


def weekly_enrollments():
    return User.objects.filter(
        enrollments__enrolled_at__gte=_now() - timedelta(days=7)
    ).distinct()


# ------------------------------------------------------- learning performance
def most_certificates(qs_limit=200):
    return (
        User.objects.annotate(metric=Count("certificates"))
        .filter(metric__gt=0).order_by("-metric")
    )


def most_accomplished():
    return (
        User.objects.annotate(
            metric=Count("enrollments", filter=Q(enrollments__status="completed"))
        ).filter(metric__gt=0).order_by("-metric")
    )


def most_enrollments():
    return (
        User.objects.annotate(metric=Count("enrollments"))
        .filter(metric__gt=0).order_by("-metric")
    )


def most_unfinished():
    return (
        User.objects.annotate(
            metric=Count(
                "enrollments",
                filter=Q(enrollments__status="active", enrollments__progress_percentage__lt=100),
            )
        ).filter(metric__gt=0).order_by("-metric")
    )


def study_time():
    """Total watch time, hours (metric)."""
    return (
        User.objects.annotate(metric=Sum("lesson_progress__watch_seconds"))
        .filter(metric__gt=0).order_by("-metric")
    )


def certified_users():
    return User.objects.filter(certificates__isnull=False).distinct()


SEGMENTS = {
    # key: (label, description, category, fn, metric_label or None)
    "monthly_active": ("Monthly active users", "Active in the last 30 days.", "Users Activity", monthly_active_users, None),
    "not_enrolled_2m": ("Not enrolled in 2+ months", "Lapsed students with no new enrollments.", "Users Activity", not_enrolled_2_months, None),
    "at_risk": ("Users at risk", "Inactive 30–60 days with <51% completion.", "Users Activity", users_at_risk, None),
    "enrolled_inactive": ("Enrolled but inactive", "Enrolled recently, no login in 7 days.", "Users Activity", enrolled_but_inactive, None),
    "initiated_course": ("Initiated a course", "Enrolled in at least one course.", "Users Activity", initiated_a_course, None),
    "registered_today": ("Registered today", "Joined since midnight.", "Users Growth", registered_today, None),
    "registered_week": ("Registered this week", "Joined in the last 7 days.", "Users Growth", registered_this_week, None),
    "registered_old": ("Registered before a month", "Joined more than 30 days ago.", "Users Growth", registered_before_a_month, None),
    "weekly_enrollments": ("Weekly enrollments", "Enrolled in any course this week.", "Users Growth", weekly_enrollments, None),
    "most_certificates": ("Most certificates", "Ranked by certificates earned.", "Learning Performance", most_certificates, "certificates"),
    "most_accomplished": ("Most accomplished learners", "Ranked by completed courses.", "Learning Performance", most_accomplished, "completed courses"),
    "most_enrollments": ("Most course enrollments", "Ranked by enrollments.", "Learning Performance", most_enrollments, "enrollments"),
    "most_unfinished": ("Most unfinished courses", "Ranked by in-progress courses.", "Learning Performance", most_unfinished, "unfinished"),
    "study_time": ("Study time", "Ranked by total watch time.", "Learning Performance", study_time, "seconds watched"),
    "certified": ("Certified users", "Earned at least one certificate.", "Learning Performance", certified_users, None),
}
