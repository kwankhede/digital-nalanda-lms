# Software Architecture & Code-Quality Review — Digital Nalanda

**Date:** 2026-06-04
**Reviewer perspective:** Staff Software Engineer / Principal Architect / Senior Django + Next.js Architect / Platform Engineering Lead
**Method:** Direct inspection of `apps/api` (18 Django apps), `apps/web` (Next.js 14 App Router), `packages/`, `infra/`, `docs/`, settings, and docker-compose. Judgments are grounded in the actual code, not assumptions. This complements `ROLE_PERMISSION_AUDIT.md` (security) — security is scored here but detailed there.

---

## 1. Overall architecture score: **74 / 100**

This is a **well-structured MVP** with clean domain boundaries, small focused files, a partial-but-present service layer, resilient frontend patterns, and unusually strong documentation. The score is held back almost entirely by **one factor: there are zero automated tests** (backend and frontend). Excluding testing, the codebase sits in the low 80s. With a baseline test suite and production observability added, this is a genuinely solid platform.

The headline: **the architecture is good; the engineering safety net is missing.**

## 2. What is excellent

- **Domain-driven Django app layout.** 18 cohesive apps (`courses`, `enrollments`, `progress`, `assignments`, `certificates`, `live_sessions`, `versioning`, `content`, `assistant`, `notifications`, `announcements`, `creators`, `users`, …). Each owns its models/serializers/views/urls. Boundaries are clear; a new engineer can find things fast.
- **Small files.** Largest backend file is 251 lines; largest frontend file 386. No "god" views/serializers/models. Fat-X anti-patterns are largely absent.
- **A real (if partial) service layer where it matters.** `certificates/services.py`, `versioning/services.py`, `enrollments/services.py`, `live_sessions/calendar.py`, `assistant/ai.py` + `bot.py` keep non-trivial business logic out of views. Certificate generation, version snapshot/restore, and AI all live in services.
- **Clean frontend API layer.** `apps/web/src/lib/` has one typed module per domain (`creator.ts`, `student.ts`, `assignments.ts`, `versioning.ts`, …) plus a `useApi` hook and an `authFetch` with transparent token-refresh. This is textbook separation of concerns and great DX.
- **Resilience by design.** Every API-driven section degrades to a static fallback (`homeFallbacks`, `educatorsFallback`, per-page fallbacks) so the UI never looks broken when the API is empty/unreachable.
- **AI integration is mature.** Gemini via a thin `urllib` call (no heavy SDK), key strictly server-side, **graceful template/rule-based fallback** when no key/offline, suggestion-only (never auto-publishes), 6-hour cache on public course summaries, and dedicated throttle scopes. This is better than most MVPs.
- **Configuration & secrets.** `django-environ`, env-driven settings, an explicit guard that refuses an insecure `SECRET_KEY` when `DEBUG=False`, a production security block (HSTS, secure cookies, SSL redirect, `X_FRAME_OPTIONS`), and conditional Spaces/S3 storage.
- **Documentation.** A `docs/` folder with PRD, ARCHITECTURE, DATABASE_SCHEMA, ERD, API_SPEC, deployment, permissions matrix, and several audits. Far above MVP norm.

## 3. What is acceptable (good enough for now)

- **Per-app permission classes.** Reasonable, though duplicated across apps (see §5). Now consistent after the permission audit.
- **DB constraints.** Correct `unique`/`unique_together` on all join tables (`enrollment`, `progress`, `submission`, `attendance`, `course_version`), unique slugs everywhere, FKs auto-indexed by Django.
- **DRF conventions.** Consistent generics usage, JWT auth, `IsAuthenticatedOrReadOnly` default, scoped throttles configured, pagination available.
- **Frontend state management.** A single React Context for auth is the right call at this size — no premature Redux/Zustand. No meaningful prop-drilling.
- **Monorepo scaffolding.** `apps/` + `packages/` + `infra/` layout is future-proof.

## 4. What is below industry standards

- **No automated tests at all.** Zero `tests.py`, no `pytest`/`conftest`, no frontend `.test.tsx`. For a platform meant to be team-maintained and scale to 50k students, this is the single biggest gap. Every refactor and feature is currently a manual-QA gamble.
- **No production observability.** No `LOGGING` config, no Sentry/error tracking, no metrics. You will be debugging production blind.
- **Cache + async are not production-grade for scale.** Cache is `LocMemCache` (per-process), so throttles and the AI cache are inconsistent across gunicorn workers. Redis is in docker-compose but **Celery is commented out**, so emails, notifications, certificate PDF generation, and **synchronous AI calls (20s timeout) all run inside the request/response cycle** — each ties up a worker.
- **`packages/shared-types` and `packages/ui` are empty (README only).** The monorepo advertises shared types but DTOs are hand-duplicated in `lib/api.ts` mirroring DRF serializers — a drift risk (backend field change silently desyncs the frontend type).
- **No App Router `error.tsx` / `loading.tsx` / `not-found.tsx`.** Components handle their own loading, but there are no route-level error boundaries or a custom 404, so an unhandled render error shows the default Next error page.
- **API has no version namespace.** Routes are `/api/...` with no `/api/v1/...`. Fine today, but there's no clean path to evolve breaking changes for the future Flutter app.

