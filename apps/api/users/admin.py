from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

UserAdmin.fieldsets = UserAdmin.fieldsets + (
    ("Student profile", {
        "fields": (
            "role", "full_name", "phone", "gender", "date_of_birth",
            "city", "district", "state", "education_level", "profession",
            "category", "preferred_language",
        )
    }),
)

admin.site.register(User, UserAdmin)
