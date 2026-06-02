from django.utils.text import slugify

from content.models import School
from migration_tools.base import CsvImportCommand, to_bool, to_int


class Command(CsvImportCommand):
    help = "Import schools from CSV (idempotent on slug/name)."
    required_columns = ["name"]

    def process_row(self, row, report, dry_run):
        name = row["name"]
        if not name:
            report.skipped += 1
            return
        slug = row.get("slug") or slugify(name)
        defaults = {
            "name": name,
            "description": row.get("description", ""),
            "icon": row.get("icon", ""),
            "image_url": row.get("image_url", ""),
            "course_count": to_int(row.get("course_count", "0")),
            "order": to_int(row.get("order", "0")),
            "is_published": to_bool(row.get("is_published", "true")),
        }
        if dry_run:
            exists = School.objects.filter(slug=slug).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = School.objects.update_or_create(slug=slug, defaults=defaults)
        if created:
            report.created += 1
        else:
            report.updated += 1
