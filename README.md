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

## License

Proprietary — Digital Nalanda. All rights reserved.
