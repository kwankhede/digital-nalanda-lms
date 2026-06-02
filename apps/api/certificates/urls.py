from django.urls import path

from .views import (
    CertificateDetailView,
    CertificateDownloadView,
    GenerateCertificateView,
    MyCertificatesView,
    VerifyCertificateView,
)

urlpatterns = [
    path("certificates/generate/<slug:course_slug>/", GenerateCertificateView.as_view(), name="certificate-generate"),
    path("my/certificates/", MyCertificatesView.as_view(), name="my-certificates"),
    path("certificates/verify/<str:verification_code>/", VerifyCertificateView.as_view(), name="certificate-verify"),
    path("certificates/<int:pk>/", CertificateDetailView.as_view(), name="certificate-detail"),
    path("certificates/<int:pk>/download/", CertificateDownloadView.as_view(), name="certificate-download"),
]
