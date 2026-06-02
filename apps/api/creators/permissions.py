from rest_framework.permissions import BasePermission

ADMIN_ROLES = {"admin", "content_manager", "super_admin"}
CREATOR_ROLES = {"course_creator"} | ADMIN_ROLES


def _role(u):
    return getattr(u, "role", None)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_staff or u.is_superuser or _role(u) in ADMIN_ROLES))


class IsCourseCreator(BasePermission):
    """Approved course creators (or admins) may use creator APIs."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_staff or u.is_superuser or _role(u) in CREATOR_ROLES))
