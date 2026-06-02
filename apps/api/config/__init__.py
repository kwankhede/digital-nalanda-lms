# Celery is OPTIONAL for local development. If it (and Redis) aren't installed,
# Django still runs normally — we just skip wiring up the task queue.
try:
    from .celery import app as celery_app  # noqa: F401

    __all__ = ("celery_app",)
except ModuleNotFoundError:
    __all__ = ()
