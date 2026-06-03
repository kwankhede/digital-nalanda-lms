# Digital Nalanda LMS — Production Readiness Audit

> CTO sign-off review before DigitalOcean deployment. Findings are based on
> direct inspection of the codebase, not assumptions. Date: pre-launch.

---

## SECTION A — Production Readiness Score

**62 / 100** — strong product, clean architecture, but real security and
operational gaps remain. Safe for a **private staging/demo** today; **not** safe
for a public student-facing launch until the blockers below are fixed.

| Area | Score | Notes |
|------|:-----:|-------|
| Security | 5/10 | One critical data exposure; missing prod hardening + throttling |
| Database | 8/10 | Clean models/FKs; a few missing indexes; no major risks |
| API design | 7/10 | Mostly well-permissioned; one over-exposed serializer |
| Frontend | 8/10 | Polished, responsive, good loading/empty states |
| Roles & permissions | 8/10 | Solid role model; backend-enforced; minor gaps |
| Course workflow | 9/10 | Approval/publish/rollback well-guarded |
| File storage | 6/10 | Certificates to local disk — not durable on DO |
| Performance | 7/10 | Some N+1 risk; no caching; AI endpoint uncached |
| Deployment config | 5/10 | gunicorn missing from requirements; headers unset |
| Backups/recovery | 3/10 | No documented strategy |
| Testing | 1/10 | **Zero automated tests** |
| User journeys | 7/10 | Core flows work; some placeholder links/pages |

---

## SECTION B — Launch Blockers (must fix before deployment)

### 🔴 CRITICAL

**B1. Zoom join URL + password exposed publicly (data exposure / broken access control).**
`LiveSessionSerializer` includes `zoom_join_url` and `zoom_password`, and it is
used by **AllowAny** endpoints: `LiveSessionListView`, `UpcomingLiveSessionsView`,
and `LiveSessionDetailView` (`live_sessions/views.py`). Any anonymous visitor can
read every session's Zoom link and password via the public API
(`GET /api/live-sessions/`). This defeats the `JoinSessionView` gate (which is
correctly `IsAuthenticated`). **Fix:** remove `zoom_join_url`/`zoom_password`
from the public read serializer; expose the join URL only through the
authenticated join endpoint (and never expose the password in any read API).

**B2. SECRET_KEY defaults to a public placeholder.**
`SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-insecure-change-me")`. If the
env var is unset in production, Django runs with a known key — full session/JWT
forgery risk. **Fix:** set a strong `DJANGO_SECRET_KEY` in production env and fail
loudly if missing.

**B3. No production security headers / cookie flags.**
Settings define no `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`,
`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_PROXY_SSL_HEADER`, or
`CSRF_TRUSTED_ORIGINS`. Behind Nginx/DO with HTTPS these are required for safe
cookies and CSRF. **Fix:** add production-only security settings + the deployed
domain to `CSRF_TRUSTED_ORIGINS`.

**B4. `ALLOWED_HOSTS` / `CORS` / `FRONTEND_URL` still default to localhost.**
Must be set to the real DO host (`*.ondigitalocean.app` or domain) or the API
returns `DisallowedHost` and CORS blocks the frontend.

**B5. gunicorn is not in `requirements.txt`** (commented out). A production WSGI
server is mandatory; `runserver` must never be used in prod. **Fix:** add
`gunicorn` (and `whitenoise` if serving static from Django).

**B6. No rate limiting anywhere (DRF throttling not configured).**
The public AI summary endpoint (`AllowAny`, calls Gemini on every request) can be
abused to run up cost; login/register have no brute-force protection. **Fix:**
add DRF throttle classes (anon + user scopes) and a tighter scope for AI; cache
each course's AI summary.

**B7. Demo users must not be seeded in production.**
`seed_demo_users` creates accounts (incl. a super admin) with the public password
`ChangeMe123!`. **Fix:** never run it in prod; create the admin via
`createsuperuser`. Consider guarding the command to refuse when `DEBUG=False`.

