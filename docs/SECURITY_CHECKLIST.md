# Security Checklist

> How Digital Nalanda LMS enforces authentication, authorization, and data
> protection. Backend permissions are the source of truth — frontend guards are
> UX only.

## Authentication

- **JWT** via `djangorestframework-simplejwt`. Access token lifetime 60 min,
  refresh 7 days; `ROTATE_REFRESH_TOKENS=True`, `BLACKLIST_AFTER_ROTATION=True`.
- **Refresh flow**: `POST /api/auth/token/refresh/`; the web client retries once
  on a 401 by refreshing, then logs out if that fails.
- **Logout**: `POST /api/auth/logout/` blacklists the refresh token
  (`token_blacklist` app installed).
- **Login by email + password** (custom `EmailBackend`); passwords hashed by
  Django's PBKDF2.

## Authorization (RBAC + object-level)

- Roles on `users.User.role`: student, teacher_applicant, course_creator,
  mentor, event_manager, library_coordinator, volunteer, content_manager,
  admin, super_admin (+ `is_staff`/`is_superuser`).
- Custom DRF permissions: `IsAdminRole`, `IsMentorOrAdmin`, `IsStaffOrAdmin`,
  `IsCourseCreator`. Applied on every write/management endpoint.
- **Object-level**: course creators can only read/edit **their own**
  draft/rejected courses (`created_by` + status check in `_can_edit`).
- Only `admin`/`content_manager`/`super_admin` approve teachers and
  publish/unpublish/archive courses.

## Data protection

- Secrets only in `.env` (gitignored); `.env.example` committed without values.
- `DJANGO_DEBUG=False` in production; `DJANGO_SECRET_KEY` strong + rotated.
- No passwords/tokens logged. Demo-user passwords exist **only** via
  `seed_demo_users` (local dev) and are flagged not-for-production.

## Admin safety

- Demo users must never be seeded in production.
- Least privilege: content managers can't manage users; admins can't remove the
  super admin (super admin = `is_superuser`, managed only via Django/CLI).
- Real super admin created with `python manage.py createsuperuser`.

## API safety

- DRF serializer validation on all writes; list endpoints paginated where large.
- `CORS_ALLOWED_ORIGINS` restricted to the known frontend origin.
- Safe error messages (no stack traces in production with DEBUG off).
- Rate limiting: planned (add DRF throttling before public launch).

## Certificate safety

- Download is **owner-only** (`/api/certificates/<id>/download/` checks
  `student=request.user`).
- Public verification (`/api/certificates/verify/<code>/`) returns only
  student name, course, number, issue date, and valid/invalid status — no email,
  no IDs.

## Course visibility safety

- Public course APIs return **only `status=published`**.
- Draft, submitted, approved, rejected, and archived courses are hidden from the
  public API and pages.

## Verification (tested)

Students get 403 on creator/admin APIs; applicants can't create courses;
creators can't publish or edit others' courses; only admins approve/publish;
owner-only certificate download enforced; public verification exposes safe
fields only. See the testing flow in the README.
