# Content Migration Plan

> Migrating Digital Nalanda's existing content from the current LearnWorlds site
> (https://www.digitalnalanda.com/) into this LMS.

**Status: planning only.** No content has been scraped or imported. This
document describes *what* to migrate and *how*, and the system has been made
migration-ready (see "Migration-readiness" below). The importer itself is **not
built yet**.

## 1. Content Inventory — what we need to migrate

| Content | Target in new LMS | Notes |
|---------|-------------------|-------|
| Courses | `courses.Course` | title, description, level, language, thumbnail, free/paid, published |
| Categories / Schools | `courses.Category` | LearnWorlds "schools" map to our categories |
| Modules / Sections | `courses.Module` | section grouping within a course |
| Lessons | `courses.Lesson` | type (youtube/video/text/pdf/quiz), order, duration, preview flag |
| YouTube / video links | `Lesson.youtube_video_id` | extract the 11-char video ID from full URLs |
| PDFs / resources | *(future `Resource` model)* | store the file in Cloudflare R2; keep `original_url` for now |
| Workshops | *(future `Workshop` model)* | CSV template prepared; model added in a later feature |
| Events | *(future `Event` model)* | CSV template prepared; model added in a later feature |
| Stories / testimonials | *(future `Story` model)* | CSV template prepared; model added in a later feature |
| Student registration fields | `users.User` profile fields | already present (full_name, phone, gender, city, etc.) |
| Existing users | `users.User` | only if a LearnWorlds export is available; passwords cannot transfer |
| Certificates | *(future `Certificate` model)* | only if export available; store original PDF URL |
| Progress / completion | `enrollments.Enrollment` + `progress.LessonProgress` | only if export available |

Courses, Categories, Modules, and Lessons can be migrated **today**. Workshops,
Events, Stories, Certificates, and Resources have CSV templates ready but need
their models built first (tracked as future features). Users and progress
depend on whether LearnWorlds provides an export.

## 2. Migration Strategy

### 2.1 Preferred: export from LearnWorlds

LearnWorlds offers data export via its **admin panel** (Settings → Export) and a
**REST API** (`/admin/api/v2/…`) for courses, users, and enrollments. Where an
export or API access is available, that is the source of truth. Export to CSV/JSON,
then transform into the templates in `docs/migration_templates/`.

### 2.2 Fallback: manual CSV import

When no clean export exists (e.g. lesson ordering, video IDs, testimonials),
fill in the CSV templates by hand from the live site and import those. The CSV
schema is the stable contract the importer will consume — see section 3.

### 2.3 Media mapping

- **YouTube**: store only the 11-character video ID in `Lesson.youtube_video_id`
  (strip `https://youtu.be/<id>` or `watch?v=<id>`). The player embeds from the ID.
- **PDFs / images / downloads**: upload to **Cloudflare R2** during import; until
  the `Resource` model exists, keep the source link in `original_url` /
  `migration_notes` so nothing is lost.
- **Thumbnails**: copy the source image URL into `thumbnail_url`; re-host to R2 later.

### 2.4 Course slug mapping

Slugs are the public URL key and must stay stable for SEO and bookmarks.

- Reuse the LearnWorlds course slug where possible (`courses.csv → slug`).
- Keep the full source URL in `Course.original_url` so old links can be 301-redirected.
- Slugs are unique; the importer must detect collisions and suffix (`-2`) or skip.

### 2.5 User email matching

- **Email is the unique match key** (it's our login identifier).
- On import: if a user with that email exists, **update** the profile; otherwise
  **create**. Never duplicate.
- Passwords **cannot** be migrated (LearnWorlds hashes aren't portable). Imported
  users get an unusable password and must use "reset password" / first-login flow.
- Store the LearnWorlds user id in `external_id` for traceability.

### 2.6 Progress data (if available)

If LearnWorlds exports per-user completion, map it to `LessonProgress`
(student + lesson + is_completed + completed_at) and then run the existing
`recalc_progress` service so `Enrollment.progress_percentage` and completion
status are recomputed consistently — don't import percentages directly.

### 2.7 Certificate migration (if available)

If certificates can be exported, keep the original certificate PDF URL and
issue date. These attach to a future `Certificate` model linked to
(student, course). Until then, retain the data in the export; don't discard.

### 2.8 Import principles

- **Idempotent**: match on `external_id` (or slug/email) and update-or-create, so
  re-running is safe — the same pattern as the existing `seed_courses` command.
- **Dry-run first**: validate the CSV and report what would change before writing.
- **Set `imported_at`** and `source_platform` on every imported row for audit.
- **Order matters**: categories → courses → modules → lessons → users → progress.

## 3. CSV Templates

Header-only templates live in `docs/migration_templates/` (one example row each):

| File | Imports | Key columns |
|------|---------|-------------|
| `categories.csv` | Categories/schools | `name`, `slug` |
| `courses.csv` | Courses | `slug`, `category_slug`, `level`, `language`, `is_free`, `is_published` |
| `modules.csv` | Modules | `course_slug`, `title`, `order`, `external_id` |
| `lessons.csv` | Lessons | `course_slug`, `module_external_id`, `slug`, `lesson_type`, `youtube_video_id`, `order` |
| `users.csv` | Students | `email` (match key), profile fields, `role` |
| `events.csv` | Events (future model) | `slug`, `event_date`, `mode` |
| `workshops.csv` | Workshops (future model) | `slug`, `workshop_date`, `instructor` |
| `stories.csv` | Testimonials (future model) | `student_name`, `story_text`, `course_slug` |

Every template includes the migration columns `external_id`, `source_platform`,
`original_url`, and `migration_notes` so provenance is captured at import time.
Linking between files uses **slugs** (courses) and **`external_id`** (modules →
lessons), never database IDs, since DB IDs don't exist until import.

## 4. Migration-readiness in the data model

The `Course`, `Module`, and `Lesson` models share a `MigrationMeta` mixin
(`apps/api/courses/models.py`) adding these optional, storage-only fields:

| Field | Purpose |
|-------|---------|
| `external_id` | The record's ID on the source platform (indexed; the idempotency key) |
| `source_platform` | `native` / `learnworlds` / `csv` / `other` |
| `original_url` | Canonical URL on the old site (for redirects/reference) |
| `migration_notes` | Free-text notes captured during import |
| `imported_at` | Timestamp the row was imported (null for native content) |

These fields are **not exposed by the public API** (serializers list fields
explicitly), so adding them does **not** change any existing API response. They
are visible/searchable in Django admin (`source_platform` filter, `external_id`
search on courses).

## 5. Next steps (when we're ready to import)

1. Confirm what LearnWorlds export/API access is available.
2. Build models for the remaining content types (Workshop, Event, Story,
   Resource, Certificate) as features.
3. Build a `migrate_content` management command (dry-run + apply) that consumes
   the CSV templates, idempotently, in dependency order.
4. Wire up Cloudflare R2 for media before importing PDFs/images.
5. Run a staging import, verify, then 301-redirect old URLs.
