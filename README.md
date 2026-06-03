# Digital Nalanda LMS

A scalable Learning Management System for **Digital Nalanda**, built to serve 20,000 students initially and scale to millions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | Django + Django REST Framework |
| Database | PostgreSQL |
| Cache / Queue | Redis + Celery |
| Video | YouTube embeds |
| Object Storage | Cloudflare R2 (later) |
| Deployment | Docker + DigitalOcean (initial) |
| Mobile | Flutter (later) |

## Monorepo Layout

```
digital-nalanda-lms/
├── apps/
│   ├── web/        # Next.js frontend (App Router, TS, Tailwind)
│   ├── api/        # Django REST backend (config/ + feature apps)
│   └── mobile/     # Flutter app (future)
├── packages/
│   ├── shared-types/  # Shared TypeScript types/contracts
│   └── ui/            # Shared UI component library
├── infra/
│   ├── docker/     # Dockerfiles & container configs
│   └── nginx/      # Reverse proxy configs
├── docs/           # PRD, architecture, schema, API spec
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Specification](docs/API_SPEC.md)

## Local Setup (no Docker required)

You only need three things installed:

- **Python 3.12+**
- **Node.js 20+**
- **PostgreSQL 14+** running locally

Redis/Celery are **optional** and not needed to run the app.

You'll run the backend and frontend in **two separate terminals**.

### 1. Create the database

Create an empty `digital_nalanda` database in your local Postgres (default
user/password assumed to be `postgres`/`postgres` — adjust `DATABASE_URL` if yours differ).

### 2. Backend — `apps/api`

**macOS / Linux**

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then edit DATABASE_URL if needed
python manage.py migrate
python manage.py runserver
```

**Windows (PowerShell)**

```powershell
cd apps\api
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env          # then edit DATABASE_URL if needed
python manage.py migrate
python manage.py runserver
```

API runs at **http://localhost:8000**. Create an admin login with
`python manage.py createsuperuser`.

### 3. Frontend — `apps/web` (second terminal)

**macOS / Linux**

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

**Windows (PowerShell)**

```powershell
cd apps\web
npm install
copy .env.example .env.local
npm run dev
```

Web app runs at **http://localhost:3000**.

### 4. Verify

```bash
curl http://localhost:8000/api/health/
# {"status": "ok", "service": "digital-nalanda-api"}
```

- Web app → http://localhost:3000
- Django admin → http://localhost:8000/admin/

---

## Optional: Docker (for deployment / running the whole stack at once)

Docker is **not** required for local development. It's kept for deployment and
for anyone who wants Postgres + Redis + API + Web in one command:

```bash
cp apps/api/.env.example apps/api/.env
docker compose up --build
```

The `api` container overrides the DB host to the `postgres` service
automatically, so it works without editing your local `.env`.

---

## Optional: background tasks (Celery + Redis)

Not needed yet. When you add async jobs:

```bash
pip install -r apps/api/requirements-optional.txt   # installs celery + redis
# then uncomment REDIS_URL / CELERY_BROKER_URL in apps/api/.env
```

## Roles, login & course creation

### Create a real super admin
```bash
cd apps/api
source .venv/bin/activate
python manage.py createsuperuser
# then log in at http://localhost:8000/admin/
```

### Seed demo users (LOCAL DEV ONLY)
```bash
python manage.py seed_demo_users
```
Creates one login per role — **all passwords `ChangeMe123!`**. ⚠ Never use
these in production.

| Role | Email | Lands on |
|------|-------|----------|
| Super Admin | superadmin@digitalnalanda.org | /admin |
| Admin | admin@digitalnalanda.org | /admin |
| Content Manager | content@digitalnalanda.org | /admin |
| Course Creator | teacher@digitalnalanda.org | /creator/dashboard |
| Mentor | mentor@digitalnalanda.org | /mentor/dashboard |
| Event Manager | events@digitalnalanda.org | /admin |
| Student | student@digitalnalanda.org | /dashboard |
| Volunteer | volunteer@digitalnalanda.org | /volunteer/dashboard |

Log in at http://localhost:3000/login — you're redirected by role
(`getDefaultDashboardForRole`). Unauthorized access → `/unauthorized`.

### Create a course as an Admin
Either **Django admin** (`/admin/courses/course/` — add course + inline
modules/lessons, set status `published`), or the frontend builder at
**`/admin/courses/new`** → add curriculum → **Publish**.

### Create a course as a Teacher
1. `/become-teacher` → submit application (role → teacher_applicant).
2. Admin approves at `/admin/applications` (role → course_creator).
3. Teacher: `/creator/courses/new` → draft → add modules/lessons → **Submit for Review**.
4. Admin: `/admin/course-reviews` → **Approve** → **Publish**. Teachers can never publish directly.

