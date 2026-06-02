from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model.

    Defined up front (even though minimal) because switching AUTH_USER_MODEL
    after the first migration is painful. Extend with profile fields later.
    """

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        MENTOR = "mentor", "Mentor"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.STUDENT
    )

    def __str__(self):
        return self.get_username()
