from rest_framework.permissions import BasePermission

MANAGE_ROLES = {"admin", "content_manager", "course_creator", "super_admin"}


class CanManageContent(BasePermission):
    """Staff/superuser, or admin / content-manager / course-creator roles."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated
            and (u.is_staff or u.is_superuser or getattr(u, "role", None) in MANAGE_ROLES)
        )
