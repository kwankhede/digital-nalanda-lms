from django.urls import path

from .views import EnrollView, MyCoursesView, MyEnrollmentsView

urlpatterns = [
    path("courses/<slug:slug>/enroll/", EnrollView.as_view(), name="enroll"),
    path("my/enrollments/", MyEnrollmentsView.as_view(), name="my-enrollments"),
    path("my/courses/", MyCoursesView.as_view(), name="my-courses"),
]
