"""
Django settings for Digital Nalanda LMS.

Configuration is driven by environment variables (see .env.example) so the same
codebase runs unchanged across local, staging, and production.
"""
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)
# Load .env if present (local dev). In Docker/prod, real env vars take over.
environ.Env.read_env(BASE_DIR / ".env")

_INSECURE_KEY = "dev-insecure-change-me"
SECRET_KEY = env("DJANGO_SECRET_KEY", default=_INSECURE_KEY)
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# Refuse to boot in production with the insecure default key.
if not DEBUG and SECRET_KEY == _INSECURE_KEY:
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set to a strong, unique value when DEBUG=False."
    )

# Trusted origins for CSRF (the deployed frontend/site URLs, comma-separated).
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# --- Applications ---
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
]

LOCAL_APPS = [
    "core",
    "users",
    "courses",
    "enrollments",
    "progress",
    "certificates",
    "live_sessions",
    "content",
    "migration_tools",
    "adminpanel",
    "creators",
    "assistant",
    "notifications",
    "announcements",
    "assignments",
    "versioning",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# --- Database (PostgreSQL via DATABASE_URL) ---
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgres://postgres:postgres@localhost:5432/digital_nalanda",
    )
}

# --- Custom user model (set early — hard to change later) ---
AUTH_USER_MODEL = "users.User"

AUTHENTICATION_BACKENDS = [
    "users.backends.EmailBackend",
    "django.contrib.auth.backends.ModelBackend",
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Internationalization ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# --- Static / Media ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = env("MEDIA_ROOT", default=str(BASE_DIR / "mediafiles"))

# --- File storage (Django 5 STORAGES API) ---
# Static files are served compressed + hashed by WhiteNoise in production.
# Media default is local disk; switched to DigitalOcean Spaces when USE_SPACES=True.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# --- DigitalOcean Spaces (S3-compatible) for durable media/certificates ---
# Local disk is ephemeral on DO; set USE_SPACES=True in production so issued
# certificate PDFs and uploads survive redeploys. Uses the same default_storage
# the certificates app already writes through — no app code changes needed.
USE_SPACES = env.bool("USE_SPACES", default=False)
if USE_SPACES:
    AWS_ACCESS_KEY_ID = env("SPACES_KEY")
    AWS_SECRET_ACCESS_KEY = env("SPACES_SECRET")
    AWS_STORAGE_BUCKET_NAME = env("SPACES_BUCKET")
    AWS_S3_ENDPOINT_URL = env("SPACES_ENDPOINT")  # e.g. https://blr1.digitaloceanspaces.com
    AWS_S3_REGION_NAME = env("SPACES_REGION", default="")
    AWS_DEFAULT_ACL = "public-read"          # certificates are shareable/verifiable
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_FILE_OVERWRITE = False
    STORAGES["default"] = {"BACKEND": "storages.backends.s3.S3Storage"}
    MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"

# --- Production security hardening (active only when DEBUG=False) ---
if not DEBUG:
    # We sit behind Nginx/DO load balancer terminating TLS.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    X_FRAME_OPTIONS = "DENY"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Django REST Framework ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",
        "user": "240/min",
        "login": "10/min",
        "register": "5/min",
        "ai": "10/min",
        "chat": "30/min",
    },
}

# --- Cache (LocMem by default; set REDIS_URL + django-redis for multi-worker) ---
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "digital-nalanda",
    }
}

# --- CORS ---
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"]
)
# In local dev the Next.js server may run on any port (3000/3001/3002…), so
# allow any localhost/127.0.0.1 origin. Production stays restricted to the
# explicit CORS_ALLOWED_ORIGINS above.
if DEBUG:
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^http://localhost:\d+$",
        r"^http://127\.0\.0\.1:\d+$",
    ]


# Public site URL — used to build certificate verification links / QR codes.
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# Google Gemini (optional) — AI assistant falls back to templates if unset.
GEMINI_API_KEY = env("GEMINI_API_KEY", default="")

# --- Celery ---
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_TASK_TRACK_STARTED = True
CELERY_TIMEZONE = TIME_ZONE


# --- JWT (djangorestframework-simplejwt) ---
from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
