from rest_framework.permissions import BasePermission


def _role(user):
    return getattr(user, "role", None)


class IsAdminRole(BasePermission):
    """Staff/superuser, or admin / super_admin / event_manager roles.

    event_manager is included because this permission gates live-session and
    event management, which is exactly that role's job.
    """

    ALLOWED_ROLES = {"admin", "super_admin", "event_manager"}

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated
            and (u.is_staff or u.is_superuser or _role(u) in self.ALLOWED_ROLES)
        )


class IsMentorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated
            and (u.is_staff or _role(u) in ("mentor", "admin"))
        )
