from rest_framework import serializers

from .models import Event, LiveSession, SessionAttendance


def _person_name(user):
    if not user:
        return None
    return user.full_name or user.get_username()


class LiveSessionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True, default=None)
    mentor_name = serializers.SerializerMethodField()

    class Meta:
        model = LiveSession
        fields = [
            "id", "title", "slug", "description", "course", "course_title",
            "mentor", "mentor_name", "zoom_join_url", "zoom_password",
            "start_time", "end_time", "status", "is_featured",
            "recording_url", "recording_thumbnail_url", "recording_title",
            "recording_duration_minutes", "is_recording_public",
            "created_at", "updated_at",
        ]

    def get_mentor_name(self, obj):
        return _person_name(obj.mentor)


class LiveSessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveSession
        fields = [
            "id", "title", "slug", "description", "course", "mentor",
            "zoom_join_url", "zoom_password", "start_time", "end_time",
            "status", "is_featured", "recording_url",
            "recording_thumbnail_url", "recording_title",
            "recording_duration_minutes", "is_recording_public",
        ]
        read_only_fields = ["slug"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "title", "slug", "description", "event_type",
            "speaker_name", "speaker_title", "speaker_photo_url",
            "location", "online_url", "start_time", "end_time",
            "registration_url", "thumbnail_url", "status", "is_featured",
            "created_at", "updated_at",
        ]


class EventWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "title", "slug", "description", "event_type",
            "speaker_name", "speaker_title", "speaker_photo_url",
            "location", "online_url", "start_time", "end_time",
            "registration_url", "thumbnail_url", "status", "is_featured",
        ]
        read_only_fields = ["slug"]


class SessionAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.EmailField(source="student.email", read_only=True)

    class Meta:
        model = SessionAttendance
        fields = [
            "id", "student", "student_name", "student_email",
            "joined_at", "left_at", "duration_minutes", "attendance_status",
        ]

    def get_student_name(self, obj):
        return _person_name(obj.student)


# --- Unified homepage item (live_session + event) ---

class HomeItemSerializer(serializers.Serializer):
    """Builds the unified homepage payload from a LiveSession or Event."""

    def to_representation(self, obj):
        if isinstance(obj, LiveSession):
            return {
                "id": f"live_session-{obj.id}",
                "type": "live_session",
                "title": obj.title,
                "description": obj.description,
                "start_time": obj.start_time,
                "end_time": obj.end_time,
                "thumbnail_url": obj.recording_thumbnail_url or "",
                "join_or_register_url": obj.zoom_join_url,
                "status": obj.status,
                "speaker_or_mentor": _person_name(obj.mentor),
            }
        # Event
        return {
            "id": f"event-{obj.id}",
            "type": "event",
            "title": obj.title,
            "description": obj.description,
            "start_time": obj.start_time,
            "end_time": obj.end_time,
            "thumbnail_url": obj.thumbnail_url or "",
            "join_or_register_url": obj.registration_url or obj.online_url,
            "status": obj.status,
            "speaker_or_mentor": obj.speaker_name or None,
        }


class HomeRecordingSerializer(serializers.ModelSerializer):
    """A completed live session's recording, for the homepage carousel."""

    mentor_name = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True, default=None)

    class Meta:
        model = LiveSession
        fields = [
            "id", "title", "slug", "recording_title", "recording_url",
            "recording_thumbnail_url", "recording_duration_minutes",
            "start_time", "mentor_name", "course_title",
        ]

    def get_mentor_name(self, obj):
        return _person_name(obj.mentor)
