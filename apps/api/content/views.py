from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from adminpanel.permissions import IsStaffOrAdmin
from .permissions import CanManageContent
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CommunityLibrary, Educator, ImpactMetric, LearningPath, NewsletterSubscriber, School, StudyMaterial, TickerItem
from .serializers import (
    CommunityLibrarySerializer,
    EducatorSerializer,
    EducatorDetailSerializer,
    EducatorWriteSerializer,
    ImpactMetricSerializer,
    LearningPathSerializer,
    NewsletterSerializer,
    SchoolSerializer,
    SchoolDetailSerializer,
    SchoolWriteSerializer,
    StudyMaterialSerializer,
    StudyMaterialWriteSerializer,
    TickerItemSerializer,
    TickerItemWriteSerializer,
)



class SchoolListView(generics.ListAPIView):
    queryset = School.objects.filter(is_published=True)
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.filter(is_published=True)
    serializer_class = SchoolDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


# ---------------- Admin school management (create without code) ----------------

class AdminSchoolListCreateView(generics.ListCreateAPIView):
    """GET all (incl. unpublished) / POST create a school. Admin only."""
    queryset = School.objects.all()
    serializer_class = SchoolWriteSerializer
    permission_classes = [CanManageContent]
    pagination_class = None


class AdminSchoolDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PUT / PATCH / DELETE a single school. Admin only."""
    queryset = School.objects.all()
    serializer_class = SchoolWriteSerializer
    permission_classes = [CanManageContent]


class LearningPathListView(generics.ListAPIView):
    queryset = LearningPath.objects.filter(is_published=True)
    serializer_class = LearningPathSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class EducatorListView(generics.ListAPIView):
    """All educators (the /educators page). Optional ?school=<name> filter."""
    serializer_class = EducatorSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Educator.objects.all()
        school = self.request.query_params.get("school")
        return qs.filter(school__iexact=school) if school else qs


class EducatorDetailView(generics.RetrieveAPIView):
    """Public mentor profile by slug."""
    queryset = Educator.objects.all()
    serializer_class = EducatorDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class AdminEducatorListCreateView(generics.ListCreateAPIView):
    """List all / create an educator. Admin, content-manager or creator."""
    queryset = Educator.objects.all()
    serializer_class = EducatorWriteSerializer
    permission_classes = [CanManageContent]
    pagination_class = None


class AdminEducatorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Edit / delete an educator profile (photo, bio, links, etc.)."""
    queryset = Educator.objects.all()
    serializer_class = EducatorWriteSerializer
    permission_classes = [CanManageContent]


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


class ImpactView(generics.ListAPIView):
    queryset = ImpactMetric.objects.filter(is_published=True)
    serializer_class = ImpactMetricSerializer
    permission_classes = [AllowAny]
    pagination_class = None


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



class StudyMaterialListView(generics.ListAPIView):
    """Public: published study materials (the /study-materials page)."""
    queryset = StudyMaterial.objects.filter(is_published=True)
    serializer_class = StudyMaterialSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class AdminStudyMaterialListCreateView(generics.ListCreateAPIView):
    """List all / create a study material. Admin, content-manager or creator."""
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialWriteSerializer
    permission_classes = [CanManageContent]
    pagination_class = None


class AdminStudyMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Edit / delete a study material."""
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialWriteSerializer
    permission_classes = [CanManageContent]



class TickerListView(generics.ListAPIView):
    """Public: active ticker notices."""
    queryset = TickerItem.objects.filter(is_active=True)
    serializer_class = TickerItemSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class AdminTickerListCreateView(generics.ListCreateAPIView):
    queryset = TickerItem.objects.all()
    serializer_class = TickerItemWriteSerializer
    permission_classes = [CanManageContent]
    pagination_class = None


class AdminTickerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TickerItem.objects.all()
    serializer_class = TickerItemWriteSerializer
    permission_classes = [CanManageContent]


from .models import Story  # noqa: E402
from .serializers import StoryDetailSerializer, StoryListSerializer  # noqa: E402


class StoryListView(generics.ListAPIView):
    serializer_class = StoryListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Story.objects.filter(is_published=True).select_related("category")


class FeaturedStoriesView(generics.ListAPIView):
    serializer_class = StoryListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            Story.objects.filter(is_published=True, is_featured=True)
            .select_related("category")
        )


class StoryDetailView(generics.RetrieveAPIView):
    queryset = Story.objects.filter(is_published=True).prefetch_related("media")
    serializer_class = StoryDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
