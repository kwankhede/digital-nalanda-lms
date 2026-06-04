from django.contrib.auth import get_user_model
from django.core import signing
from django.core.cache import cache
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.email import send_email
from creators.models import log_action

from .permissions import IsAdminOrSuperAdmin, is_protected
from .serializers import (
    AdminUserSerializer,
    EmailTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


def _build_reset_link(user):
    """Return a frontend reset-password link with uid + token for the user."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"


EMAIL_VERIFY_SALT = "dn-email-verify"
EMAIL_VERIFY_MAX_AGE = 3 * 24 * 3600  # 3 days


def _build_verify_link(user):
    token = signing.dumps({"uid": user.pk}, salt=EMAIL_VERIFY_SALT)
    return f"{settings.FRONTEND_URL}/verify-email?token={token}"


def _send_verification(user):
    link = _build_verify_link(user)
    send_email(
        "Verify your Digital Nalanda email",
        user.email,
        (
            f"Hi {user.full_name or 'there'},\n\n"
            "Please confirm your email address for Digital Nalanda by opening "
            f"the link below:\n{link}\n\n"
            "This link expires in 3 days. If you didn't create an account, "
            "you can ignore this email.\n\n— Digital Nalanda"
        ),
    )


# Login lockout (cache-based). Locks an email after repeated failures.
LOGIN_MAX_FAILS = 5
LOGIN_LOCK_SECONDS = 15 * 60  # 15 minutes


def _fail_key(email):
    return f"loginfail:{email}"


def _lock_key(email):
    return f"loginlock:{email}"



class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create account and return JWT tokens."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Best-effort welcome email; never block registration on email issues.
        send_email(
            "Welcome to Digital Nalanda",
            user.email,
            (
                f"Hi {user.full_name or 'there'},\n\n"
                "Welcome to Digital Nalanda! Your account has been created "
                "successfully. We're glad to have you join our learning "
                "community.\n\n"
                "Happy learning,\nThe Digital Nalanda Team"
            ),
        )

        _send_verification(user)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — email + password, returns access/refresh.

    Adds account lockout: after %d failed attempts an email is locked for
    %d minutes (cache-based; use Redis in production for cross-worker locks).
    """ % (LOGIN_MAX_FAILS, LOGIN_LOCK_SECONDS // 60)

    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        email = (request.data.get("email") or "").strip().lower()
        if email and cache.get(_lock_key(email)):
            return Response(
                {"detail": "Too many failed attempts. Please try again in a "
                           "few minutes, or reset your password."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        try:
            resp = super().post(request, *args, **kwargs)
        except Exception:
            if email:
                n = (cache.get(_fail_key(email)) or 0) + 1
                cache.set(_fail_key(email), n, LOGIN_LOCK_SECONDS)
                if n >= LOGIN_MAX_FAILS:
                    cache.set(_lock_key(email), True, LOGIN_LOCK_SECONDS)
            raise
        if email and resp.status_code == 200:
            cache.delete(_fail_key(email))
            cache.delete(_lock_key(email))
        return resp


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"detail": "refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — current user's profile."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# --- Password reset ---------------------------------------------------------

class PasswordResetRequestView(APIView):
    """POST /api/auth/password-reset/ — email a reset link if the account exists."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    GENERIC_RESPONSE = {
        "detail": "If an account exists for that email, a reset link has been sent."
    }

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email).first()
        if user is not None:
            link = _build_reset_link(user)
            send_email(
                "Reset your Digital Nalanda password",
                user.email,
                (
                    "We received a request to reset your Digital Nalanda "
                    "password.\n\n"
                    f"Use the link below to set a new password:\n{link}\n\n"
                    "This link will expire soon. If you didn't request a "
                    "password reset, you can safely ignore this email."
                ),
            )

        # Always return the same response — never reveal whether the email exists.
        return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """POST /api/auth/password-reset/confirm/ — set a new password from uid+token."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    INVALID_RESPONSE = {"detail": "This reset link is invalid or has expired."}

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(self.INVALID_RESPONSE, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response(self.INVALID_RESPONSE, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response(
            {"detail": "Password updated. You can now log in."},
            status=status.HTTP_200_OK,
        )


# --- Admin user management --------------------------------------------------

class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/ — list users with optional search/role filter."""

    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q

            qs = qs.filter(
                Q(email__icontains=search) | Q(full_name__icontains=search)
            )
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminUserDetailView(generics.RetrieveAPIView):
    """GET /api/admin/users/<pk>/ — single user detail."""

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]


def _requester_is_super(user):
    return bool(user.is_superuser or user.role == "super_admin")


class AdminUserSetRoleView(APIView):
    """POST /api/admin/users/<pk>/role/ — change a user's role."""

    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request, pk):
        target = generics.get_object_or_404(User, pk=pk)
        role = request.data.get("role")

        # (a) cannot change your own role
        if target == request.user:
            return Response(
                {"detail": "You cannot change your own role."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # (b) non-super-admin cannot modify a protected target nor assign
        #     a protected role.
        if not _requester_is_super(request.user):
            if is_protected(target) or role in {"admin", "super_admin"}:
                return Response(
                    {
                        "detail": "Only a super admin can modify admins or "
                        "assign admin roles."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # (c) role must be valid
        if role not in User.Role.values:
            return Response(
                {"detail": "Invalid role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target.role = role
        target.save()
        log_action(
            request.user, "user_role_changed", "User", target.id,
            note=f"role -> {role}",
        )
        return Response(AdminUserSerializer(target).data, status=status.HTTP_200_OK)


class AdminUserActivateView(APIView):
    """POST /api/admin/users/<pk>/activate/ — activate a user."""

    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request, pk):
        target = generics.get_object_or_404(User, pk=pk)
        target.is_active = True
        target.save()
        log_action(request.user, "user_activated", "User", target.id)
        return Response(AdminUserSerializer(target).data, status=status.HTTP_200_OK)


class AdminUserDeactivateView(APIView):
    """POST /api/admin/users/<pk>/deactivate/ — deactivate a user."""

    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request, pk):
        target = generics.get_object_or_404(User, pk=pk)

        # cannot deactivate yourself
        if target == request.user:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # a non-super-admin cannot deactivate a protected target
        if not _requester_is_super(request.user) and is_protected(target):
            return Response(
                {"detail": "Only a super admin can deactivate an admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        target.is_active = False
        target.save()
        log_action(request.user, "user_deactivated", "User", target.id)
        return Response(AdminUserSerializer(target).data, status=status.HTTP_200_OK)


class AdminUserSendPasswordResetView(APIView):
    """POST /api/admin/users/<pk>/send-password-reset/ — email a reset link."""

    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def post(self, request, pk):
        target = generics.get_object_or_404(User, pk=pk)
        link = _build_reset_link(target)
        send_email(
            "Reset your Digital Nalanda password",
            target.email,
            (
                "An administrator has initiated a password reset for your "
                "Digital Nalanda account.\n\n"
                f"Use the link below to set a new password:\n{link}\n\n"
                "This link will expire soon."
            ),
        )
        log_action(
            request.user, "user_password_reset_sent", "User", target.id
        )
        return Response(
            {"detail": "Password reset email sent."},
            status=status.HTTP_200_OK,
        )



# --- Email verification -----------------------------------------------------

class VerifyEmailView(APIView):
    """POST /api/auth/verify-email/ — confirm an email from a signed token."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "email_verify"

    def post(self, request):
        token = request.data.get("token", "")
        try:
            data = signing.loads(token, salt=EMAIL_VERIFY_SALT, max_age=EMAIL_VERIFY_MAX_AGE)
            user = User.objects.get(pk=data["uid"])
        except (signing.BadSignature, signing.SignatureExpired, KeyError, TypeError, User.DoesNotExist):
            return Response(
                {"detail": "This verification link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.email_verified:
            user.email_verified = True
            user.save(update_fields=["email_verified"])
        return Response({"detail": "Email verified. Thank you!"}, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    """POST /api/auth/verify-email/resend/ — resend the verification email."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "email_verify"

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response({"detail": "Your email is already verified."}, status=status.HTTP_200_OK)
        _send_verification(user)
        return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)
