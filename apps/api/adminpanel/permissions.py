from rest_framework.permissions import BasePermission

ADMIN_ROLES = {"admin", "content_manager", "super_admin"}


class IsStaffOrAdmin(BasePermission):
    """Staff/superuser, or users with an admin/content_manager role."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated
            and (u.is_staff or u.is_superuser or getattr(u, "role", None) in ADMIN_ROLES)
        )
