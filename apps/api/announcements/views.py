from django.utils import timezone
from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Announcement
from .serializers import AnnouncementSerializer

# Map a user's role to the audiences they should see.
ROLE_AUDIENCE = {
    "student": {"all", "students"},
    "course_creator": {"all", "teachers"},
    "teacher_applicant": {"all", "teachers"},
    "mentor": {"all", "mentors"},
    "content_manager": {"all", "admins"},
    "admin": {"all", "admins"},
    "super_admin": {"all", "admins"},
}


class ActiveAnnouncementsView(generics.ListAPIView):
    """GET /api/announcements/active/ — live announcements for this audience."""

    serializer_class = AnnouncementSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        now = timezone.now()
        qs = Announcement.objects.filter(is_active=True, start_date__lte=now).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        )
        user = self.request.user
        if user.is_authenticated:
            auds = ROLE_AUDIENCE.get(getattr(user, "role", "student"), {"all"})
            if user.is_staff:
                auds = auds | {"admins"}
            return qs.filter(audience__in=auds)
        return qs.filter(audience="all")
