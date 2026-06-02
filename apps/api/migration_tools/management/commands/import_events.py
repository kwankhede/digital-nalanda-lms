from django.utils.dateparse import parse_datetime
from django.utils.text import slugify

from live_sessions.models import Event
from migration_tools.base import CsvImportCommand, to_bool


class Command(CsvImportCommand):
    help = "Import events from CSV (idempotent on slug)."
    required_columns = ["title", "start_time"]

    def process_row(self, row, report, dry_run):
        title = row["title"]
        slug = row.get("slug") or slugify(title)
        start = parse_datetime(row["start_time"])
        if not start:
            raise ValueError(f"Invalid start_time: {row['start_time']!r} (use ISO 8601)")
        defaults = {
            "title": title,
            "description": row.get("description", ""),
            "event_type": row.get("event_type", "workshop"),
            "speaker_name": row.get("speaker_name", ""),
            "speaker_title": row.get("speaker_title", ""),
            "speaker_photo_url": row.get("speaker_photo_url", ""),
            "location": row.get("location", ""),
            "online_url": row.get("online_url", ""),
            "start_time": start,
            "end_time": parse_datetime(row.get("end_time", "")) if row.get("end_time") else None,
            "registration_url": row.get("registration_url", ""),
            "thumbnail_url": row.get("thumbnail_url", ""),
            "status": row.get("status", "scheduled"),
            "is_featured": to_bool(row.get("is_featured", "false")),
        }
        if dry_run:
            exists = Event.objects.filter(slug=slug).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = Event.objects.update_or_create(slug=slug, defaults=defaults)
        report.created += int(created)
        report.updated += int(not created)
