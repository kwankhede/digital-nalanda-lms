from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminUserActivateView,
    AdminUserDeactivateView,
    AdminUserDetailView,
    AdminUserListView,
    AdminUserSendPasswordResetView,
    AdminUserSetRoleView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ResendVerificationView,
    VerifyEmailView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path(
        "auth/password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset",
    ),
    path(
        "auth/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("auth/verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path(
        "auth/verify-email/resend/",
        ResendVerificationView.as_view(),
        name="verify-email-resend",
    ),
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path(
        "admin/users/<int:pk>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),
    path(
        "admin/users/<int:pk>/role/",
        AdminUserSetRoleView.as_view(),
        name="admin-user-set-role",
    ),
    path(
        "admin/users/<int:pk>/activate/",
        AdminUserActivateView.as_view(),
        name="admin-user-activate",
    ),
    path(
        "admin/users/<int:pk>/deactivate/",
        AdminUserDeactivateView.as_view(),
        name="admin-user-deactivate",
    ),
    path(
        "admin/users/<int:pk>/send-password-reset/",
        AdminUserSendPasswordResetView.as_view(),
        name="admin-user-send-password-reset",
    ),
]
