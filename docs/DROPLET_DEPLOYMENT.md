# Digital Nalanda — Staging on the existing Droplet (vitaran-intelligence)

Run Digital Nalanda **alongside** the existing project on Droplet `157.245.144.61`
(8 GB / 2 vCPU / Ubuntu 24.04), as isolated Docker containers exposed on **port 8080**.
The host's existing nginx on 80/443 is left completely untouched.

- **Staging URL:** `http://157.245.144.61:8080`
- **Isolation:** own containers + own Postgres (Docker volume `dn_pgdata`). Nothing shared with the existing app except the OS.
- **Plain HTTP** (no domain/TLS yet) — Django's HTTPS redirect is turned off for staging via `DJANGO_SECURE_SSL=False`. (Real production keeps it ON by default.)

> First push the repo changes (new Dockerfiles, `docker-compose.prod.yml`, nginx conf, settings toggle) from your Mac, then do everything else over SSH on the Droplet.

---

## 0. Push the latest code (on your Mac)
```bash
cd ~/Desktop/"Digital Nalanda LMS"/"Digital Nalanda LMS"
git add -A
git commit -m "Droplet staging: prod compose + nginx proxy + DJANGO_SECURE_SSL toggle"
git push origin main
```

## 1. SSH into the Droplet
```bash
ssh root@157.245.144.61
```

## 2. Install Docker + Compose (one time; does not affect the existing app)
```bash
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

## 3. Get the code onto the Droplet
```bash
mkdir -p /opt && cd /opt
git clone https://github.com/kwankhede/digital-nalanda-lms.git
cd digital-nalanda-lms
```
(Private repo? Use a GitHub Personal Access Token or deploy key when prompted.)

## 4. Create the environment file `/opt/digital-nalanda-lms/.env.prod`
```bash
cat > .env.prod <<'EOF'
# ---- Postgres (container) + compose substitution ----
POSTGRES_USER=nalanda
POSTGRES_PASSWORD=cUD2Cm_j8ZdXTSF6c9HepiFSbCKtWonh
POSTGRES_DB=digital_nalanda

# ---- Public URL of this staging site (used for client bundle + CSRF/CORS) ----
PUBLIC_BASE_URL=http://157.245.144.61:8080

# ---- Django ----
DJANGO_DEBUG=False
DJANGO_SECURE_SSL=False
DJANGO_SECRET_KEY=XQ9DiYFR9xA-J5KkrWnwZRTnIsaf5Maxh9gSxIlNRHfFPl0sowzKxJx7CMjWAO4UoRIyiYZYC9FW3HXL16iKNQ
DJANGO_ALLOWED_HOSTS=157.245.144.61
CSRF_TRUSTED_ORIGINS=http://157.245.144.61:8080
CORS_ALLOWED_ORIGINS=http://157.245.144.61:8080
FRONTEND_URL=http://157.245.144.61:8080
USE_SPACES=False
EOF
chmod 600 .env.prod
```
> These secret values were generated for you. They live only on the server (the file is gitignored). Rotate them anytime by editing this file and re-running step 6.

## 5. Open port 8080 in the firewall (only if a firewall is active)
```bash
# Host firewall (ufw): only act if it's active
ufw status | grep -q "Status: active" && ufw allow 8080/tcp || echo "ufw inactive — skip"
```
Also: if you have a **DigitalOcean Cloud Firewall** attached to this Droplet (Networking → Firewalls), add an inbound rule **TCP 8080** there too, or the port stays blocked.

## 6. Build & start the stack
```bash
cd /opt/digital-nalanda-lms
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```
First build takes a few minutes (it runs `next build` and `collectstatic`). Migrations run automatically when the `api` container starts.

Check status & logs:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api    # Ctrl+C to stop tailing
```

## 7. Create your admin login
```bash
docker compose -f docker-compose.prod.yml exec api python manage.py createsuperuser
```
(Do **not** run `seed_demo_users` — it's blocked when DEBUG=False, by design.)

Optional sample content:
```bash
docker compose -f docker-compose.prod.yml exec api python manage.py seed_schools
docker compose -f docker-compose.prod.yml exec api python manage.py seed_educators
docker compose -f docker-compose.prod.yml exec api python manage.py seed_study_materials
docker compose -f docker-compose.prod.yml exec api python manage.py seed_ticker
```

## 8. Open it
- Site: **http://157.245.144.61:8080**
- Django admin: **http://157.245.144.61:8080/admin/**
- API check: **http://157.245.144.61:8080/api/courses/**

---

## Smoke test (same as the staging checklist)
- [ ] Homepage loads at `:8080`; nav, ticker, footer render; no console errors.
- [ ] `/api/courses/`, `/api/schools/` return JSON.
- [ ] Register a student → log in → `/dashboard` loads (login works over HTTP because secure-cookies are off for staging).
- [ ] Admin can log in at `/admin/` and open the in-app managers.
- [ ] Public live-session/event JSON has **no** `zoom_join_url`/`zoom_password`.
- [ ] The existing project on ports 80/443 still works (unchanged).

## Everyday operations
```bash
cd /opt/digital-nalanda-lms
# Deploy latest code:
git pull && docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
# Restart:
docker compose -f docker-compose.prod.yml restart
# Stop (frees resources, keeps data):
docker compose -f docker-compose.prod.yml down
# Logs:
docker compose -f docker-compose.prod.yml logs -f web
# DB backup:
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U nalanda digital_nalanda > ~/nalanda_$(date +%F).sql
```

## Resource footprint
Postgres + Django (2 gunicorn workers) + Next.js + proxy ≈ **0.8–1.3 GB RAM** at staging load — comfortable on your 8 GB box next to the existing app.

## Later: real domain + HTTPS (when ready)
Two clean options when you have a subdomain (e.g. `staging.digitalnalanda.com`):
1. **Front it with the host nginx:** add a `server` block to the existing host nginx for the subdomain that `proxy_pass`es to `http://127.0.0.1:8080`, then `certbot --nginx` for free TLS. Then set `DJANGO_SECURE_SSL=True`, update `PUBLIC_BASE_URL`/CSRF/CORS to `https://...`, rebuild.
2. **Move to its own Droplet / App Platform** for production isolation.

---

### Why this layout
- **Port 8080, isolated containers** → zero risk to the existing project on 80/443.
- **Same-origin path routing** in the proxy (`/api`,`/admin`,`/static`,`/media` → Django; rest → Next.js) → no CORS complications.
- **Own Postgres in a Docker volume** → the two apps never share data.
- Generated secrets stay on the server only (`.env.prod`, gitignored, `chmod 600`).
