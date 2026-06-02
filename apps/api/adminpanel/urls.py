from django.urls import path

from .views import AdminStatsView, NewsletterExportView, NewsletterListView

urlpatterns = [
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/newsletter/", NewsletterListView.as_view(), name="admin-newsletter"),
    path("admin/newsletter/export/", NewsletterExportView.as_view(), name="admin-newsletter-export"),
]
