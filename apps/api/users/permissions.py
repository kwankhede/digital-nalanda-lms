from rest_framework.permissions import BasePermission

PROTECTED_ROLES = {"admin", "super_admin"}


class IsAdminOrSuperAdmin(BasePermission):
    """Allow only staff/superusers or users with admin/super_admin role."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return bool(
            user.is_staff
            or user.is_superuser
            or user.role in PROTECTED_ROLES
        )


def is_protected(u):
    """A protected user is a superuser or holds an admin/super_admin role."""
    return bool(u.is_superuser or u.role in PROTECTED_ROLES)
