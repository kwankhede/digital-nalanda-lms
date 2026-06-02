"""Shared helpers for idempotent CSV imports with validation + logging."""
import csv
from dataclasses import dataclass, field

from django.core.management.base import BaseCommand, CommandError


@dataclass
class ImportReport:
    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: list = field(default_factory=list)

    def summary(self) -> str:
        return (
            f"created={self.created} updated={self.updated} "
            f"skipped={self.skipped} errors={len(self.errors)}"
        )


class CsvImportCommand(BaseCommand):
    """
    Base for `import_*` commands.

    Subclasses set `required_columns` and implement `process_row(row, report, dry_run)`.
    Imports are idempotent (update-or-create on a natural key) and support
    --dry-run (validate + report without writing).
    """

    required_columns: list[str] = []

    def add_arguments(self, parser):
        parser.add_argument("--file", required=True, help="Path to the CSV file")
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Validate and report without writing to the database",
        )

    def handle(self, *args, **options):
        path = options["file"]
        dry_run = options["dry_run"]
        report = ImportReport()

        try:
            fh = open(path, newline="", encoding="utf-8-sig")
        except OSError as exc:
            raise CommandError(f"Cannot open file: {exc}")

        with fh:
            reader = csv.DictReader(fh)
            missing = [c for c in self.required_columns if c not in (reader.fieldnames or [])]
            if missing:
                raise CommandError(
                    f"CSV is missing required columns: {', '.join(missing)}. "
                    f"Found: {', '.join(reader.fieldnames or [])}"
                )

            for line_no, row in enumerate(reader, start=2):  # row 1 = header
                try:
                    self.process_row({k: (v or "").strip() for k, v in row.items()}, report, dry_run)
                except Exception as exc:  # noqa: BLE001
                    report.errors.append(f"Line {line_no}: {exc}")

        mode = "DRY-RUN" if dry_run else "APPLIED"
        self.stdout.write(self.style.SUCCESS(f"[{mode}] {report.summary()}"))
        for err in report.errors:
            self.stdout.write(self.style.WARNING(f"  ! {err}"))
        if dry_run:
            self.stdout.write("No changes written (dry-run).")


def to_bool(value: str, default=True) -> bool:
    if value == "":
        return default
    return value.strip().lower() in ("1", "true", "yes", "y")


def to_int(value: str, default=0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
