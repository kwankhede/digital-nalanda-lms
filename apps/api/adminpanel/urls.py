from django.urls import path

from .views import AdminAttentionView, AdminReportDetailView, AdminReportsIndexView, AdminUsersExportView, CommandCenterView, AdminStatsView, NewsletterExportView, NewsletterListView

urlpatterns = [
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/attention/", AdminAttentionView.as_view(), name="admin-attention"),
    path("admin/command-center/", CommandCenterView.as_view(), name="admin-command-center"),
    path("admin/reports/", AdminReportsIndexView.as_view(), name="admin-reports"),
    path("admin/reports/<str:key>/", AdminReportDetailView.as_view(), name="admin-report-detail"),
    path("admin/users/export/", AdminUsersExportView.as_view(), name="admin-users-export"),
    path("admin/newsletter/", NewsletterListView.as_view(), name="admin-newsletter"),
    path("admin/newsletter/export/", NewsletterExportView.as_view(), name="admin-newsletter-export"),
]
