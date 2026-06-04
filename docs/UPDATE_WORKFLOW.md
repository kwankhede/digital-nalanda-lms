# How to make changes & deploy them (staging on the Droplet)

There are **two places**:
- **Your Mac** — where you (or Claude) edit code and push to GitHub.
- **The Droplet** (`ssh root@157.245.144.61`) — where the live staging app runs.

The golden rule: **edit on Mac → push to GitHub → pull + rebuild on Droplet.**
Never edit code directly on the Droplet (your changes would be wiped on the next `git pull`).

---

## A. The normal change cycle (90% of the time)

### 1) On your Mac — save & upload your change
```bash
cd ~/Desktop/"Digital Nalanda LMS"/"Digital Nalanda LMS"
git add -A
git commit -m "describe what you changed"
git push origin main
```

### 2) On the Droplet — pull & redeploy
```bash
ssh root@157.245.144.61
cd /opt/digital-nalanda-lms
git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```
That's it. It rebuilds only what changed, restarts the containers, and **runs new database migrations automatically**. Your site updates in a couple of minutes.

### 3) Confirm it's healthy
```bash
docker compose -f docker-compose.prod.yml ps
curl -s -o /dev/null -w "API: %{http_code}\nHOME: %{http_code}\n" http://localhost:8080/api/courses/
```
Both should be `200`, all containers `Up`. Then refresh **http://157.245.144.61:8080**.

---

## B. Special cases (still just the cycle above, nothing extra)

- **Frontend change (Next.js):** same cycle. The `--build` rebuilds the web image.
- **Backend code change (Django):** same cycle. `--build` rebuilds the api image.
- **New Python package** (you edited `apps/api/requirements.txt`): same cycle — `--build` reinstalls.
- **New database migration** (you added/changed a model): same cycle — migrations run on container start. No manual `migrate` needed.
- **You only changed env values** (no code): you don't need to push. Edit on the Droplet and restart:
  ```bash
  cd /opt/digital-nalanda-lms
  nano .env.prod          # edit, Ctrl+O Enter to save, Ctrl+X to exit
  cp .env.prod .env
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
  ```

---

## C. Run a one-off command inside the app (admin tasks)
Always prefix with `docker compose -f docker-compose.prod.yml exec api ...`:
```bash
# create another admin
docker compose -f docker-compose.prod.yml exec api python manage.py createsuperuser
# open a Django shell
docker compose -f docker-compose.prod.yml exec api python manage.py shell
# run a migration manually (rarely needed)
docker compose -f docker-compose.prod.yml exec api python manage.py migrate
# seed sample content
docker compose -f docker-compose.prod.yml exec api python manage.py seed_ticker
```

---

## D. Everyday operations

```bash
cd /opt/digital-nalanda-lms

# See status
docker compose -f docker-compose.prod.yml ps

# Watch logs (Ctrl+C to stop watching) — swap api/web/proxy/postgres
docker compose -f docker-compose.prod.yml logs -f api

# Restart everything (no rebuild)
docker compose -f docker-compose.prod.yml restart

# Stop everything (keeps the database)
docker compose -f docker-compose.prod.yml down

# Start again after a stop
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

---

## E. Back up the database (do this before risky changes)
```bash
cd /opt/digital-nalanda-lms
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U nalanda digital_nalanda > ~/nalanda_$(date +%F_%H%M).sql
ls -lh ~/nalanda_*.sql
```
Restore (only if needed):
```bash
cat ~/nalanda_YYYY-MM-DD_HHMM.sql | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U nalanda digital_nalanda
```

---

## F. If a deploy breaks (rollback)
```bash
cd /opt/digital-nalanda-lms
git log --oneline -5            # find the previous good commit hash
git checkout <good_hash>        # go back to it
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
# later, to return to latest:
git checkout main && git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

---

## Cheat sheet (copy/paste the two-step deploy)
**Mac:**
```bash
cd ~/Desktop/"Digital Nalanda LMS"/"Digital Nalanda LMS" && git add -A && git commit -m "update" && git push origin main
```
**Droplet:**
```bash
cd /opt/digital-nalanda-lms && git pull && docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```
