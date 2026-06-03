"""ICS calendar generation for live sessions (student-safe — join URL only)."""
from datetime import timezone as _tz

from django.utils import timezone


def _fmt(dt):
    # ICS UTC timestamp.
    return dt.astimezone(_tz.utc).strftime("%Y%m%dT%H%M%SZ")


def _esc(text):
    return (text or "").replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")


def build_ics(session) -> str:
    end = session.end_time or session.start_time
    mentor = session.mentor.full_name if session.mentor else ""
    course = session.course.title if session.course else ""
    desc_parts = [session.description or ""]
    if course:
        desc_parts.append(f"Course: {course}")
    if mentor:
        desc_parts.append(f"Mentor: {mentor}")
    if session.zoom_join_url:
        desc_parts.append(f"Join: {session.zoom_join_url}")
    description = _esc("\n".join(p for p in desc_parts if p))

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Digital Nalanda//Live Class//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        f"UID:live-session-{session.id}@digitalnalanda",
        f"DTSTAMP:{_fmt(timezone.now())}",
        f"DTSTART:{_fmt(session.start_time)}",
        f"DTEND:{_fmt(end)}",
        f"SUMMARY:{_esc(session.title)}",
        f"DESCRIPTION:{description}",
    ]
    if session.zoom_join_url:
        lines.append(f"URL:{session.zoom_join_url}")
        lines.append(f"LOCATION:{_esc(session.zoom_join_url)}")
    lines += ["END:VEVENT", "END:VCALENDAR"]
    return "\r\n".join(lines) + "\r\n"
