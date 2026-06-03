from django.contrib import admin

from .models import ChatMessage, CounsellingRequest


@admin.register(CounsellingRequest)
class CounsellingAdmin(admin.ModelAdmin):
    list_display = ("subject", "student", "category", "status", "assigned_to", "created_at")
    list_filter = ("status", "category")
    search_fields = ("subject", "student__email")


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role",)
