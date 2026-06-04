from django.urls import path

from .dashboard_views import DashboardSummaryView
from .views import health_check

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]
