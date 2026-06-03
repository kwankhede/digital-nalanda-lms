# Managing Schools (no code changes)

Schools are fully database-driven. An admin can add, edit, reorder, or unpublish
a school and it **automatically appears** on the homepage grid, the `/schools`
page, the navigation dropdown (desktop + mobile), and gets its own detail page —
with no code change or redeploy.

## Two ways to manage schools

### 1. Django admin (easiest)
`/admin/` → **Content → Schools → Add school**. The slug auto-fills from the
name. Set the fields below, tick **Is published**, save. Done.

### 2. Admin REST API
Requires an admin / content-manager / staff JWT.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/schools/` | list all schools (incl. unpublished) |
| POST | `/api/admin/schools/` | create a school |
| GET | `/api/admin/schools/<id>/` | retrieve one |
| PUT / PATCH | `/api/admin/schools/<id>/` | update |
| DELETE | `/api/admin/schools/<id>/` | delete |

Public read endpoints (no auth):
- `GET /api/schools/` — published schools (cards / homepage / nav)
- `GET /api/schools/<slug>/` — full detail (incl. `long_description`)

## Fields
| Field | Notes |
|-------|-------|
| `name` | required, unique |
| `slug` | auto-generated from name if omitted; unique |
| `tagline` | short headline (hero subtitle) |
| `description` | one-line card blurb |
| `long_description` | detail-page body (multi-paragraph) |
| `icon` | emoji shown when no image |
| `image_url` | card illustration (e.g. `/images/home/school-law.webp`) |
| `hero_image_url` | optional detail banner |
| `course_count` | number shown on the card |
| `order` | sort order (lower first) |
| `is_featured` | flag for future curation |
| `is_published` | hide/show publicly (unpublished = admin-only) |

## Where a new school shows up automatically
- **Homepage** → "Schools of Digital Nalanda" grid (first 6).
- **/schools** → full grid.
- **Navbar** → "Schools" dropdown (desktop) and mobile drawer (first 8 + "View all").
  *(The nav caches schools per session — a hard refresh shows newly added ones.)*
- **/schools/&lt;slug&gt;** → auto-generated detail page (tagline, long description,
  plus related educators / courses / paths / events / stories).

## Seeding the six flagship schools
```bash
cd apps/api && python manage.py seed_schools
```
Idempotent (safe to re-run). Seeds Law, Social Sciences, Buddhist Studies,
Data Science, Design and Critical Thought with the homepage illustrations.

## Notes
- New schools appear on the public site only when **`is_published = True`**.
- Card images use the bundled `/images/home/school-*.webp`; for a custom school,
  set `image_url` to any image URL (or leave blank to show the emoji `icon`).
