# Migration Guide — CSV Import System V1

> Infrastructure for safely importing content from the current Digital Nalanda
> / LearnWorlds site into this LMS. **No real data is imported yet** — this
> describes the tooling and how to use it.

See also [CONTENT_MIGRATION_PLAN.md](CONTENT_MIGRATION_PLAN.md) for the overall
strategy and what content maps where.

## Overview

Import is done with Django management commands that read CSV files. Every
command is:

- **Idempotent** — re-running updates existing rows instead of creating
  duplicates (matched on a natural key, see below).
- **Dry-run capable** — `--dry-run` validates and reports without writing.
- **Validated** — missing required columns abort with a clear error; bad rows
  are reported per-line and skipped, not fatal.
- **Logged** — every run prints `created / updated / skipped / errors`.

## Commands

| Command | Source template | Match key (idempotency) |
|---------|-----------------|--------------------------|
| `import_schools` | `schools.csv` | `slug` (or slugified `name`) |
| `import_educators` | `educators.csv` | `name` |
| `import_stories` | `stories.csv` | `slug` (or slugified `title`) |
| `import_courses` | `courses.csv` | `external_id` if present, else `slug` |
| `import_modules` | `modules.csv` | `course_slug` + `external_id` (or `title`) |
| `import_lessons` | `lessons.csv` | `course_slug` + `module_external_id` + `slug` |
| `import_events` | `events.csv` | `slug` (or slugified `title`) |

Sample CSVs live in [`docs/migration_templates/`](migration_templates/).

## Usage

Always **dry-run first**, then apply. Run from `apps/api` with the venv active:

```bash
# 1. Validate without writing
python manage.py import_schools --file ../../docs/migration_templates/schools.csv --dry-run

# 2. Apply
python manage.py import_schools --file ../../docs/migration_templates/schools.csv
```

### Recommended order (respects dependencies)

```
1. import_schools
2. import_educators
3. import_courses      # needs category_slug; categories auto-created
4. import_modules      # needs existing courses (course_slug)
5. import_lessons      # needs existing modules (module_external_id)
6. import_events
7. import_stories
```

Modules reference their course by `course_slug`; lessons reference their module
by `course_slug` + `module_external_id`. Import in order so those references
resolve. Rows whose parent isn't found are reported as errors and skipped.

## CSV format notes

- **Encoding**: UTF-8 (BOM tolerated).
- **Booleans**: `true/false`, `1/0`, `yes/no` (blank = sensible default).
- **Dates/times** (`events.csv`): ISO 8601, e.g. `2024-05-30T18:00:00+05:30`.
- **`external_id`**: the record's ID on the source platform. Strongly
  recommended for courses/modules so re-imports match reliably and content can
  be traced back (stored on the model via the migration-readiness fields).
- **Linking**: files reference each other by **slug** / **external_id**, never
  by database ID (IDs don't exist until import).

## Idempotency & re-runs

Safe to run repeatedly. The first run creates; subsequent runs update the same
rows (matched on the keys above). Example:

```
$ python manage.py import_schools --file schools.csv
[APPLIED] created=10 updated=0 skipped=0 errors=0
$ python manage.py import_schools --file schools.csv     # again
[APPLIED] created=0 updated=10 skipped=0 errors=0
```

## Error handling

- **Missing required column** → the command aborts before writing anything,
  listing the missing and found columns.
- **Bad row** (e.g. invalid date, missing parent) → reported as
  `! Line N: <reason>`, that row is skipped, the rest continue.
- **`--dry-run`** → nothing is written; the report shows what *would* happen.

## Next steps (not done yet)

1. Export real data from LearnWorlds (admin export / API) into these CSV shapes.
2. Dry-run each import on a staging database; review the reports.
3. Apply in dependency order; spot-check in Django admin.
4. Wire media (PDFs/images) to Cloudflare R2 before importing media-heavy rows.
5. Set up 301 redirects from old URLs (`original_url`) to new slugs.
