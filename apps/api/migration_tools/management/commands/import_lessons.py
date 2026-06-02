from django.utils.text import slugify

from courses.models import Lesson, Module
from migration_tools.base import CsvImportCommand, to_bool, to_int


class Command(CsvImportCommand):
    help = "Import lessons from CSV (idempotent on module + slug)."
    required_columns = ["course_slug", "module_external_id", "title"]

    def process_row(self, row, report, dry_run):
        module = Module.objects.filter(
            course__slug=row["course_slug"],
            external_id=row["module_external_id"],
        ).first()
        if not module:
            raise ValueError(
                f"Module not found: course={row['course_slug']} "
                f"module_external_id={row['module_external_id']}"
            )
        slug = row.get("slug") or slugify(row["title"])
        defaults = {
            "title": row["title"],
            "lesson_type": row.get("lesson_type", "youtube"),
            "youtube_video_id": row.get("youtube_video_id", ""),
            "content": row.get("content", ""),
            "order": to_int(row.get("order", "0")),
            "duration_minutes": to_int(row.get("duration_minutes", "0")),
            "is_preview": to_bool(row.get("is_preview", "false")),
            "is_published": to_bool(row.get("is_published", "true")),
            "source_platform": row.get("source_platform", "csv"),
            "external_id": row.get("external_id", ""),
        }
        if dry_run:
            exists = Lesson.objects.filter(module=module, slug=slug).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = Lesson.objects.update_or_create(
            module=module, slug=slug, defaults=defaults
        )
        report.created += int(created)
        report.updated += int(not created)