## 5. Technical debt list (P0 / P1 / P2)

**P0 — Critical (must address very soon; blocks safe team maintenance/scale):**

1. **No test suite.** No regression safety net anywhere.
2. **No logging/error monitoring** in production settings.
3. **LocMemCache used for throttle + AI cache** under multi-worker gunicorn → limits/caches multiply per worker (security + cost correctness). Switch the cache backend to Redis (already running in compose).

**P1 — Important (fix shortly after launch):**

4. **Synchronous AI + email + PDF work in the request cycle.** Move to Celery (Redis broker already present) before traffic grows.
5. **Permission-class fragmentation.** Four near-duplicate `IsAdminRole`/admin checks across `creators`, `live_sessions`, `adminpanel`, `content` with subtly different role sets (the source of the bugs fixed in the permission audit). Consolidate into one `core/permissions.py`.
6. **`pagination_class = None` on growth-prone list endpoints** (e.g. submissions, some admin lists). Fine for small content tables; a latent problem for courses/submissions at scale.
7. **Missing query-shaped indexes.** Add indexes on hot filters: `Course.status` (every public list filters it), `LiveSession.start_time` / `Event.start_time` (upcoming queries), `Submission.status`, `Enrollment.student`. Only `versioning` has an explicit composite index today.
8. **Frontend DTO duplication.** Populate `packages/shared-types` (or generate types from the DRF schema) to kill FE/BE drift.
9. **Add `error.tsx` + `not-found.tsx`** route boundaries.

**P2 — Future improvements (nice to have):**

10. API versioning (`/api/v1/`).
11. Central prompt registry for AI (prompts are inline strings today).
12. Repository/selector layer for the few views with non-trivial querysets (consistency, testability).
13. Populate `packages/ui` with the genuinely shared primitives (buttons, cards) now copy-pasted.
14. N+1 sweep on list serializers that traverse relations without `select_related`/`prefetch_related` (8 view files use them today — verify coverage on the busiest list endpoints).

## 6. Refactoring recommendations (only those with real ROI)

- **Consolidate permissions** into `core/permissions.py` with a single source of truth for role sets. *Benefit: prevents the exact class of security bug already found; one place to reason about access.*
- **Switch cache to Redis** (one settings change + env var). *Benefit: correct rate-limiting and AI cache across workers — security + cost.*
- **Introduce Celery for AI/email/PDF.** *Benefit: protects worker pool under load; AI latency stops blocking requests.*
- **Add a thin test suite** (see §below). *Benefit: enables safe iteration by a team — the highest-leverage change here.*
- **Generate/seed `shared-types`.** *Benefit: eliminates a whole category of FE/BE integration bugs.*

Explicitly **not** recommended (elegance-only, no ROI now): rewriting working generics into ViewSets/routers, introducing GraphQL, splitting into microservices, or adding a state-management library. The current choices are appropriate for the stage.

## 7. Scalability assessment

| Tier | Verdict | Notes |
|---|---|---|
| **500 students** | ✅ Ready as-is | Single gunicorn + managed Postgres + the existing design handles this comfortably. Even LocMemCache is acceptable at one or two workers. |
| **5,000 students** | ⚠️ Ready after P0/P1 | Needs Redis cache, query indexes (§5.7), and Celery for AI/email/PDF so request workers aren't blocked. Add pagination to growth-prone lists. |
| **50,000 students** | ❌ Needs the P1 work + infra | Requires Redis-backed cache + Celery workers, DB read replica or connection pooling (PgBouncer), CDN for media (Spaces already wired), horizontal app scaling, and load/perf testing. The codebase is structured to get there, but the async + caching + indexing work is mandatory first. The synchronous in-request AI calls are the first thing that will fall over. |

The good news: the clean domain boundaries mean these are **additive** changes, not rewrites.

## 8. Top 20 improvements (priority order)

