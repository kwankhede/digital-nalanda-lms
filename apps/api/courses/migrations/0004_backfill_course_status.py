from django.db import migrations
from django.utils import timezone


def set_published_status(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    now = timezone.now()
    # Existing visible courses become "published"; everything else stays draft.
    Course.objects.filter(is_published=True).update(
        status="published", published_at=now
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0003_course_approved_at_course_approved_by_and_more"),
    ]
    operations = [migrations.RunPython(set_published_status, noop)]
