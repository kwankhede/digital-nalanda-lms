# Django API image — production-ready (gunicorn + whitenoise static).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static at build time so WhiteNoise can serve hashed/compressed assets.
# DEBUG=True only for this build step so the insecure-key guard doesn't trip
# (collectstatic never touches the database).
RUN DJANGO_DEBUG=True python manage.py collectstatic --noinput

EXPOSE 8080

# Migrate on start (idempotent), then serve with gunicorn on $PORT (default 8080).
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 3 --timeout 60"]
