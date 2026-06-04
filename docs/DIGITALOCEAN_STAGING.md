# Digital Nalanda — DigitalOcean Staging Deployment

**Purpose:** Stand up a **staging** environment on DigitalOcean App Platform to validate the platform end-to-end *before* migrating LearnWorlds content. **Do not public-launch from this guide.** After staging works and the sample migration test passes, content is migrated in batches.

---

## 0. Pre-flight verification (done — 2026-06-04)

| # | Check | Result |
|---|---|---|
| 1 | All P0 security fixes complete | ✅ Zoom creds stripped from public serializer; `SECRET_KEY` guard; prod security block (SSL redirect, HSTS, secure cookies, `X_FRAME_OPTIONS`); CORS + `CSRF_TRUSTED_ORIGINS`; DRF throttles (login 10, register 5, ai 10, chat 30, anon 60, user 240 /min); `seed_demo_users` refuses to run when `DEBUG=False`. Permission-audit fixes also applied (see `ROLE_PERMISSION_AUDIT.md`). |
| 2 | Production env vars documented | ✅ `apps/api/.env.example` covers SECRET_KEY, DEBUG, ALLOWED_HOSTS, DATABASE_URL, CORS, FRONTEND_URL, CSRF_TRUSTED_ORIGINS, Spaces, Gemini, Redis. Full table in §4. |
| 3 | gunicorn / whitenoise installed | ✅ In `requirements.txt` (`gunicorn==22.0.0`, `whitenoise==6.7.0`); whitenoise middleware + `CompressedManifestStaticFilesStorage` wired in `settings.py`. |
| 4 | DigitalOcean Spaces config for media/certificates | ✅ `USE_SPACES=True` switches `STORAGES["default"]` to S3/Spaces; `AWS_DEFAULT_ACL=public-read` (certificates are shareable), `AWS_QUERYSTRING_AUTH=False`. Local disk is ephemeral on DO — **Spaces is required** so issued certificates survive redeploys. |
| 5 | `npm run build` passes | ⚠️ `tsc --noEmit` passes clean. The full `next build` must run on a machine/CI with enough memory (it OOMs in the constrained audit sandbox — **not** a code error). DO App Platform's build step has adequate memory and runs it for you. |
| 6 | `python manage.py check --deploy` passes | ✅ **0 issues** in production mode (DEBUG=False, strong key, ALLOWED_HOSTS + CSRF set). |

> Re-run #5/#6 yourself before deploying: `cd apps/web && npm run build` and `cd apps/api && DJANGO_DEBUG=False DJANGO_SECRET_KEY=... DJANGO_ALLOWED_HOSTS=... python manage.py check --deploy`.

---

## 1. Staging architecture (DigitalOcean App Platform)

```
                ┌─────────────────────────────────────────┐
   Browser ───▶ │  Web service  (Next.js, Node 20)         │
                │   run: npm run build → npm start          │
                │   NEXT_PUBLIC_API_URL ─────────┐          │
                └────────────────────────────────┼──────────┘
                                                  ▼
                ┌─────────────────────────────────────────┐
                │  API service  (Django, gunicorn)         │
                │   pre-deploy: migrate + collectstatic     │
                └───────┬─────────────────────┬────────────┘
                        ▼                     ▼
              Managed Postgres        DigitalOcean Spaces
              (staging DB)            (media + certificates)
                        ▲
              (Redis — optional for staging; LocMem is fine on 1 instance)
```

For staging keep it minimal: **1 API instance + 1 Web instance + 1 managed Postgres (dev size) + 1 Spaces bucket.** Redis is optional at staging scale (a single instance makes LocMem cache/throttle correct). Add Redis when you move toward production scale (see `ARCHITECTURE_REVIEW.md`).

---

## 2. Prerequisites

- DigitalOcean account; `doctl` CLI optional but handy.
- Repo pushed to GitHub (`kwankhede/digital-nalanda-lms`) — App Platform deploys from GitHub.
- A generated production secret: `python -c "import secrets; print(secrets.token_urlsafe(64))"`.

---

## 3. Create the Spaces bucket (media + certificates)

1. DO → **Spaces** → Create bucket, e.g. `digital-nalanda-staging`, region e.g. `blr1` (Bangalore) or nearest.
2. **API → Spaces Keys** → generate an access key + secret.
3. Note the endpoint: `https://blr1.digitaloceanspaces.com` (swap region).
4. These map to `SPACES_*` env vars in §4.

