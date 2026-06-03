from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, PreferenceSerializer


class NotifPagination(PageNumberPagination):
    page_size = 20


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — paginated; ?type= and ?unread=1 filters."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotifPagination

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        t = self.request.query_params.get("type")
        if t:
            qs = qs.filter(type=t)
        if self.request.query_params.get("unread") == "1":
            qs = qs.filter(is_read=False)
        return qs

    def list(self, request, *args, **kwargs):
        resp = super().list(request, *args, **kwargs)
        resp.data["unread_count"] = Notification.objects.filter(
            user=request.user, is_read=False
        ).count()
        return resp


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"unread_count": Notification.objects.filter(
            user=request.user, is_read=False).count()})


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        Notification.objects.filter(pk=pk, user=request.user).update(is_read=True)
        return Response({"detail": "ok"})


class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "ok"})


class PreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pref, _ = NotificationPreference.objects.get_or_create(user=request.user)
        return Response(PreferenceSerializer(pref).data)

    def put(self, request):
        pref, _ = NotificationPreference.objects.get_or_create(user=request.user)
        pref.muted_types = request.data.get("muted_types", [])
        pref.save()
        return Response(PreferenceSerializer(pref).data)
