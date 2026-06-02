from django.urls import path

from .course_views import (
    AdminApproveCourseView,
    AdminArchiveCourseView,
    AdminCourseReviewDetailView,
    AdminCourseReviewListView,
    AdminPublishCourseView,
    AdminRejectCourseView,
    AdminUnpublishCourseView,
    CreatorCourseDetailView,
    CreatorCourseListCreateView,
    CreatorLessonCreateView,
    CreatorLessonDetailView,
    CreatorModuleCreateView,
    CreatorModuleDetailView,
    SubmitCourseView,
)
from .views import (
    AdminApplicationDetailView,
    AdminApplicationListView,
    AdminApproveApplicationView,
    AdminAuditLogView,
    AdminRejectApplicationView,
    ApplicationStatusView,
    ApplyCreatorView,
)

urlpatterns = [
    # Applications
    path("creator/apply/", ApplyCreatorView.as_view(), name="creator-apply"),
    path("creator/application/status/", ApplicationStatusView.as_view(), name="creator-app-status"),
    path("admin/creator-applications/", AdminApplicationListView.as_view(), name="admin-applications"),
    path("admin/creator-applications/<int:pk>/", AdminApplicationDetailView.as_view(), name="admin-application-detail"),
    path("admin/creator-applications/<int:pk>/approve/", AdminApproveApplicationView.as_view(), name="admin-application-approve"),
    path("admin/creator-applications/<int:pk>/reject/", AdminRejectApplicationView.as_view(), name="admin-application-reject"),
    path("admin/audit-logs/", AdminAuditLogView.as_view(), name="admin-audit-logs"),

    # Creator courses
    path("creator/courses/", CreatorCourseListCreateView.as_view(), name="creator-courses"),
    path("creator/courses/<int:pk>/", CreatorCourseDetailView.as_view(), name="creator-course-detail"),
    path("creator/courses/<int:pk>/submit/", SubmitCourseView.as_view(), name="creator-course-submit"),
    path("creator/courses/<int:pk>/modules/", CreatorModuleCreateView.as_view(), name="creator-module-create"),
    path("creator/modules/<int:pk>/", CreatorModuleDetailView.as_view(), name="creator-module-detail"),
    path("creator/modules/<int:pk>/lessons/", CreatorLessonCreateView.as_view(), name="creator-lesson-create"),
    path("creator/lessons/<int:pk>/", CreatorLessonDetailView.as_view(), name="creator-lesson-detail"),

    # Admin course review
    path("admin/course-reviews/", AdminCourseReviewListView.as_view(), name="admin-course-reviews"),
    path("admin/course-reviews/<int:pk>/", AdminCourseReviewDetailView.as_view(), name="admin-course-review-detail"),
    path("admin/course-reviews/<int:pk>/approve/", AdminApproveCourseView.as_view(), name="admin-course-approve"),
    path("admin/course-reviews/<int:pk>/reject/", AdminRejectCourseView.as_view(), name="admin-course-reject"),
    path("admin/course-reviews/<int:pk>/publish/", AdminPublishCourseView.as_view(), name="admin-course-publish"),
    path("admin/course-reviews/<int:pk>/unpublish/", AdminUnpublishCourseView.as_view(), name="admin-course-unpublish"),
    path("admin/course-reviews/<int:pk>/archive/", AdminArchiveCourseView.as_view(), name="admin-course-archive"),
]
