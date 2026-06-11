"""
Send live-session reminders (24h-before and 30m-before).

Designed to run from cron (or any scheduler), e.g.:

    */10 * * * *  cd /app && python manage.py send_session_reminders

Idempotent: each (session, kind) batch is recorded in SessionReminderLog and
never resent. Recipients are everyone registered for the session plus every
non-cancelled enrollee of the session's course (de-duplicated).
"""
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.email import send_email
from live_sessions.models import LiveSession, SessionReminderLog

# kind -> how far before start_time this reminder window opens
WINDOWS = {
    SessionReminderLog.Kind.DAY_BEFORE: timedelta(hours=24),
    SessionReminderLog.Kind.SOON: timedelta(minutes=30),
}


class Command(BaseCommand):
    help = "Send 24h and 30m reminders for upcoming live sessions (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Report what would be sent without sending or logging.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        now = timezone.now()
        total_sessions = 0
        total_recipients = 0

        upcoming = LiveSession.objects.filter(
            status=LiveSession.Status.SCHEDULED,
            start_time__gt=now,
        ).select_related("course")

        for session in upcoming:
            for kind, lead in WINDOWS.items():
                if session.start_time - now > lead:
                    continue  # window not open yet
                if SessionReminderLog.objects.filter(
                    session=session, kind=kind
                ).exists():
                    continue  # already sent

                recipients = self._recipients(session)
                if not dry_run:
                    sent = self._send(session, kind, recipients)
                    SessionReminderLog.objects.create(
                        session=session, kind=kind, recipients_count=sent
                    )
                else:
                    sent = len(recipients)
                total_sessions += 1
                total_recipients += sent
                self.stdout.write(
                    f"{'[dry-run] ' if dry_run else ''}{session.title} "
                    f"({kind}): {sent} recipient(s)"
                )

        self.stdout.write(self.style.SUCCESS(
            f"Done. {total_sessions} reminder batch(es), "
            f"{total_recipients} recipient(s)."
        ))

    @staticmethod
    def _recipients(session):
        """Registered attendees + course enrollees, deduplicated by user id."""
        users = {}
        for att in session.attendance.select_related("student"):
            if att.student_id:
                users[att.student_id] = att.student
        if session.course_id:
            from enrollments.models import Enrollment

            qs = Enrollment.objects.filter(course_id=session.course_id).exclude(
                status=Enrollment.Status.CANCELLED
            ).select_related("student")
            for enr in qs:
                users[enr.student_id] = enr.student
        return list(users.values())

    def _send(self, session, kind, recipients):
        base = getattr(settings, "FRONTEND_URL", "").rstrip("/")
        local = timezone.localtime(session.start_time)
        when = local.strftime("%A %d %b, %I:%M %p %Z")
        if kind == SessionReminderLog.Kind.DAY_BEFORE:
            subject = f"Tomorrow: {session.title} — {when}"
            lead_text = "is coming up in about 24 hours"
        else:
            subject = f"Starting soon: {session.title} — {when}"
            lead_text = "starts in about 30 minutes"

        join_line = (
            f"Join link: {session.zoom_join_url}\n" if session.zoom_join_url else ""
        )
        ics_line = (
            f"Add to calendar: {base}/api/live-sessions/{session.slug}/calendar.ics\n"
            if session.slug else ""
        )
        body = (
            f"Hi,\n\nYour live class \"{session.title}\" {lead_text}.\n\n"
            f"When: {when}\n{join_line}{ics_line}\n"
            "See you there!\n\n— Digital Nalanda"
        )

        sent = 0
        for user in recipients:
            try:
                from notifications.models import notify

                notify(
                    user, "live_class",
                    subject,
                    f"\"{session.title}\" {lead_text}.",
                    f"/live-classes",
                )
            except Exception:
                pass
            if send_email(subject, getattr(user, "email", None), body):
                sent += 1
        return sent
