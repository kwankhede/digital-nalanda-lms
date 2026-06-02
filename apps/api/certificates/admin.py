from django.contrib import admin, messages

from .models import Certificate
from .services import regenerate_pdf


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = (
        "certificate_number", "student", "course", "issue_date",
        "is_revoked",
    )
    list_filter = ("is_revoked", "generated_by")
    search_fields = (
        "certificate_number", "verification_code",
        "student__email", "student__full_name", "course__title",
    )
    readonly_fields = (
        "certificate_number", "verification_code", "certificate_pdf_url",
        "created_at", "updated_at",
    )
    actions = ["regenerate_certificates", "revoke_certificates", "restore_certificates"]

    @admin.action(description="Regenerate PDF for selected certificates")
    def regenerate_certificates(self, request, queryset):
        for cert in queryset:
            regenerate_pdf(cert)
        self.message_user(request, f"Regenerated {queryset.count()} certificate(s).")

    @admin.action(description="Revoke selected certificates")
    def revoke_certificates(self, request, queryset):
        updated = queryset.update(is_revoked=True)
        self.message_user(request, f"Revoked {updated} certificate(s).", messages.WARNING)

    @admin.action(description="Restore (un-revoke) selected certificates")
    def restore_certificates(self, request, queryset):
        updated = queryset.update(is_revoked=False)
        self.message_user(request, f"Restored {updated} certificate(s).")
