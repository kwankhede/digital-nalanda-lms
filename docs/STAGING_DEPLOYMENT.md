# Staging Deployment Checklist — DigitalOcean App Platform

> Run after the Sprint 0 P0 fixes. Goal: a private HTTPS staging URL
> (`*.ondigitalocean.app`) for stakeholder review. **Do not seed demo users.**

## 0. Pre-flight (local)
- [ ] `cd apps/web && npm run build` passes (verify on a real machine — the
      sandbox can't run the prod build).
- [ ] `cd apps/api && pip install -r requirements.txt`
- [ ] `DJANGO_DEBUG=False DJANGO_SECRET_KEY=… DJANGO_ALLOWED_HOSTS=… \
       python manage.py check --deploy` → no issues (already verified clean).
- [ ] Commit & push to GitHub (`git add -A && git commit && git push`).

## 1. Create the App (App Platform)
- [ ] New App → connect the `kwankhede/digital-nalanda-lms` GitHub repo.
- [ ] Component **api** (Django): source dir `apps/api`.
  - Build: `pip install -r requirements.txt`
  - Run: `gunicorn config.wsgi --bind 0.0.0.0:8080`
  - (Pre-deploy job) `python manage.py migrate` and `python manage.py collectstatic --noinput`
- [ ] Component **web** (Next.js): source dir `apps/web`.
  - Build: `npm ci && npm run build`
  - Run: `npm start`
- [ ] Add a **Managed PostgreSQL** dev database → copy its connection string.

## 2. Environment variables
**api component**
- [ ] `DJANGO_SECRET_KEY` = strong random (e.g. `python -c "import secrets;print(secrets.token_urlsafe(50))"`)
- [ ] `DJANGO_DEBUG=False`
- [ ] `DJANGO_ALLOWED_HOSTS` = `your-app.ondigitalocean.app`
- [ ] `CSRF_TRUSTED_ORIGINS` = `https://your-app.ondigitalocean.app`
- [ ] `CORS_ALLOWED_ORIGINS` = `https://your-app.ondigitalocean.app` (the web URL)
- [ ] `FRONTEND_URL` = `https://your-app.ondigitalocean.app`
- [ ] `DATABASE_URL` = managed Postgres connection string
- [ ] `GEMINI_API_KEY` = real key (optional; blank → template summaries)
- [ ] **Spaces (recommended for durable certificates):**
      `USE_SPACES=True`, `SPACES_KEY`, `SPACES_SECRET`, `SPACES_BUCKET`,
      `SPACES_ENDPOINT` (e.g. `https://blr1.digitaloceanspaces.com`), `SPACES_REGION`

**web component**
- [ ] `NEXT_PUBLIC_API_URL` = the api component's public URL

## 3. First deploy
- [ ] Deploy. Confirm migrate + collectstatic ran in the build/deploy logs.
- [ ] Create the admin **manually** (App Platform console):
      `python manage.py createsuperuser` — **NOT** `seed_demo_users`.
- [ ] (Optional) seed real content via the migration import commands.

## 4. Smoke test on the staging URL
- [ ] Home page loads over HTTPS; chatbot widget appears.
- [ ] Register a student → log in → enrol → complete a lesson → certificate issues + downloads.
- [ ] Course page "AI Summary" generates (or shows template fallback).
- [ ] **Security re-check:** as an anonymous user, `GET /api/live-sessions/`
      and `/api/live-sessions/<slug>/calendar.ics` contain **no** `zoom_join_url`
      or `zoom_password`.
- [ ] Hit `/api/auth/login/` >10×/min → returns HTTP 429 (throttle works).
- [ ] Spot-check each role's dashboard (admin, creator, mentor, student).

## 5. After staging is green
- [ ] Enable managed Postgres automated backups.
- [ ] (If launching publicly) buy a domain, add it in App Platform, update
      `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS` / `CORS` / `FRONTEND_URL` /
      `NEXT_PUBLIC_API_URL` to the domain.
- [ ] Proceed to P1 (tests, monitoring, caching) per LAUNCH_ACTION_PLAN.md.

---
### Sprint 0 status (done)
P0-1 Zoom exposure fixed · P0-2 secret-key guard · P0-3 prod security + CSRF
trusted origins · P0-4/5 gunicorn + whitenoise · P0-6 throttling + AI cache ·
P0-7 demo-user prod guard · P0-9 Spaces (conditional). Remaining: P0-8 local
`npm run build` confirmation + P0-10 this smoke test on staging.
