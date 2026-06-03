from django.urls import path

from .views import (
    AssignmentDetailView, AssignmentSubmissionsView, CourseAssignmentsView,
    GradeSubmissionView, MyAssignmentsView, MyCourseAssignmentsView,
    SubmitAssignmentView,
)

urlpatterns = [
    path("creator/courses/<int:pk>/assignments/", CourseAssignmentsView.as_view(), name="course-assignments"),
    path("creator/assignments/mine/", MyCourseAssignmentsView.as_view(), name="my-course-assignments"),
    path("assignments/<int:pk>/", AssignmentDetailView.as_view(), name="assignment-detail"),
    path("assignments/<int:pk>/submissions/", AssignmentSubmissionsView.as_view(), name="assignment-submissions"),
    path("assignments/<int:pk>/submit/", SubmitAssignmentView.as_view(), name="assignment-submit"),
    path("my/assignments/", MyAssignmentsView.as_view(), name="my-assignments"),
    path("submissions/<int:pk>/grade/", GradeSubmissionView.as_view(), name="grade-submission"),
]
