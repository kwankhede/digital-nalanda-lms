from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """Authenticate using email + password (case-insensitive email)."""

    def authenticate(self, request, email=None, username=None, password=None, **kwargs):
        identifier = email or username
        if identifier is None or password is None:
            return None
        try:
            user = User.objects.get(email__iexact=identifier.strip())
        except User.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
