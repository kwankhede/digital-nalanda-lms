from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# Profile fields exposed by /api/auth/me/ and editable via PATCH.
PROFILE_FIELDS = [
    "id", "email", "full_name", "phone", "gender", "date_of_birth",
    "city", "district", "state", "education_level", "profession",
    "category", "preferred_language", "role", "is_staff",
]
READ_ONLY = ["id", "email", "role", "is_staff"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "full_name", "phone"]

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = User(username=email, **validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Used by GET/PATCH /api/auth/me/."""

    class Meta:
        model = User
        fields = PROFILE_FIELDS
        read_only_fields = READ_ONLY


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Authenticate with email instead of username."""

    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        attrs["email"] = attrs.get("email", "").lower().strip()
        return super().validate(attrs)
