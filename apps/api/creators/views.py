from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog, CourseCreatorApplication, log_action
from .permissions import IsAdminRole
from .serializers import AuditLogSerializer, CreatorApplicationSerializer
from core.email import send_email


class ApplyCreatorView(APIView):
    """POST /api/creator/apply/ — submit an application (one active per user)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if CourseCreatorApplication.objects.filter(
            user=request.user, status=CourseCreatorApplication.Status.PENDING
        ).exists():
            return Response(
                {"detail": "You already have a pending application."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CreatorApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        app = serializer.save(user=request.user, email=request.user.email)
        # Mark the user as a teacher applicant (unless already elevated).
        if request.user.role == "student":
            request.user.role = "teacher_applicant"
            request.user.save(update_fields=["role"])
        log_action(request.user, "application_submitted", "CourseCreatorApplication", app.id)
        return Response(CreatorApplicationSerializer(app).data, status=status.HTTP_201_CREATED)


class ApplicationStatusView(APIView):
    """GET /api/creator/application/status/ — the user's latest application."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        app = CourseCreatorApplication.objects.filter(user=request.user).first()
        if not app:
            return Response({"status": "none"})
        return Response(CreatorApplicationSerializer(app).data)


# --- Admin review of applications ---

class AdminApplicationListView(generics.ListAPIView):
    serializer_class = CreatorApplicationSerializer
    permission_classes = [IsAdminRole]
    pagination_class = None

    def get_queryset(self):
        qs = CourseCreatorApplication.objects.select_related("user")
        status_f = self.request.query_params.get("status")
        return qs.filter(status=status_f) if status_f else qs


class AdminApplicationDetailView(generics.RetrieveAPIView):
    queryset = CourseCreatorApplication.objects.select_related("user")
    serializer_class = CreatorApplicationSerializer
    permission_classes = [IsAdminRole]


class _ReviewBase(APIView):
    permission_classes = [IsAdminRole]
    target = None  # "approved" | "rejected"

    def post(self, request, pk):
        try:
            app = CourseCreatorApplication.objects.select_related("user").get(pk=pk)
        except CourseCreatorApplication.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        app.status = self.target
        app.admin_notes = request.data.get("admin_notes", app.admin_notes)
        app.reviewed_by = request.user
        app.reviewed_at = timezone.now()
        app.save()

        if self.target == "approved":
            app.user.role = "course_creator"
            app.user.save(update_fields=["role"])
            log_action(request.user, "application_approved", "CourseCreatorApplication", app.id)
        else:
            # Rejected: revert teacher_applicant back to student.
            if app.user.role == "teacher_applicant":
                app.user.role = "student"
                app.user.save(update_fields=["role"])
            log_action(request.user, "application_rejected", "CourseCreatorApplication", app.id,
                       note=app.admin_notes)

        data = CreatorApplicationSerializer(app).data
        if self.target == "approved":
            send_email(
                "Your teacher application is approved",
                app.user.email,
                "Good news! Your teacher application has been approved. "
                "You now have access to your Creator Dashboard, where you can "
                "start building and publishing courses.\n\n— Digital Nalanda",
            )
        else:
            note = (app.admin_notes or "").strip()
            reason = f"\n\nNote from the review team: {note}" if note else ""
            send_email(
                "Update on your teacher application",
                app.user.email,
                "Thank you for applying to teach on Digital Nalanda. After review, "
                "we're unable to approve your application at this time."
                f"{reason}\n\nYou're welcome to apply again in the future."
                "\n\n— Digital Nalanda",
            )
        return Response(data)


class AdminApproveApplicationView(_ReviewBase):
    target = "approved"


class AdminRejectApplicationView(_ReviewBase):
    target = "rejected"


class AdminAuditLogView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
    pagination_class = None

    def get_queryset(self):
        qs = AuditLog.objects.select_related("actor")
        q = self.request.query_params.get("action")
        return qs.filter(action__icontains=q) if q else qs[:200]
