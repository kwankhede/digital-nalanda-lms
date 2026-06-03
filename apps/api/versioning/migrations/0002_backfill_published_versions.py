from django.db import migrations

COURSE_FIELDS = [
    "title", "slug", "short_description", "description", "level",
    "language", "thumbnail_url", "is_free", "status",
]
LESSON_FIELDS = [
    "title", "slug", "lesson_type", "youtube_video_id", "content",
    "resource_url", "blocks", "order", "duration_minutes",
    "is_preview", "is_published",
]


def backfill(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    CourseVersion = apps.get_model("versioning", "CourseVersion")

    for course in Course.objects.filter(status="published"):
        if CourseVersion.objects.filter(course=course).exists():
            continue
        modules = []
        for m in course.modules.all().order_by("order", "id"):
            modules.append({
                "id": m.id, "title": m.title, "order": m.order,
                "lessons": [
                    {"id": l.id, **{f: getattr(l, f) for f in LESSON_FIELDS}}
                    for l in m.lessons.all().order_by("order", "id")
                ],
            })
        snapshot = {
            "course": {f: getattr(course, f) for f in COURSE_FIELDS},
            "modules": modules,
        }
        CourseVersion.objects.create(
            course=course, version_number=1,
            label="Initial published version (backfilled)",
            snapshot=snapshot, is_published_snapshot=True,
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("versioning", "0001_initial"),
        ("courses", "0006_lesson_blocks"),
    ]
    operations = [migrations.RunPython(backfill, noop)]
