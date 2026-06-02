from django.urls import path

from .views import LessonCompleteView, LessonProgressView, MyProgressView

urlpatterns = [
    path("my/progress/", MyProgressView.as_view(), name="my-progress"),
    path("lessons/<int:pk>/progress/", LessonProgressView.as_view(), name="lesson-progress"),
    path("lessons/<int:pk>/complete/", LessonCompleteView.as_view(), name="lesson-complete"),
]
