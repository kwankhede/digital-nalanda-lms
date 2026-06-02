from courses.models import Course, Module
from migration_tools.base import CsvImportCommand, to_int


class Command(CsvImportCommand):
    help = "Import modules from CSV (idempotent on external_id within course)."
    required_columns = ["course_slug", "title"]

    def process_row(self, row, report, dry_run):
        course = Course.objects.filter(slug=row["course_slug"]).first()
        if not course:
            raise ValueError(f"Course not found: {row['course_slug']}")
        external_id = row.get("external_id", "")
        defaults = {
            "title": row["title"],
            "order": to_int(row.get("order", "0")),
            "source_platform": row.get("source_platform", "csv"),
            "external_id": external_id,
        }
        lookup = (
            {"course": course, "external_id": external_id}
            if external_id else {"course": course, "title": row["title"]}
        )
        if dry_run:
            exists = Module.objects.filter(**lookup).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = Module.objects.update_or_create(**lookup, defaults=defaults)
        report.created += int(created)
        report.updated += int(not created)