---

## 4. Environment variables

### API service

| Variable | Staging value | Notes |
|---|---|---|
| `DJANGO_SECRET_KEY` | *(generated, secret)* | Mark **encrypted** in App Platform. |
| `DJANGO_DEBUG` | `False` | Must be False — triggers the prod security block. |
| `DJANGO_ALLOWED_HOSTS` | `dn-staging-api.ondigitalocean.app` | The API component's domain (add custom domain later). |
| `DATABASE_URL` | *(from managed PG)* | App Platform can inject this via `${db.DATABASE_URL}` binding. |
| `CORS_ALLOWED_ORIGINS` | `https://dn-staging-web.ondigitalocean.app` | The web component's URL. |
| `CSRF_TRUSTED_ORIGINS` | `https://dn-staging-web.ondigitalocean.app` | Required when DEBUG=False. |
| `FRONTEND_URL` | `https://dn-staging-web.ondigitalocean.app` | Used in certificate verify links / QR. |
| `USE_SPACES` | `True` | Switches media/cert storage to Spaces. |
| `SPACES_KEY` / `SPACES_SECRET` | *(from §3)* | Mark **encrypted**. |
| `SPACES_BUCKET` | `digital-nalanda-staging` | |
| `SPACES_ENDPOINT` | `https://blr1.digitaloceanspaces.com` | Region-specific. |
| `SPACES_REGION` | `blr1` | |
| `GEMINI_API_KEY` | *(optional)* | Blank = deterministic template/rule fallback (feature still works). |
| `REDIS_URL` | *(optional at staging)* | Only if you add a Redis component. |

### Web service

| Variable | Staging value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://dn-staging-api.ondigitalocean.app` | Baked at build — must be set as a **build-time** var. |
| `NODE_ENV` | `production` | App Platform sets this. |

---

## 5. Create the App (App Platform)

> The repo's `apps/api/Dockerfile` and `apps/web/Dockerfile` are **dev-oriented** (`runserver` / `npm run dev`). For staging, set explicit **run commands** (App Platform's `run_command` overrides the Docker `CMD`), or use the Node/Python **buildpacks**. The guide below uses run commands.

### 5a. API component
- **Source:** GitHub repo, branch `main`, source dir `apps/api`.
- **Type:** Web Service. **HTTP port:** `8080`.
- **Build command** (buildpack): `pip install -r requirements.txt`
- **Run command:** `gunicorn config.wsgi:application --bind 0.0.0.0:8080 --workers 3 --timeout 60`
- **Pre-deploy job** (App Platform → "Jobs", kind = `PRE_DEPLOY`, same image): 
  `python manage.py migrate --noinput && python manage.py collectstatic --noinput`
- Attach the env vars from §4 (API).

### 5b. Web component
- **Source:** same repo, source dir `apps/web`.
- **Type:** Web Service. **HTTP port:** `3000` (or `8080` — set `PORT`).
- **Build command:** `npm ci && npm run build`
- **Run command:** `npm start`
- Set `NEXT_PUBLIC_API_URL` as a **build-time** env var (§4 Web).

### 5c. Managed Postgres
- Add a **Dev Database** (Postgres 16) to the app. Bind `DATABASE_URL` to the API service.
- **Turn on automated backups / point-in-time recovery** (managed PG includes daily backups — confirm retention).

### Sample app spec (`.do/app.yaml`) — reference
```yaml
name: digital-nalanda-staging
region: blr
services:
  - name: api
    github: { repo: kwankhede/digital-nalanda-lms, branch: main, deploy_on_push: true }
    source_dir: apps/api
    build_command: pip install -r requirements.txt
    run_command: gunicorn config.wsgi:application --bind 0.0.0.0:8080 --workers 3 --timeout 60
    http_port: 8080
    instance_size_slug: basic-xs
    envs:
      - { key: DJANGO_DEBUG, value: "False" }
      - { key: DJANGO_SECRET_KEY, value: "REPLACE", type: SECRET }
      - { key: DJANGO_ALLOWED_HOSTS, value: "${api.PUBLIC_URL}" }
      - { key: DATABASE_URL, value: "${db.DATABASE_URL}" }
      - { key: USE_SPACES, value: "True" }
      # ...remaining §4 vars
  - name: web
    github: { repo: kwankhede/digital-nalanda-lms, branch: main, deploy_on_push: true }
    source_dir: apps/web
    build_command: npm ci && npm run build
    run_command: npm start
    http_port: 3000
    instance_size_slug: basic-xs
    envs:
      - { key: NEXT_PUBLIC_API_URL, value: "${api.PUBLIC_URL}", scope: BUILD_TIME }
jobs:
  - name: migrate
    kind: PRE_DEPLOY
    github: { repo: kwankhede/digital-nalanda-lms, branch: main }
    source_dir: apps/api
    run_command: python manage.py migrate --noinput && python manage.py collectstatic --noinput
databases:
  - name: db
    engine: PG
    version: "16"
```

