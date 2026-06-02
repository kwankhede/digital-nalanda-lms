from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course

from .models import Certificate
from .serializers import CertificateSerializer, CertificateVerifySerializer
from .services import NotEligible, get_pdf_bytes, issue_certificate


class GenerateCertificateView(APIView):
    """POST /api/certificates/generate/<course_slug>/ — issue (idempotent)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_slug):
        course = get_object_or_404(Course, slug=course_slug)
        try:
            certificate = issue_certificate(request.user, course)
        except NotEligible as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CertificateSerializer(certificate).data)


class MyCertificatesView(generics.ListAPIView):
    """GET /api/my/certificates/ — the student's certificates."""

    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Certificate.objects.filter(
            student=self.request.user
        ).select_related("course", "student")


class CertificateDetailView(generics.RetrieveAPIView):
    """GET /api/certificates/<id>/ — owner-only metadata."""

    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(
            student=self.request.user
        ).select_related("course", "student")


class VerifyCertificateView(generics.RetrieveAPIView):
    """GET /api/certificates/verify/<verification_code>/ — PUBLIC."""

    queryset = Certificate.objects.select_related("course", "student")
    serializer_class = CertificateVerifySerializer
    permission_classes = [AllowAny]
    lookup_field = "verification_code"


class CertificateDownloadView(APIView):
    """GET /api/certificates/<id>/download/ — OWNER ONLY PDF."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        certificate = get_object_or_404(
            Certificate, pk=pk, student=request.user
        )
        pdf = get_pdf_bytes(certificate)
        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="certificate-{certificate.certificate_number}.pdf"'
        )
        return response
