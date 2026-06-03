from django.conf import settings
from django.conf.urls.static import static
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
    path("api/", include("certificates.urls")),
    path("api/", include("live_sessions.urls")),
    path("api/", include("content.urls")),
    path("api/", include("adminpanel.urls")),
    path("api/", include("creators.urls")),
    path("api/", include("assistant.urls")),
    path("api/", include("notifications.urls")),
    path("api/", include("announcements.urls")),
    path("api/", include("assignments.urls")),
]

# Serve uploaded/generated media in development.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
