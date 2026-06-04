"""Central transactional-email helper.

Uses Django's email framework. The backend is env-driven:
  - default: console backend (prints emails to the log) — works everywhere,
    no SMTP needed for dev/staging.
  - production: set DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    plus EMAIL_HOST/PORT/USER/PASSWORD.

All sends are best-effort: a mail failure never breaks the request flow.
"""
import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_email(subject, to, body, html=None):
    """Send one email. `to` may be a string or a list. Never raises."""
    if not to:
        return False
    recipients = [to] if isinstance(to, str) else list(to)
    recipients = [r for r in recipients if r]
    if not recipients:
        return False
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=recipients,
            html_message=html,
            fail_silently=True,
        )
        return True
    except Exception:  # pragma: no cover - defensive
        logger.exception("Email send failed: %s", subject)
        return False
