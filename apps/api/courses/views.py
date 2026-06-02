from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Category, Course
from .serializers import (
    CategorySerializer,
    CourseDetailSerializer,
    CourseListSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/categories/"""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CourseListView(generics.ListAPIView):
    """
    GET /api/courses/
    Optional query filters: ?category=<slug>&level=<level>&language=<language>
    """

    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Course.objects.filter(status="published").select_related("category")
        params = self.request.query_params
        if category := params.get("category"):
            qs = qs.filter(category__slug=category)
        if level := params.get("level"):
            qs = qs.filter(level=level)
        if language := params.get("language"):
            qs = qs.filter(language__iexact=language)
        return qs


class FeaturedCoursesView(generics.ListAPIView):
    """GET /api/courses/featured/ — newest published courses for the homepage."""

    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            Course.objects.filter(status="published")
            .select_related("category")[:8]
        )


class CourseDetailView(generics.RetrieveAPIView):
    """GET /api/courses/<slug>/"""

    queryset = Course.objects.filter(status="published").prefetch_related(
        "modules__lessons"
    )
    serializer_class = CourseDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
