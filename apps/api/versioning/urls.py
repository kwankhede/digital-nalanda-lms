from django.urls import path

from .views import (
    CompareVersionsView,
    CourseVersionDetailView,
    CourseVersionListView,
    RestoreVersionView,
    WorkingDiffView,
)

urlpatterns = [
    path("creator/courses/<int:pk>/versions/",
         CourseVersionListView.as_view(), name="course-versions"),
    path("creator/courses/<int:pk>/versions/<int:number>/",
         CourseVersionDetailView.as_view(), name="course-version-detail"),
    path("creator/courses/<int:pk>/versions/<int:number>/restore/",
         RestoreVersionView.as_view(), name="course-version-restore"),
    path("creator/courses/<int:pk>/diff/",
         WorkingDiffView.as_view(), name="course-working-diff"),
    path("creator/courses/<int:pk>/versions/<int:a>/compare/<int:b>/",
         CompareVersionsView.as_view(), name="course-version-compare"),
]
