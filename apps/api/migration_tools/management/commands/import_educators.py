from content.models import Educator
from migration_tools.base import CsvImportCommand, to_bool, to_int


class Command(CsvImportCommand):
    help = "Import educators from CSV (idempotent on name)."
    required_columns = ["name"]

    def process_row(self, row, report, dry_run):
        name = row["name"]
        if not name:
            report.skipped += 1
            return
        defaults = {
            "expertise": row.get("expertise", ""),
            "school": row.get("school", ""),
            "photo_url": row.get("photo_url", ""),
            "is_featured": to_bool(row.get("is_featured", "true")),
            "order": to_int(row.get("order", "0")),
        }
        if dry_run:
            exists = Educator.objects.filter(name=name).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = Educator.objects.update_or_create(name=name, defaults=defaults)
        report.created += int(created)
        report.updated += int(not created)
