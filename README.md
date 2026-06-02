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
│   ├── web/        # Next.js frontend
│   ├── api/        # Django REST backend
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

## Getting Started

> Scaffolding only — application code is added in later phases.

```bash
git clone https://github.com/kwankhede/digital-nalanda-lms.git
cd digital-nalanda-lms
docker compose up   # placeholder services (postgres, redis, api, web)
```

## License

Proprietary — Digital Nalanda. All rights reserved.
