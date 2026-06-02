from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # API routes live under /api/. Each feature app contributes its own.
    path("api/", include("core.urls")),
    path("api/", include("courses.urls")),
    path("api/", include("users.urls")),
    path("api/", include("enrollments.urls")),
    path("api/", include("progress.urls")),
]
