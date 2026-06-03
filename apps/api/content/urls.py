from django.urls import path

from .views import (
    FeaturedStoriesView,
    StoryDetailView,
    StoryListView,
    CommunityLibraryListView,
    FeaturedEducatorsView,
    EducatorListView,
    EducatorDetailView,
    AdminEducatorListCreateView,
    AdminEducatorDetailView,
    ImpactView,
    LearningPathListView,
    NewsletterSubscribeView,
    SchoolDetailView,
    SchoolListView,
    AdminSchoolListCreateView,
    AdminSchoolDetailView,
)

urlpatterns = [
    path("schools/", SchoolListView.as_view(), name="school-list"),
    path("schools/<slug:slug>/", SchoolDetailView.as_view(), name="school-detail"),
    path("admin/schools/", AdminSchoolListCreateView.as_view(), name="admin-school-list-create"),
    path("admin/schools/<int:pk>/", AdminSchoolDetailView.as_view(), name="admin-school-detail"),
    path("learning-paths/", LearningPathListView.as_view(), name="learning-path-list"),
    path("educators/", EducatorListView.as_view(), name="educator-list"),
    path("educators/featured/", FeaturedEducatorsView.as_view(), name="educators-featured"),
    path("educators/<slug:slug>/", EducatorDetailView.as_view(), name="educator-detail"),
    path("admin/educators/", AdminEducatorListCreateView.as_view(), name="admin-educator-list-create"),
    path("admin/educators/<int:pk>/", AdminEducatorDetailView.as_view(), name="admin-educator-detail"),
    path("community-libraries/", CommunityLibraryListView.as_view(), name="community-library-list"),
    path("home/impact/", ImpactView.as_view(), name="home-impact"),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
    path("stories/", StoryListView.as_view(), name="story-list"),
    path("stories/featured/", FeaturedStoriesView.as_view(), name="story-featured"),
    path("stories/<slug:slug>/", StoryDetailView.as_view(), name="story-detail"),
]