1. Add a backend test suite (pytest-django): models, permissions, the critical flows (enroll → progress → certificate; submit → grade; course submit → approve → publish).
2. Add request/error logging + Sentry (or equivalent).
3. Switch cache backend to Redis.
4. Move AI/email/PDF to Celery tasks.
5. Consolidate permission classes into `core/permissions.py`.
6. Add DB indexes on `Course.status`, `LiveSession.start_time`, `Event.start_time`, `Submission.status`, `Enrollment.student`.
7. Paginate growth-prone list endpoints (submissions, admin lists).
8. Populate `packages/shared-types` (or schema-generate FE types).
9. Add `error.tsx`, `loading.tsx`, `not-found.tsx` route boundaries.
10. Add a few frontend tests (auth gating, a couple of critical components) with Vitest/RTL.
11. Document and automate DB backup + restore (use managed Postgres with PITR on DigitalOcean).
12. Add health-check + readiness endpoints for the load balancer.
13. Introduce `/api/v1/` namespace before the Flutter app.
14. Central prompt registry + model/version pinning for Gemini.
15. Rate-limit and cache the chatbot endpoint (only summaries are cached today).
16. Add CI (lint + type-check + tests) on every PR — `tsc` and `manage.py check` already pass; wire them up.
17. N+1 sweep on the busiest list serializers.
18. Extract shared UI primitives into `packages/ui`.
19. Standardize API error response shape and document it.
20. Add an audit log for privileged admin actions (publish, approve, revoke, role changes).

## 9. Code-quality scorecard

| Area | Score | One-line justification |
|---|---:|---|
| Architecture | 8.0 / 10 | Clean domain apps, small files, partial service layer; minor permission fragmentation + empty packages. |
| Database | 7.5 / 10 | Solid constraints/joins; missing a few query-shaped indexes; some unpaginated lists. |
| API Design | 7.5 / 10 | Consistent DRF + throttling; no version namespace; mixed pagination policy. |
| Frontend | 8.0 / 10 | Excellent lib/API layer + hooks; missing route-level error/loading boundaries; empty ui package. |
| Security | 8.5 / 10 | Strong after the permission audit; JWT-in-localStorage + LocMem-throttle caveats remain. |
| Testing | 1.5 / 10 | Essentially none — the dominant weakness. |
| DevOps | 6.5 / 10 | Good env/secrets/docker; no logging/monitoring/Celery/Redis-cache/backup automation. |
| Maintainability | 8.0 / 10 | Small files, clear naming, strong docs. |
| Scalability | 6.5 / 10 | Great bones; sync AI + LocMem cache + few indexes cap it until P1 work. |
| Documentation | 8.5 / 10 | Extensive `docs/`, well above MVP norm. |

## 10. LMS industry comparison

- **vs. Moodle/Canvas (mature, plugin-heavy monoliths):** Digital Nalanda is far cleaner and more modern per line of code, but those have decades of test coverage, plugin ecosystems, and battle-tested scale. Your domain separation is comparable in *clarity*; you trail in *hardening* (tests, observability, async).
- **vs. Coursera/Udemy (large commercial platforms):** Those run microservices, heavy async pipelines, and CDNs. You are a well-architected monolith — the *right* choice at this stage, and your boundaries would make a future service-extraction (e.g. carve out `assistant` or `live_sessions`) feasible.
- **vs. Khan Academy (free, mission-driven, content-first):** Closest analog in spirit. KA invests heavily in testing and content tooling; matching even a fraction of their test discipline is your highest-value next step.

**Net:** architecture quality is competitive with established LMSs for an MVP; extensibility is good (clean modules); maintainability is good *structurally* but currently unsafe to evolve at speed because of the missing tests.

## 11. Launch readiness assessment

- **Can it launch to ~500 learners now?** Yes — functionally and (post permission-audit) security-wise it is ready. Add logging before you do, so you can see problems.
- **Before scaling past a few thousand:** do P0 (#1–3) and P1 (#4–9).
- **Must-fix-now (before/at launch):** production logging + error monitoring (#2); a minimal smoke-test suite for the enroll→certificate and submit→grade flows (#1); confirm managed-Postgres backups are on (#11).
- **Fix-after-launch:** Celery, Redis cache, indexes, pagination, shared-types, route error boundaries.
- **Nice-to-have:** API versioning, prompt registry, `packages/ui`, audit log.

## 12. Final verdict

### ✅ Good architecture (MVP-grade), launch-ready after adding observability + a smoke-test suite.

The structure, separation of concerns, AI design, resilience patterns, and documentation are genuinely strong — better than most MVPs and competitive with established LMS platforms in code clarity. It is **not** "requires major refactoring": the bones are right and future scaling is additive, not a rewrite.

The one thing standing between "good MVP" and "safe to grow with a team" is the **complete absence of automated tests**, closely followed by **missing production observability**. Address those two and harden cache/async (P0/P1), and this platform is well-positioned for long-term growth.

---

### Verification
- `python manage.py check` → no issues. `npm run type-check` (tsc) → clean.
- No code was changed by this review (analysis only). Security fixes were applied separately in `ROLE_PERMISSION_AUDIT.md`.
