from django.urls import path

from .views import (
    CommunityLibraryListView,
    FeaturedEducatorsView,
    ImpactView,
    LearningPathListView,
    NewsletterSubscribeView,
    SchoolDetailView,
    SchoolListView,
)

urlpatterns = [
    path("schools/", SchoolListView.as_view(), name="school-list"),
    path("schools/<slug:slug>/", SchoolDetailView.as_view(), name="school-detail"),
    path("learning-paths/", LearningPathListView.as_view(), name="learning-path-list"),
    path("educators/featured/", FeaturedEducatorsView.as_view(), name="educators-featured"),
    path("community-libraries/", CommunityLibraryListView.as_view(), name="community-library-list"),
    path("home/impact/", ImpactView.as_view(), name="home-impact"),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
]
