from django.utils.text import slugify

from courses.models import Category, Course
from migration_tools.base import CsvImportCommand, to_bool


class Command(CsvImportCommand):
    help = "Import courses from CSV (idempotent on external_id, else slug)."
    required_columns = ["title"]

    def process_row(self, row, report, dry_run):
        title = row["title"]
        slug = row.get("slug") or slugify(title)
        external_id = row.get("external_id", "")
        category = None
        cat_slug = row.get("category_slug", "")
        if cat_slug:
            category, _ = Category.objects.get_or_create(
                slug=cat_slug, defaults={"name": cat_slug.replace("-", " ").title()}
            ) if not dry_run else (None, False)

        defaults = {
            "title": title,
            "slug": slug,
            "short_description": row.get("short_description", ""),
            "description": row.get("description", ""),
            "level": row.get("level", "beginner"),
            "language": row.get("language", "English"),
            "thumbnail_url": row.get("thumbnail_url", ""),
            "is_free": to_bool(row.get("is_free", "true")),
            "is_published": to_bool(row.get("is_published", "false")),
            "source_platform": row.get("source_platform", "csv"),
            "original_url": row.get("original_url", ""),
            "external_id": external_id,
        }
        if category is not None:
            defaults["category"] = category

        # Match on external_id when present, else slug.
        lookup = {"external_id": external_id} if external_id else {"slug": slug}
        if dry_run:
            exists = Course.objects.filter(**lookup).exists()
            report.updated += 1 if exists else 0
            report.created += 0 if exists else 1
            return
        _, created = Course.objects.update_or_create(**lookup, defaults=defaults)
        report.created += int(created)
        report.updated += int(not created)
