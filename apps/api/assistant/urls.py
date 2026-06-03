from django.urls import path

from .views import (
    AICourseSummaryView, AILessonSummaryView, ChatView,
    CounsellingDetailView, CounsellingListCreateView,
    CounsellingManageListView, CounsellingReplyView,
)

urlpatterns = [
    path("assistant/ai/course-summary/", AICourseSummaryView.as_view(), name="ai-course-summary"),
    path("assistant/ai/lesson-summary/", AILessonSummaryView.as_view(), name="ai-lesson-summary"),
    path("assistant/chat/", ChatView.as_view(), name="assistant-chat"),
    path("counselling/", CounsellingListCreateView.as_view(), name="counselling-list"),
    path("counselling/manage/", CounsellingManageListView.as_view(), name="counselling-manage"),
    path("counselling/<int:pk>/", CounsellingDetailView.as_view(), name="counselling-detail"),
    path("counselling/<int:pk>/reply/", CounsellingReplyView.as_view(), name="counselling-reply"),
]
