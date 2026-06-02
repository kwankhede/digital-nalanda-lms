from rest_framework.permissions import BasePermission

ADMIN_ROLES = {"admin", "content_manager"}


class IsStaffOrAdmin(BasePermission):
    """Staff/superuser, or users with an admin/content_manager role."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated
            and (u.is_staff or getattr(u, "role", None) in ADMIN_ROLES)
        )
