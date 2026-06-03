from django.conf import settings
from django.db import models


class ChatMessage(models.Model):
    """Nalanda chatbot history (one row per message)."""

    class Role(models.TextChoices):
        USER = "user", "User"
        BOT = "bot", "Bot"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="chat_messages", on_delete=models.CASCADE
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user} · {self.role}"


class CounsellingRequest(models.Model):
    """Academic guidance / mentorship support (NOT medical counselling)."""

    class Category(models.TextChoices):
        ACADEMIC = "academic", "Academic question"
        CAREER = "career", "Career guidance"
        COURSE_SELECTION = "course_selection", "Course selection"
        LEARNING_DIFFICULTY = "learning_difficulty", "Learning difficulty"
        MENTORSHIP = "mentorship", "Mentorship request"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_REVIEW = "in_review", "In review"
        REPLIED = "replied", "Replied"
        CLOSED = "closed", "Closed"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="counselling_requests", on_delete=models.CASCADE
    )
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.ACADEMIC)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="assigned_counselling",
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    mentor_reply = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} ({self.status})"
