from django.utils.text import slugify

from content.models import Story
from migration_tools.base import CsvImportCommand, to_bool, to_int


class Command(CsvImportCommand):
    help = "Import stories from CSV (idempotent on slug)."
    required_columns = ["title", "student_name"]

    def process_row(self, row, report, dry_run):
        title = row["title"]
        slug = row.get("slug") or slugify(title)
        defaults = {
            "title": title,
            "student_name": row["student_name"],
            "summary": row.get("summary", ""),
            "content": row.get("content", ""),
            "featured_image": row.get("featured_image", ""),
            "institution": row.get("institution", ""),
            "city": row.get("city", ""),
            "graduation_year": row.get("graduation_year", ""),
            "quote": row.get("quote", ""),
            "is_featured": to_bool(row.get("is_featured", "false")),
            "display_order": to_int(row.get("display_order", "0")),
        }
        if dry_run:
            exists = Story.objects.filter(slug=slug).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = Story.objects.update_or_create(slug=slug, defaults=defaults)
        report.created += int(created)
        report.updated += int(not created)
