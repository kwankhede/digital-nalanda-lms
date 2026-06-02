# Architecture

> Digital Nalanda LMS — System design and architectural decisions.

## 1. High-Level Overview

Digital Nalanda LMS is a monorepo with a decoupled frontend and backend. The
Next.js web app talks to the Django REST API over HTTP/JSON. PostgreSQL is the
system of record; Redis backs caching and the Celery task queue. Everything runs
locally through Docker Compose and deploys to DigitalOcean (Docker) initially.

```
Browser ──▶ Next.js (web :3000) ──HTTP/JSON──▶ Django REST API (api :8000)
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          ▼                         ▼                        ▼
                   PostgreSQL (:5432)        Redis (:6379)            Celery workers
                   (system of record)     (cache + broker)        (async jobs, future)
```

## 2. Current Repository Structure

```
apps/
  api/                     # Django + DRF backend
    config/                # Project: settings, urls, wsgi, asgi, celery
    core/                  # Health check + shared API plumbing
    users/                 # Custom AUTH_USER_MODEL (User + role)
    courses/               # (models added later)
    enrollments/           # (models added later)
    progress/              # (models added later)
    certificates/          # (models added later)
    manage.py
    requirements.txt
    Dockerfile
  web/                     # Next.js (App Router)
    src/app/               # Routes: / , /courses , /login , /dashboard
    src/components/        # Navbar, Footer
    tailwind.config.ts     # Brand palette (navy / blue / orange)
    Dockerfile
  mobile/                  # Flutter (future, not implemented)
packages/                  # shared-types, ui (future)
infra/                     # docker, nginx configs (future)
docs/                      # PRD, ARCHITECTURE, DATABASE_SCHEMA, API_SPEC
docker-compose.yml         # postgres + redis + api + web
```

## 3. Frontend (Next.js)

Next.js 14 with the App Router, TypeScript, and Tailwind CSS. Pages are server
components by default. The API base URL is injected via `NEXT_PUBLIC_API_URL`.
Current pages (Home, Courses, Login, Dashboard) use static placeholder data and
will be wired to the API in a later phase.

## 4. Backend (Django + DRF)

A single Django project (`config/`) with one app per domain. Configuration is
fully environment-driven via `django-environ` (see `apps/api/.env.example`), so
the same image runs across environments. A custom `users.User` model is defined
up front because `AUTH_USER_MODEL` is hard to change after the first migration.
DRF is configured with `IsAuthenticatedOrReadOnly` defaults and page-number
pagination. Only `GET /api/health/` exists today.

## 5. Data Layer (PostgreSQL)

PostgreSQL 16, accessed through `DATABASE_URL`. Schema details live in
[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## 6. Caching & Async (Redis + Celery — optional)

Redis and Celery are **optional** and not required for local development; the
backend runs fully without them (the Celery import is guarded). Install
`requirements-optional.txt` when async jobs are introduced.

Redis serves as both the cache and the Celery broker / result backend. The
Celery app is bootstrapped in `config/celery.py` and loaded in
`config/__init__.py`; task modules will be auto-discovered per app.

## 7. Media & Video Delivery

Course videos are YouTube embeds. Documents, images, and certificates will move
to Cloudflare R2 (S3-compatible object storage) in a later phase.

## 8. Deployment & Infrastructure

Docker images per app, orchestrated by Compose locally. Initial production
target is DigitalOcean with Nginx as a reverse proxy (TLS, routing). Configs
will live under `infra/`.

## 9. Scalability Strategy

Stateless API containers scale horizontally behind a load balancer. Redis
caching and Celery offload heavy/slow work. PostgreSQL scales via connection
pooling and read replicas as load grows toward millions of students.

## 10. Security Considerations

Secrets via environment variables (never committed). CORS restricted to known
origins. DRF permission defaults deny unauthenticated writes. HTTPS terminated
at Nginx in production.
