"""
Snapshot / diff / restore logic for course versioning.

The live Course/Module/Lesson models are the working draft. We freeze copies
into CourseVersion.snapshot and can diff or restore them.
"""
from courses.models import Course, Lesson, Module

# Course-level fields tracked in a snapshot (and diffed).
COURSE_FIELDS = [
    "title", "slug", "short_description", "description", "level",
    "language", "thumbnail_url", "is_free", "status",
]
LESSON_FIELDS = [
    "title", "slug", "lesson_type", "youtube_video_id", "content",
    "resource_url", "blocks", "order", "duration_minutes",
    "is_preview", "is_published",
]


def build_snapshot(course):
    """Serialize a course + its full curriculum tree into a plain dict."""
    modules = []
    for m in course.modules.prefetch_related("lessons").all():
        modules.append({
            "id": m.id,
            "title": m.title,
            "order": m.order,
            "lessons": [
                {"id": l.id, **{f: getattr(l, f) for f in LESSON_FIELDS}}
                for l in m.lessons.all()
            ],
        })
    return {
        "course": {f: getattr(course, f) for f in COURSE_FIELDS},
        "modules": modules,
    }


def next_version_number(course):
    last = course.versions.order_by("-version_number").first()
    return (last.version_number + 1) if last else 1


def create_version(course, user=None, label="", change_summary="", published=False):
    """Freeze the current working draft as a new CourseVersion."""
    from .models import CourseVersion

    return CourseVersion.objects.create(
        course=course,
        version_number=next_version_number(course),
        label=label,
        change_summary=change_summary,
        snapshot=build_snapshot(course),
        is_published_snapshot=published,
        created_by=user if (user and getattr(user, "is_authenticated", False)) else None,
    )


def latest_published(course):
    from .models import CourseVersion

    return (
        CourseVersion.objects.filter(course=course, is_published_snapshot=True)
        .order_by("-version_number")
        .first()
    )


# ----------------------------- Diffing -----------------------------

def _diff_fields(old, new, fields):
    out = {}
    for f in fields:
        ov, nv = old.get(f), new.get(f)
        if ov != nv:
            out[f] = {"old": ov, "new": nv}
    return out


def _index(items):
    return {it["id"]: it for it in items}


def diff_snapshots(old, new):
    """
    Structured diff between two snapshots (old -> new).

    Returns {course: {...}, modules: {added, removed, modified}}.
    Modules/lessons are matched by id; added/removed cover create/delete.
    """
    result = {"course": {}, "modules": {"added": [], "removed": [], "modified": []}}

    old = old or {"course": {}, "modules": []}
    new = new or {"course": {}, "modules": []}

    result["course"] = _diff_fields(old.get("course", {}), new.get("course", {}), COURSE_FIELDS)

    old_m = _index(old.get("modules", []))
    new_m = _index(new.get("modules", []))

    for mid, m in new_m.items():
        if mid not in old_m:
            result["modules"]["added"].append({
                "id": mid, "title": m["title"],
                "lesson_count": len(m.get("lessons", [])),
            })
    for mid, m in old_m.items():
        if mid not in new_m:
            result["modules"]["removed"].append({
                "id": mid, "title": m["title"],
                "lesson_count": len(m.get("lessons", [])),
            })

    for mid, nm in new_m.items():
        om = old_m.get(mid)
        if not om:
            continue
        mod_changes = _diff_fields(om, nm, ["title", "order"])
        ol = _index(om.get("lessons", []))
        nl = _index(nm.get("lessons", []))
        lessons = {"added": [], "removed": [], "modified": []}
        for lid, l in nl.items():
            if lid not in ol:
                lessons["added"].append({"id": lid, "title": l["title"]})
        for lid, l in ol.items():
            if lid not in nl:
                lessons["removed"].append({"id": lid, "title": l["title"]})
        for lid, nlsn in nl.items():
            olsn = ol.get(lid)
            if not olsn:
                continue
            fld = _diff_fields(olsn, nlsn, LESSON_FIELDS)
            if fld:
                lessons["modified"].append({
                    "id": lid, "title": nlsn["title"],
                    "fields": sorted(fld.keys()),
                })
        if mod_changes or lessons["added"] or lessons["removed"] or lessons["modified"]:
            result["modules"]["modified"].append({
                "id": mid, "title": nm["title"],
                "fields": mod_changes, "lessons": lessons,
            })
    return result


def has_changes(diff):
    m = diff.get("modules", {})
    return bool(
        diff.get("course")
        or m.get("added") or m.get("removed") or m.get("modified")
    )


def diff_working_vs_published(course):
    """Diff the current working draft against the latest published snapshot."""
    pub = latest_published(course)
    base = pub.snapshot if pub else None
    return {
        "base_version": pub.version_number if pub else None,
        "base_is_published": True,
        "diff": diff_snapshots(base, build_snapshot(course)),
    }


# ----------------------------- Restore -----------------------------

def restore_version(course, version, user=None):
    """
    Roll the working draft back to a snapshot.

    Reconciles by id so surviving lessons keep their primary key (and therefore
    student progress): existing rows are updated in place, snapshot rows that
    were deleted are recreated, and live rows missing from the snapshot are
    removed. A fresh checkpoint of the pre-restore state is saved first so the
    rollback itself is reversible.
    """
    snap = version.snapshot or {"course": {}, "modules": []}

    # Safety checkpoint of the current state before we overwrite it.
    create_version(
        course, user=user,
        label=f"Auto-checkpoint before restore of v{version.version_number}",
    )

    # 1) Course-level fields (slug/status left to governance; restore content).
    cdata = snap.get("course", {})
    restorable = ["title", "short_description", "description", "level",
                  "language", "thumbnail_url", "is_free"]
    for f in restorable:
        if f in cdata:
            setattr(course, f, cdata[f])
    course.save(update_fields=[f for f in restorable if f in cdata])

    snap_modules = snap.get("modules", [])
    snap_mod_ids = {m["id"] for m in snap_modules}

    # 2) Remove live modules not present in the snapshot.
    course.modules.exclude(id__in=snap_mod_ids).delete()

    live_modules = {m.id: m for m in course.modules.all()}

    for m_index, m in enumerate(snap_modules):
        mid = m["id"]
        live = live_modules.get(mid)
        if live:
            live.title = m["title"]
            live.order = m_index
            live.save(update_fields=["title", "order"])
        else:
            live = Module.objects.create(course=course, title=m["title"], order=m_index)

        snap_lessons = m.get("lessons", [])
        snap_lesson_ids = {l["id"] for l in snap_lessons}
        live.lessons.exclude(id__in=snap_lesson_ids).delete()
        existing = {l.id: l for l in live.lessons.all()}

        for l_index, l in enumerate(snap_lessons):
            fields = {f: l.get(f) for f in LESSON_FIELDS}
            fields["order"] = l_index
            cur = existing.get(l["id"])
            if cur:
                for f, v in fields.items():
                    setattr(cur, f, v)
                cur.module = live
                cur.save()
            else:
                Lesson.objects.create(module=live, **fields)

    return course