---

## 6. Staging deployment checklist

- [ ] Spaces bucket + keys created (§3).
- [ ] Strong `DJANGO_SECRET_KEY` generated and stored as an encrypted var.
- [ ] All API env vars set; `DJANGO_DEBUG=False`; `USE_SPACES=True`.
- [ ] `DJANGO_ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`/`CORS_ALLOWED_ORIGINS` match the real component URLs.
- [ ] Web `NEXT_PUBLIC_API_URL` set as a **build-time** var pointing at the API URL.
- [ ] Managed Postgres attached; `DATABASE_URL` bound; backups on.
- [ ] Pre-deploy job runs `migrate` + `collectstatic` and succeeds in the deploy logs.
- [ ] API run command is **gunicorn** (not `runserver`).
- [ ] First deploy succeeds; both components show "Running".
- [ ] Create an admin via the API console: `python manage.py createsuperuser` (do **not** run `seed_demo_users` in staging — it's guarded off when DEBUG=False; use real accounts).
- [ ] (Optional) seed reference content: `seed_schools`, `seed_educators` — skip if you'll migrate real content next.

---

## 7. Post-deploy smoke test checklist

Run these against the live staging URLs. Each should behave as noted.

**Health / public**
- [ ] `GET /api/courses/` returns JSON (200) — even if empty.
- [ ] Homepage loads; nav, ticker, footer render; no console/CORS errors.
- [ ] `GET /api/schools/`, `/api/educators/`, `/api/study-materials/`, `/api/ticker/` return 200.
- [ ] HTTPS enforced (http → https redirect); security headers present (HSTS).

**Auth**
- [ ] Register a new student → 201; can log in; `/api/auth/me/` returns the profile.
- [ ] Wrong password → 401; protected page redirects to `/login`.

**Roles (use real test accounts you create)**
- [ ] Student cannot open `/admin/*` or `/creator/*` (redirected to `/unauthorized`).
- [ ] Admin can open the admin dashboard and the in-app managers (study materials, ticker).
- [ ] Course creator can open `/creator/dashboard` and create a draft course.

**Media / certificates (Spaces)**
- [ ] Upload an image somewhere it's used → the URL points at the Spaces domain, not local disk.
- [ ] Issue/verify a certificate → the PDF/URL resolves from Spaces; `/certificates/verify/<code>/` shows only safe fields.

**Security spot-checks (from the permission audit)**
- [ ] Public live-session/event JSON does **not** contain `zoom_join_url`/`zoom_password`.
- [ ] A student calling an admin/creator API gets 401/403 (not data).
- [ ] A student cannot read another student's certificate download or another's assignment (404/403).

**AI**
- [ ] Chatbot answers (rule-based or Gemini); with no `GEMINI_API_KEY` it still responds via fallback.
- [ ] Course AI-summary tab loads (cached).

---

## 8. Sample migration test plan (1 course, end-to-end)

Goal: prove the data model + flows work with **one real-shaped course** before batch-migrating LearnWorlds. Do this in the API console (`python manage.py shell`) or Django admin. **Keep it to a single course.**

### 8.1 Import targets
1. **1 course** — title, slug, short/long description, level, language, category; set `status="published"`, `is_published=True`.
2. **Modules** — 2–3 modules with `order`.
3. **Lessons** — 2–4 lessons per module with `order`, `lesson_type`, and **YouTube video IDs** (the 11-char id, e.g. `I9q-7GPQr1Y`, not the full URL).
4. **2 users** — one student, one second student (to test isolation).
5. **Enrollments** — enrol student #1 in the course (leave student #2 unenrolled, to confirm isolation).
6. **Progress** — mark some lessons complete for student #1.
7. **Certificate** — complete 100% for student #1 and confirm a certificate is issued + verifiable.

### 8.2 Example shell script (adapt field names to the models)
```python
python manage.py shell
```
```python
from django.contrib.auth import get_user_model
from courses.models import Course, Category, Module, Lesson
from enrollments.models import Enrollment
U = get_user_model()

cat, _ = Category.objects.get_or_create(name="Mathematics", defaults={"slug":"mathematics"})
c = Course.objects.create(
    title="Foundations of Algebra", slug="foundations-of-algebra",
    short_description="Start algebra from scratch.", description="Full intro to algebra.",
    level="beginner", language="English", category=cat,
    status="published", is_published=True,
)
m1 = Module.objects.create(course=c, title="Basics", order=1)
m2 = Module.objects.create(course=c, title="Equations", order=2)
Lesson.objects.create(module=m1, title="What is a variable?", slug="variable",
                      lesson_type="video", youtube_video_id="I9q-7GPQr1Y", order=1)
Lesson.objects.create(module=m1, title="Expressions", slug="expressions",
                      lesson_type="video", youtube_video_id="I9q-7GPQr1Y", order=2)
Lesson.objects.create(module=m2, title="Solving for x", slug="solving-for-x",
                      lesson_type="video", youtube_video_id="I9q-7GPQr1Y", order=1)

s1 = U.objects.create_user(username="teststudent1@dn.org", email="teststudent1@dn.org",
                           password="StagingTest123!", role="student", full_name="Test Student 1")
s2 = U.objects.create_user(username="teststudent2@dn.org", email="teststudent2@dn.org",
                           password="StagingTest123!", role="student", full_name="Test Student 2")
Enrollment.objects.create(student=s1, course=c)
print("seeded:", c.id, s1.id, s2.id)
```

### 8.3 Then exercise the flows via the live site / API (as student #1)
- Open the course → all modules/lessons render; each YouTube video plays.
- Mark each lesson complete → progress increments (check `/dashboard` and the progress API).
- On 100% completion → certificate is issued; download it (resolves from Spaces); `/certificates/verify/<code>/` shows name/course/number/date only.

### 8.4 Pass criteria
| Check | Pass = |
|---|---|
| Course visible | Appears on `/courses` and detail page renders. |
| Modules/lessons ordered | Correct order; lessons grouped under modules. |
| YouTube playback | Each lesson video plays from its id. |
| Enrollment isolation | Student #1 sees the course in their dashboard; student #2 does **not** see #1's progress/certificate (no IDOR). |
| Progress | Marking lessons complete updates % for the right student only. |
| Certificate | Issued at 100%, downloadable by owner only, publicly verifiable with safe fields, file served from Spaces. |

If all six pass, the data model and the migration shape are validated → proceed to **batched** LearnWorlds import (courses → modules → lessons → media → users → enrollments), re-running §8.4 on a sample from each batch.

---

## 9. Do NOT do yet
- ❌ No public launch / marketing.
- ❌ No full LearnWorlds content migration — only the single sample course above.
- ❌ Don't run `seed_demo_users` in staging (public passwords; guarded off when DEBUG=False).

## 10. After staging is green
1. Migrate LearnWorlds content in **batches**, validating a sample per batch with §8.4.
2. Add production observability (logging + Sentry) and switch cache to Redis before scaling — see `ARCHITECTURE_REVIEW.md` P0/P1.
3. Add a baseline automated test suite before heavy iteration.
4. Promote to production (custom domain, separate prod DB/Spaces, separate secrets).

---

### Verification commands recap
```bash
# Backend deploy check (production simulation)
cd apps/api
DJANGO_DEBUG=False DJANGO_SECRET_KEY="$(python -c 'import secrets;print(secrets.token_urlsafe(64))')" \
  DJANGO_ALLOWED_HOSTS="staging.example.com" CSRF_TRUSTED_ORIGINS="https://staging.example.com" \
  python manage.py check --deploy        # → 0 issues

# Frontend
cd ../web
npm run type-check                        # → clean
npm run build                             # run on your machine / CI (needs memory)
```
