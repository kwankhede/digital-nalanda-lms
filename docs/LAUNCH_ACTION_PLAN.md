# Digital Nalanda LMS — Prioritized Launch Action Plan

> Derived from `PRODUCTION_READINESS_AUDIT.md`. Findings grouped P0/P1/P2 with
> effort estimates and an exact execution order. IDs (B1, C3…) reference the audit.

Effort key: **S** = Small (≤½ day) · **M** = Medium (½–2 days) · **L** = Large (3+ days)

---

## P0 — Must fix before launch

| # | Item (audit ref) | Effort | Why it blocks launch |
|---|------------------|:------:|----------------------|
| P0-1 | **Stop exposing Zoom join URL + password publicly** (B1) | S | Critical access-control leak; anyone can read every session link/password |
| P0-2 | **Enforce a strong `SECRET_KEY`** (B2) | S | Known key ⇒ session/JWT forgery |
| P0-3 | **Production security settings + `CSRF_TRUSTED_ORIGINS`** (B3) | S | Secure cookies, HSTS, SSL redirect, CSRF behind Nginx |
| P0-4 | **Set `ALLOWED_HOSTS` / `CORS` / `FRONTEND_URL` / `NEXT_PUBLIC_API_URL`** (B4) | S | App won't serve / CORS-blocks without correct hosts |
| P0-5 | **Add `gunicorn` (+ `whitenoise`) to requirements** (B5) | S | No production WSGI server otherwise |
| P0-6 | **DRF throttling + cache AI summary** (B6) | M | Open Gemini endpoint = cost/abuse; no brute-force protection |
| P0-7 | **Guard `seed_demo_users` against prod; use `createsuperuser`** (B7) | S | Public-password accounts (incl. super admin) in prod |
| P0-8 | **Verify `next build` on real hardware** (B8) | S | Prod build unconfirmed |
| P0-9 | **Move certificates/media to DigitalOcean Spaces** (C3) | M | Local media is ephemeral on DO — issued certs would vanish |
| P0-10 | **Smoke-test all 8 roles after deploy to staging** | M | Confirm no flow broke in prod config |

**P0 total: ~4–6 focused days.**

---

## P1 — Fix within the first month

| # | Item (audit ref) | Effort | Notes |
|---|------------------|:------:|-------|
| P1-1 | Automated tests for security-critical paths (C2) | L | Zoom fix, publish/permissions, cert ownership, grading, JWT |
| P1-2 | Flip default permission to `IsAuthenticated`, opt-in `AllowAny` (C1) | S | Removes "accidentally public" risk as API grows |
| P1-3 | Caching layer (Redis) for public reads + AI (C4) | M | Homepage, schools, impact, summaries |
| P1-4 | Error monitoring + logging (Sentry / DO logs) (C9) | S | Visibility into prod errors |
| P1-5 | Import/seed real content (courses, schools, events) | M | Replace fallback/placeholder data |
| P1-6 | Finalize placeholder links + sample data (C8) | S | Footer/nav `#`, sample classes/announcements |
| P1-7 | Managed Postgres backups + media backup + rollback doc (Audit §10) | S | Recovery readiness |
| P1-8 | Email backend (password reset / welcome / cert delivery) | M | Needed for real onboarding |
| P1-9 | CI pipeline: tsc + build + `check --deploy` + tests | M | Prevent regressions |

---

## P2 — Fix later

| # | Item (audit ref) | Effort |
|---|------------------|:------:|
| P2-1 | Audit & fix N+1 queries before scale (C6) | M |
| P2-2 | DB indexes on hot filter fields (D) | S |
| P2-3 | Keep/extend pagination on growing lists (C5) | S |
| P2-4 | `/api/health/` endpoint for LB probes (D) | S |
| P2-5 | Accessibility pass to WCAG AA (D) | M |
| P2-6 | Image CDN / `next/image` remote patterns for Spaces thumbnails (D) | S |
| P2-7 | Student/enrollment importers for LearnWorlds migration | M |

---

## EXACT EXECUTION ORDER

**Sprint 0 — Security & deploy config (Day 1–2, all S/M)**
1. P0-1 Zoom serializer fix (split public vs admin/write serializer; join URL only via authenticated join endpoint; never expose password).
2. P0-2 Enforce `SECRET_KEY` (fail if unset in prod).
3. P0-3 Add production security settings + `CSRF_TRUSTED_ORIGINS`.
4. P0-5 Add `gunicorn` + `whitenoise` to `requirements.txt`.
5. P0-7 Guard `seed_demo_users` (refuse when `DEBUG=False`).
6. P0-6 Add DRF throttling (anon/user scopes; tight scope for AI) + cache the AI summary per course.

**Sprint 0 — Build & storage (Day 3)**
7. P0-8 Run `npm run build`; fix any prod-only errors.
8. P0-9 Configure `django-storages` → Spaces for media/certificates.

**Sprint 0 — Staging deploy (Day 4)**
9. P0-4 Set all env vars on DO (App Platform) — `ALLOWED_HOSTS`, CORS, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `GEMINI_API_KEY`.
10. `migrate` + `collectstatic` + `createsuperuser` (NOT seed_demo_users).
11. P0-10 Smoke-test all 8 roles on the staging URL; re-verify the Zoom fix (anonymous user can no longer see join URL/password).

→ **Gate:** all P0 closed + staging smoke-test green ⇒ promote to public launch.

**Month 1 (after launch, in this order)**
12. P1-4 Error monitoring (so you see prod issues immediately).
13. P1-7 Backups + rollback doc.
14. P1-1 Tests for security-critical paths → 15. P1-9 CI pipeline (run those tests automatically).
15. P1-2 Default-permission flip (ship with the new tests as a safety net).
16. P1-5 Real content import + P1-6 finalize placeholder links.
17. P1-3 Caching layer · P1-8 email backend.

**Later (P2):** N+1 audit, indexes, health check, a11y, CDN, migration importers — as scale and need dictate.

---

## Dependencies / sequencing notes
- P0-3/P0-4 depend on knowing the deploy URL → decide App Platform subdomain (or domain) first.
- P0-9 (Spaces) should land before public launch or early certificates will be lost on the next deploy.
- P1-1 (tests) should precede P1-2 (permission-default change) so the change is verified.
- P1-9 (CI) depends on P1-1 (tests) existing.
