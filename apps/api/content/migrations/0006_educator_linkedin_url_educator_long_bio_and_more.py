from django.db import migrations, models
from django.utils.text import slugify


def cleanup_partial(apps, schema_editor):
    """Remove any leftover educator columns/indexes from a previously failed
    run of this migration (Postgres only). No-op on a clean DB or sqlite."""
    conn = schema_editor.connection
    if conn.vendor != "postgresql":
        return
    cur = conn.cursor()
    for sql in [
        "DROP INDEX IF EXISTS content_educator_slug_aa6d0417_like",
        "DROP INDEX IF EXISTS content_educator_slug_key",
        "ALTER TABLE content_educator DROP COLUMN IF EXISTS slug",
        "ALTER TABLE content_educator DROP COLUMN IF EXISTS title",
        "ALTER TABLE content_educator DROP COLUMN IF EXISTS long_bio",
        "ALTER TABLE content_educator DROP COLUMN IF EXISTS linkedin_url",
        "ALTER TABLE content_educator DROP COLUMN IF EXISTS website_url",
    ]:
        cur.execute(sql)


def backfill_slugs(apps, schema_editor):
    Educator = apps.get_model("content", "Educator")
    used = set()
    for e in Educator.objects.all().order_by("id"):
        base = slugify(e.name) or "mentor"
        slug, i = base, 2
        while slug in used or Educator.objects.exclude(pk=e.pk).filter(slug=slug).exists():
            slug = f"{base}-{i}"; i += 1
        used.add(slug)
        e.slug = slug
        e.save(update_fields=["slug"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0005_educator_bio'),
    ]

    operations = [
        migrations.RunPython(cleanup_partial, noop),
        migrations.AddField(model_name='educator', name='linkedin_url',
                            field=models.URLField(blank=True)),
        migrations.AddField(model_name='educator', name='long_bio',
                            field=models.TextField(blank=True)),
        migrations.AddField(model_name='educator', name='title',
                            field=models.CharField(blank=True, max_length=150)),
        migrations.AddField(model_name='educator', name='website_url',
                            field=models.URLField(blank=True)),
        migrations.AddField(model_name='educator', name='slug',
                            field=models.SlugField(blank=True, default='', max_length=170)),
        migrations.RunPython(backfill_slugs, noop),
        migrations.AlterField(model_name='educator', name='slug',
                              field=models.SlugField(blank=True, max_length=170, unique=True)),
    ]