**B8. Production build not verified.** `tsc` is clean, but `next build` has not
been confirmed on real hardware (the sandbox can't run it). **Fix:** run
`npm run build` in `apps/web` and resolve any prod-only build errors before deploy.

---

## SECTION C — Important Issues (fix soon)

- **C1. `DEFAULT_PERMISSION_CLASSES = IsAuthenticatedOrReadOnly`** makes every
  unguarded view world-readable by default. Most views set explicit classes, but
  the permissive default is risky as the API grows. Prefer `IsAuthenticated` as
  the default and opt into `AllowAny` explicitly.
- **C2. No automated tests (0 files).** At minimum, add tests for: the Zoom-leak
  fix, course publish/permission boundaries, certificate ownership, assignment
  grading permissions, and JWT auth. This is the single biggest quality gap.
- **C3. Certificates written to local `MEDIA_ROOT`.** On a DO App Platform or a
  rebuilt droplet, local media is ephemeral — issued certificates can vanish.
  Move media to **DigitalOcean Spaces (S3-compatible)** via `django-storages`.
- **C4. No caching layer.** Homepage content, schools, impact stats, and AI
  summaries are recomputed per request. Add Redis or per-view caching for public
  read endpoints; cache AI summaries by course.
- **C5. Some list endpoints disable pagination** (`pagination_class = None`) —
  fine now, but schools/courses/stories should stay paginated as data grows.
- **C6. N+1 query risk** in list serializers that resolve related names
  (mentor/course/created_by). Audit with `select_related`/`prefetch_related`
  before scaling (some views already do this; not all).
- **C7. AI endpoint has no caching/cost guard** (also under B6) — at minimum cache
  the generated summary on the course or in Redis.
- **C8. Placeholder links** in footer/nav (`#`) and sample data in Live
  Classes/Announcements should be finalized or hidden before public launch.
- **C9. No error monitoring/logging** configured (Sentry or DO logs). You'll be
  blind to production errors.

---

## SECTION D — Nice-to-Have Improvements

- Add DB indexes on frequently filtered fields (`Course.status`, `Course.slug`
  already unique; `Enrollment(student, course)`, `SessionAttendance(student,
  session)`, notification `(user, is_read)`).
- Health-check endpoint for DO (`/api/health/`) for load-balancer probes.
- CI pipeline (GitHub Actions) running `tsc`, `next build`, `manage.py check`,
  and tests on every push.
- Structured logging + request IDs.
- Image CDN / `next/image` remote patterns if course thumbnails move to Spaces.
- Accessibility pass (focus states, aria labels on icon-only buttons) — partly
  done; finish for WCAG AA.
- Email backend (currently none configured) for password reset / welcome /
  certificate delivery.

---

## SECTION E — DigitalOcean Deployment Checklist

**Environment variables (API)**
- [ ] `DJANGO_SECRET_KEY` = strong random value
- [ ] `DJANGO_DEBUG=False`
- [ ] `DJANGO_ALLOWED_HOSTS` = your `*.ondigitalocean.app` host / domain
- [ ] `DATABASE_URL` = managed Postgres connection string
- [ ] `CORS_ALLOWED_ORIGINS` = web app URL
- [ ] `CSRF_TRUSTED_ORIGINS` = web app URL (add setting first)
- [ ] `FRONTEND_URL` = web app URL (certificate verify links/QR)
- [ ] `GEMINI_API_KEY` = real key (or leave blank for template fallback)

**Environment variables (Web)**
- [ ] `NEXT_PUBLIC_API_URL` = API URL

**Backend prep**
- [ ] Add `gunicorn` (+ `whitenoise` or Spaces) to `requirements.txt`
- [ ] Add production security settings (B3)
- [ ] `python manage.py migrate`
- [ ] `python manage.py collectstatic --noinput`
- [ ] Create admin via `createsuperuser` (NOT seed_demo_users)
- [ ] Configure media → DigitalOcean Spaces
- [ ] `manage.py check --deploy` returns no warnings

**Frontend prep**
- [ ] `npm run build` passes locally
- [ ] `NEXT_PUBLIC_API_URL` baked into build

**Platform**
- [ ] App Platform: web + api components + managed Postgres (free HTTPS subdomain)
      — OR Droplet with Nginx + gunicorn + certbot (needs a domain for HTTPS)
- [ ] Verify HTTPS, login flow, course view, AI summary, certificate download
- [ ] Smoke-test all 8 roles' core actions

**Ops**
- [ ] Enable managed Postgres automated backups
- [ ] Spaces versioning/backup for media
- [ ] Error logging (Sentry/DO)
- [ ] Document rollback (redeploy previous commit + DB restore point)

---

## SECTION F — Final Verdict

### ⚠️ DEPLOY AFTER MAJOR FIXES

The product is feature-complete, well-architected, and visually polished, and the
core permission model is sound. **However, it is not safe for a public,
student-facing launch as-is** — primarily because of the **critical Zoom
join-URL/password exposure (B1)**, the **insecure default secret key (B2)**,
**missing production security/throttling (B3, B6)**, **no automated tests (C2)**,
and **ephemeral certificate storage (C3)**.

None of these are large efforts — most are configuration plus one serializer fix
and a storage change. Once the **Section B blockers** are closed and a basic test
suite covers the security-critical paths, this moves to **"Deploy after minor
fixes"** and is ready for a real launch.

**Recommended path:** deploy to a **private DO staging environment now** (App
Platform, free HTTPS subdomain) for stakeholder review, fix the blockers in
parallel, then promote to public launch.
