from rest_framework import serializers

from .models import CommunityLibrary, Educator, LearningPath, NewsletterSubscriber, School


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ["id", "name", "slug", "description", "icon", "course_count"]


class LearningPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPath
        fields = ["id", "name", "slug", "description", "icon", "course_count"]


class EducatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Educator
        fields = ["id", "name", "expertise", "school", "photo_url"]


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
