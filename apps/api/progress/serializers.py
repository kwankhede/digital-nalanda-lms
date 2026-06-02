from rest_framework import serializers

from .models import LessonProgress


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = [
            "id", "lesson", "course", "is_completed", "completed_at",
            "watch_seconds", "last_watched_at",
        ]
        read_only_fields = ["course", "completed_at"]


class WatchProgressInputSerializer(serializers.Serializer):
    watch_seconds = serializers.IntegerField(min_value=0, required=False)