### How permissions / security work
Backend enforces everything (see [PERMISSIONS_MATRIX.md](docs/PERMISSIONS_MATRIX.md)
and [SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)). Public course APIs show
only `status=published`; certificate download is owner-only; teacher approval and
course publishing are admin-only. Frontend route guards are UX only.

## API Endpoints

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Service health check |
| POST | `/api/auth/register/` | Register (email + password) → returns user + JWT |
| POST | `/api/auth/login/` | Login (email + password) → access + refresh |
| POST | `/api/auth/token/refresh/` | Exchange refresh token for new access |
| POST | `/api/auth/logout/` | Blacklist refresh token (auth required) |
| GET | `/api/auth/me/` | Current user's profile (auth required) |
| PATCH | `/api/auth/me/` | Update profile fields (auth required) |
| GET | `/api/categories/` | List all course categories |
| GET | `/api/courses/` | List published courses |
| GET | `/api/courses/<slug>/` | Course detail with modules + lessons |
| POST | `/api/courses/<slug>/enroll/` | Enroll current student (auth) |
| GET | `/api/my/enrollments/` | Student's enrollments (auth) |
| GET | `/api/my/courses/` | Enrolled courses + progress (auth) |
| GET | `/api/my/progress/` | Lesson progress; `?course=<slug>` (auth) |
| POST | `/api/lessons/<id>/progress/` | Record watch seconds (auth, enrolled) |
| POST | `/api/lessons/<id>/complete/` | Mark lesson complete; auto-updates progress (auth, enrolled) |
| POST | `/api/certificates/generate/<slug>/` | Issue certificate for a completed course (auth, idempotent) |
| GET | `/api/my/certificates/` | Student's certificates (auth) |
| GET | `/api/certificates/<id>/` | Certificate metadata — owner only (auth) |
| GET | `/api/certificates/<id>/download/` | Download certificate PDF — owner only (auth) |
| GET | `/api/certificates/verify/<code>/` | **Public** certificate verification |
| GET | `/api/live-sessions/` | List live sessions (public) |
| GET | `/api/live-sessions/upcoming/` | Upcoming live sessions (public) |
| GET | `/api/live-sessions/recordings/` | Completed public recordings (public) |
| GET | `/api/live-sessions/<slug>/` | Live session detail (public) |
| POST | `/api/live-sessions/<slug>/join/` | Record attendance, return Zoom URL (auth) |
| GET | `/api/live-sessions/<slug>/attendance/` | Attendance — mentor(owner)/admin |
| GET | `/api/events/` `/api/events/upcoming/` `/api/events/<slug>/` | Events (public) |
| GET | `/api/home/recordings/` | Last 5 public recordings, newest first (public) |
| GET | `/api/home/upcoming/` | Live sessions + events, next 30 days, max 10, chronological (public) |
| POST/PATCH/DELETE | `/api/admin/live-sessions/` `/api/admin/events/` | Manage (admin role) |
| GET | `/api/mentor/live-sessions/` | Mentor's own sessions (mentor/admin) |
| GET | `/api/schools/` `/api/schools/<slug>/` | Schools (public) |
| GET | `/api/learning-paths/` | Learning paths (public) |
| GET | `/api/educators/featured/` | Featured educators (public) |
| GET | `/api/community-libraries/` | Community libraries (public) |
| GET | `/api/courses/featured/` | Featured courses for homepage (public) |
| GET | `/api/home/impact/` | Impact statistics (public) |
| POST | `/api/newsletter/subscribe/` | Newsletter signup (public) |
| GET | `/api/stories/` `/api/stories/featured/` `/api/stories/<slug>/` | Success stories (public) |

**Course list filters** (query params, combinable):

- `?category=<slug>` — e.g. `?category=computer`
- `?level=<beginner\|intermediate\|advanced>`
- `?language=<language>` — e.g. `?language=Hindi`

Example: `GET /api/courses/?category=computer&level=beginner`

Responses are paginated: `{ "count", "next", "previous", "results": [...] }`.

### Authentication

Auth uses JWT (djangorestframework-simplejwt). Login/register return an
`access` token (send as `Authorization: Bearer <token>`) and a `refresh` token.
Login is by **email + password**.

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@example.com","password":"testpass123","full_name":"Ravi Kumar"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"ravi@example.com","password":"testpass123"}'

# Get profile (use the access token from login)
curl http://localhost:8000/api/auth/me/ -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Seed example data:**

```bash
cd apps/api
python manage.py seed_courses    # 5 courses, 5 categories, 12 lessons (idempotent)
python manage.py seed_content    # schools, paths, educators, libraries, impact, stories (idempotent)
```

## License

Proprietary — Digital Nalanda. All rights reserved.
