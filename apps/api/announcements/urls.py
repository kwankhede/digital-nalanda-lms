from django.urls import path

from .views import ActiveAnnouncementsView

urlpatterns = [
    path("announcements/active/", ActiveAnnouncementsView.as_view(), name="announcements-active"),
]
