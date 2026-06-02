from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CommunityLibrary, Educator, LearningPath, NewsletterSubscriber, School
from .serializers import (
    CommunityLibrarySerializer,
    EducatorSerializer,
    LearningPathSerializer,
    NewsletterSerializer,
    SchoolSerializer,
)

# Configured impact numbers (marketing figures, not raw DB counts).
IMPACT = [
    {"value": 5000, "suffix": "+", "label": "Students Reached"},
    {"value": 600, "suffix": "+", "label": "Successful Learners"},
    {"value": 20, "suffix": "+", "label": "Educators"},
    {"value": 14, "suffix": "", "label": "Community Libraries"},
    {"value": 100, "suffix": "%", "label": "Free Education"},
]


class SchoolListView(generics.ListAPIView):
    queryset = School.objects.filter(is_published=True)
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.filter(is_published=True)
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class LearningPathListView(generics.ListAPIView):
    queryset = LearningPath.objects.filter(is_published=True)
    serializer_class = LearningPathSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class FeaturedEducatorsView(generics.ListAPIView):
    queryset = Educator.objects.filter(is_featured=True)
    serializer_class = EducatorSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class CommunityLibraryListView(generics.ListAPIView):
    queryset = CommunityLibrary.objects.all()
    serializer_class = CommunityLibrarySerializer
    permission_classes = [AllowAny]
    pagination_class = None


class ImpactView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(IMPACT)


class NewsletterSubscribeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewsletterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        NewsletterSubscriber.objects.get_or_create(email=email)
        return Response(
            {"detail": "Subscribed", "email": email},
            status=status.HTTP_201_CREATED,
        )
