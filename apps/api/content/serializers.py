from rest_framework import serializers

from .models import CommunityLibrary, Educator, ImpactMetric, LearningPath, NewsletterSubscriber, School


class SchoolSerializer(serializers.ModelSerializer):
    """Card/list payload (homepage + /schools grid + nav)."""
    class Meta:
        model = School
        fields = ["id", "name", "slug", "tagline", "description", "icon",
                  "image_url", "course_count", "is_featured"]


class SchoolDetailSerializer(serializers.ModelSerializer):
    """Full payload for the school detail page."""
    class Meta:
        model = School
        fields = ["id", "name", "slug", "tagline", "description", "long_description",
                  "icon", "image_url", "hero_image_url", "course_count", "is_featured"]


class SchoolWriteSerializer(serializers.ModelSerializer):
    """Admin create/update. Slug is auto-generated from name when omitted."""
    class Meta:
        model = School
        fields = ["id", "name", "slug", "tagline", "description", "long_description",
                  "icon", "image_url", "hero_image_url", "course_count",
                  "order", "is_featured", "is_published"]
        extra_kwargs = {"slug": {"required": False}}


class LearningPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPath
        fields = ["id", "name", "slug", "description", "icon", "image_url", "course_count"]


class EducatorSerializer(serializers.ModelSerializer):
    """Card/list payload."""
    class Meta:
        model = Educator
        fields = ["id", "name", "slug", "title", "expertise", "school", "bio",
                  "photo_url", "is_featured"]


class EducatorDetailSerializer(serializers.ModelSerializer):
    """Full profile payload for the mentor detail page."""
    class Meta:
        model = Educator
        fields = ["id", "name", "slug", "title", "expertise", "school", "bio",
                  "long_bio", "photo_url", "linkedin_url", "website_url"]


class EducatorWriteSerializer(serializers.ModelSerializer):
    """Admin/creator create + edit. Slug auto-generated from name when omitted."""
    class Meta:
        model = Educator
        fields = ["id", "name", "slug", "title", "expertise", "school", "bio",
                  "long_bio", "photo_url", "linkedin_url", "website_url",
                  "is_featured", "order"]
        extra_kwargs = {"slug": {"required": False}}


class CommunityLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityLibrary
        fields = ["id", "name", "location", "description", "photo_url"]


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["email"]

    def validate_email(self, value):
        return value.lower().strip()


class ImpactMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactMetric
        fields = ["id", "value", "suffix", "label"]


from .models import Story, StoryMedia  # noqa: E402


class StoryMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryMedia
        fields = ["id", "media_type", "url", "caption", "order"]


class StoryListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Story
        fields = [
            "id", "title", "slug", "summary", "featured_image",
            "student_name", "institution", "city", "graduation_year",
            "quote", "is_featured", "category", "published_at",
        ]


class StoryDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True, default=None)
    media = StoryMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = [
            "id", "title", "slug", "summary", "content", "featured_image",
            "student_name", "institution", "city", "graduation_year",
            "quote", "is_featured", "category", "media",
            "published_at", "created_at", "updated_at",
        ]
