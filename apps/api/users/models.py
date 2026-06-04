from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with a student profile.

    Login is by email + password. `username` is kept (Django requires it) and
    set equal to the email on registration.
    """

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        TEACHER_APPLICANT = "teacher_applicant", "Teacher Applicant"
        COURSE_CREATOR = "course_creator", "Course Creator"
        MENTOR = "mentor", "Mentor"
        EVENT_MANAGER = "event_manager", "Event Manager"
        LIBRARY_COORDINATOR = "library_coordinator", "Library Coordinator"
        VOLUNTEER = "volunteer", "Volunteer"
        CONTENT_MANAGER = "content_manager", "Content Manager"
        ADMIN = "admin", "Admin"
        SUPER_ADMIN = "super_admin", "Super Admin"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.STUDENT
    )

    # Email must be unique since it's the login identifier.
    email = models.EmailField(unique=True)

    # --- Student profile ---
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(
        max_length=10, choices=Gender.choices, blank=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    education_level = models.CharField(max_length=100, blank=True)
    profession = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, blank=True)
    preferred_language = models.CharField(max_length=50, blank=True, default="English")

    # Set true once the user confirms their email via the verification link.
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.email or self.get_username()
