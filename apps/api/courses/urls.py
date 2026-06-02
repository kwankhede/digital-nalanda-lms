from django.urls import path

from .views import (
    CategoryListView,
    CourseDetailView,
    CourseListView,
    FeaturedCoursesView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/featured/", FeaturedCoursesView.as_view(), name="course-featured"),
    path("courses/<slug:slug>/", CourseDetailView.as_view(), name="course-detail"),
]
