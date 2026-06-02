from rest_framework.permissions import BasePermission


def _role(user):
    return getattr(user, "role", None)


class IsAdminRole(BasePermission):
    """Staff/superuser or users with the 'admin' role."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_staff or _role(u) == "admin"))


class IsMentorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated
            and (u.is_staff or _role(u) in ("mentor", "admin"))
        )
