"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCreatorCourse, updateCreatorCourse, submitCreatorCourse, adminCourseAction,
  getCurriculum, addModule, updateModule, deleteModule, duplicateModule,
  addLesson, updateLesson, deleteLesson, duplicateLesson, reorderCurriculum,
  LESSON_TYPES, type CreatorCourse, type Curriculum, type BuilderModule, type BuilderLesson,
} from "@/lib/creator";
import BlockEditor from "@/components/blocks/BlockEditor";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "@/lib/blocks";
import { aiCourseSummary } from "@/lib/assistant";

type Save = "idle" | "saving" | "saved" | "dirty";
const TABS = ["Basic Info", "Curriculum", "Preview", "Submit"] as const;
type Tab = (typeof TABS)[number];

const TYPE_LABEL: Record<string, string> = {
  youtube: "YouTube", video: "Video", text: "Text", pdf: "PDF",
  quiz: "Quiz", assignment: "Assignment", live_class: "Live Class",
};

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export default function CourseBuilder({ courseId, isAdmin = false }: { courseId: number; isAdmin?: boolean }) {
  const [tab, setTab] = useState<Tab>("Basic Info");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [course, setCourse] = useState<CreatorCourse | null>(null);
  const [cur, setCur] = useState<Curriculum | null>(null);
  const [save, setSave] = useState<Save>("idle");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editable = isAdmin || (course ? ["draft", "rejected"].includes(course.status) : false);

  const reload = useCallback(async () => {
    setCur(await getCurriculum(courseId));
  }, [courseId]);

  useEffect(() => {
    getCreatorCourse(courseId).then(setCourse).catch((e) => setErr(e.message));
    reload().catch(() => undefined);
  }, [courseId, reload]);

  // --- Basic info autosave ---
  function editBasic(patch: Partial<CreatorCourse>) {
    setCourse((c) => (c ? { ...c, ...patch } : c));
    setSave("dirty");
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSave("saving");
      try {
        await updateCreatorCourse(courseId, {
          title: (patch.title ?? course?.title) as string,
          short_description: (patch.short_description ?? course?.short_description) as string,
          description: (patch.description ?? course?.description) as string,
        });
        setSave("saved");
      } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); setSave("dirty"); }
    }, 800);
  }

  const [aiBusy, setAiBusy] = useState(false);
  async function generateAI() {
    if (!course) return;
    setAiBusy(true); setErr("");
    try {
      const r = await aiCourseSummary(course.title, course.short_description || course.description);
      const longDesc = [r.long_summary, "", "What you'll learn:", ...(r.learning_outcomes || []).map((o) => `• ${o}`)].join("\n");
      editBasic({ short_description: r.short_summary?.slice(0, 290), description: longDesc });
      setMsg(`AI draft applied (${r.source}). Review and edit before submitting.`);
    } catch (e) { setErr(e instanceof Error ? e.message : "AI failed"); }
    finally { setAiBusy(false); }
  }

  async function persistOrder(modules: BuilderModule[]) {
    setSave("saving");
    try {
      await reorderCurriculum(courseId, modules.map((m) => ({ id: m.id, lessons: m.lessons.map((l) => l.id) })));
      setSave("saved");
    } catch (e) { setErr(e instanceof Error ? e.message : "Reorder failed"); }
  }

  // --- module/lesson ops (optimistic where simple, else reload) ---
  async function onAddModule() {
    await addModule(courseId, "New chapter");
    await reload();
  }
  async function onModuleTitle(m: BuilderModule, title: string) {
    setCur((c) => c && { ...c, modules: c.modules.map((x) => x.id === m.id ? { ...x, title } : x) });
    setSave("saving");
    await updateModule(m.id, { title }); setSave("saved");
  }
  async function onDeleteModule(m: BuilderModule) {
    if (!confirm(`Delete "${m.title}" and its lessons?`)) return;
    await deleteModule(m.id); await reload();
  }
  async function onDupModule(m: BuilderModule) { await duplicateModule(m.id); await reload(); }
  function moveModule(i: number, dir: -1 | 1) {
    if (!cur) return;
    const modules = move(cur.modules, i, dir);
    setCur({ ...cur, modules });
    persistOrder(modules);
  }

  async function onAddLesson(m: BuilderModule) {
    await addLesson(m.id, { title: "New lesson", lesson_type: "youtube" });
    await reload();
  }
  async function onDeleteLesson(l: BuilderLesson) {
    if (!confirm(`Delete lesson "${l.title}"?`)) return;
    await deleteLesson(l.id); await reload();
  }
  async function onDupLesson(l: BuilderLesson) { await duplicateLesson(l.id); await reload(); }
  function moveLesson(mi: number, li: number, dir: -1 | 1) {
    if (!cur) return;
    const modules = cur.modules.map((m, idx) => idx === mi ? { ...m, lessons: move(m.lessons, li, dir) } : m);
    setCur({ ...cur, modules });
    persistOrder(modules);
  }
  function moveLessonToModule(fromMi: number, li: number, toModuleId: number) {
    if (!cur || cur.modules[fromMi].id === toModuleId) return;
    const lesson = cur.modules[fromMi].lessons[li];
    const modules = cur.modules.map((m) => {
      if (m.id === cur.modules[fromMi].id) return { ...m, lessons: m.lessons.filter((_, i) => i !== li) };
      if (m.id === toModuleId) return { ...m, lessons: [...m.lessons, lesson] };
      return m;
    });
    setCur({ ...cur, modules });
    persistOrder(modules);
  }
  async function saveLesson(l: BuilderLesson, patch: Partial<BuilderLesson>) {
    setCur((c) => c && { ...c, modules: c.modules.map((m) => ({ ...m, lessons: m.lessons.map((x) => x.id === l.id ? { ...x, ...patch } : x) })) });
    setSave("saving");
    try { await updateLesson(l.id, patch); setSave("saved"); } catch (e) { setErr(String(e)); }
  }

  async function onSubmit() {
    setErr(""); setMsg("");
    const problems: string[] = [];
    if (!course?.title?.trim()) problems.push("a title");
    if (!course?.description?.trim()) problems.push("a description");
    if (!cur || cur.modules.length === 0) problems.push("at least one chapter");
    if (cur && cur.modules.every((m) => m.lessons.length === 0)) problems.push("at least one lesson");
    if (problems.length) { setErr(`Please add ${problems.join(", ")} before submitting.`); return; }
    try { const c = await submitCreatorCourse(courseId); setCourse(c); setMsg("Submitted for review!"); }
    catch (e) { setErr(e instanceof Error ? e.message : "Submit failed"); }
  }
  async function onPublish() {
    try { const c = await adminCourseAction(courseId, "publish") as CreatorCourse; setCourse(c); setMsg("Published — now public."); }
    catch (e) { setErr(e instanceof Error ? e.message : "Publish failed"); }
  }

  if (err && !course) return <div className="mx-auto max-w-4xl px-4 py-12 text-red-600">{err}</div>;
  if (!course || !cur) return <div className="mx-auto max-w-4xl px-4 py-12 text-gray-500">Loading…</div>;

  const totalLessons = cur.modules.reduce((n, m) => n + m.lessons.length, 0);
  const totalMin = cur.modules.reduce((n, m) => n + m.lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0), 0);
  const counts = cur.modules.flatMap((m) => m.lessons);
  const stat = (t: string) => counts.filter((l) => l.lesson_type === t).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-brand-navy md:text-2xl">Course Builder</h1>
          <p className="text-sm text-gray-500">Status: <span className="font-semibold capitalize">{course.status}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {save === "saving" ? "Saving…" : save === "saved" ? "Saved ✓" : save === "dirty" ? "Unsaved changes" : ""}
          </span>
          <Link
            href={`/creator/courses/${courseId}/versions`}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-gray-50"
          >
            Version history
          </Link>
        </div>
      </div>

      {!editable && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Locked in &quot;{course.status}&quot; status — an admin must reject it back to you to edit.</p>}
      {msg && <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">{msg}</p>}
      {err && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-brand-orange text-brand-navy" : "text-gray-500 hover:text-brand-navy"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {tab === "Basic Info" && (
        <div className="mt-6 space-y-4">
          <label className="block text-xs font-semibold uppercase text-gray-400">Title</label>
          <input disabled={!editable} value={course.title} onChange={(e) => editBasic({ title: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base disabled:bg-gray-50" />
          <label className="block text-xs font-semibold uppercase text-gray-400">Short description</label>
          <input disabled={!editable} value={course.short_description} onChange={(e) => editBasic({ short_description: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base disabled:bg-gray-50" />
          <label className="block text-xs font-semibold uppercase text-gray-400">Full description</label>
          <textarea disabled={!editable} value={course.description} onChange={(e) => editBasic({ description: e.target.value })} rows={6} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base disabled:bg-gray-50" />
          {editable && (
            <button onClick={generateAI} disabled={aiBusy} className="rounded-md border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-blue-50 disabled:opacity-60">
              {aiBusy ? "Generating…" : "✨ Generate description with AI"}
            </button>
          )}
        </div>
      )}

      {/* Curriculum */}
      {tab === "Curriculum" && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[["Chapters", cur.modules.length], ["Lessons", totalLessons], ["Duration", `${totalMin}m`], ["Quizzes", stat("quiz")], ["Live", stat("live_class")], ["Preview", counts.filter((l) => l.is_preview).length]].map(([k, v]) => (
              <div key={k as string} className="rounded-lg border border-gray-100 p-3 text-center">
                <p className="text-lg font-extrabold text-brand-navy">{v as React.ReactNode}</p>
                <p className="text-xs text-gray-400">{k as string}</p>
              </div>
            ))}
          </div>

          {editable && <button onClick={onAddModule} className="mt-5 rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white">+ Add Chapter</button>}

          <div className="mt-4 space-y-3">
            {cur.modules.map((m, mi) => (
              <div key={m.id} className="rounded-xl border border-gray-100">
                <div className="flex flex-col gap-2 border-b border-gray-100 p-3 sm:flex-row sm:items-center">
                  <input disabled={!editable} value={m.title} onChange={(e) => setCur({ ...cur, modules: cur.modules.map((x) => x.id === m.id ? { ...x, title: e.target.value } : x) })} onBlur={(e) => editable && onModuleTitle(m, e.target.value)} className="w-full flex-1 rounded-md border border-transparent px-2 py-1 text-base font-bold text-brand-navy hover:border-gray-200 disabled:bg-transparent sm:w-auto" />
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-xs text-gray-400">{m.lessons.length} lessons</span>
                    {editable && (
                      <div className="flex flex-wrap gap-1 text-gray-400">
                        <button onClick={() => moveModule(mi, -1)} title="Move up" className="tap-target inline-flex items-center justify-center rounded hover:bg-gray-100">↑</button>
                        <button onClick={() => moveModule(mi, 1)} title="Move down" className="tap-target inline-flex items-center justify-center rounded hover:bg-gray-100">↓</button>
                        <button onClick={() => onDupModule(m)} title="Duplicate" className="tap-target inline-flex items-center justify-center rounded hover:bg-gray-100">⧉</button>
                        <button onClick={() => onDeleteModule(m)} title="Delete" className="tap-target inline-flex items-center justify-center rounded text-red-500 hover:bg-red-50">🗑</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {m.lessons.map((l, li) => (
                    <LessonRow key={l.id} l={l} editable={editable} modules={cur.modules}
                      onSave={(patch) => saveLesson(l, patch)}
                      onUp={() => moveLesson(mi, li, -1)} onDown={() => moveLesson(mi, li, 1)}
                      onDup={() => onDupLesson(l)} onDelete={() => onDeleteLesson(l)}
                      onMoveTo={(toId) => moveLessonToModule(mi, li, toId)} />
                  ))}
                </div>
                {editable && <button onClick={() => onAddLesson(m)} className="m-3 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:border-brand-blue hover:text-brand-blue">+ Add Lesson</button>}
              </div>
            ))}
            {cur.modules.length === 0 && <p className="text-sm text-gray-500">No chapters yet. Add your first chapter above.</p>}
          </div>
        </div>
      )}

      {/* Preview */}
      {tab === "Preview" && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(["desktop", "tablet", "mobile"] as const).map((dv) => (
              <button key={dv} onClick={() => setDevice(dv)}
                className={`rounded-md border px-3 py-1.5 text-sm capitalize ${device === dv ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-gray-200 text-gray-500"}`}>
                {dv}
              </button>
            ))}
            <span className="text-xs text-gray-400 sm:ml-auto">Exactly what students see</span>
          </div>
          <div className="mx-auto w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 transition-all sm:p-6"
            style={{ maxWidth: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px" }}>
            <h2 className="break-words text-xl font-extrabold text-brand-navy md:text-2xl">{course.title}</h2>
            <p className="mt-1 break-words text-gray-500">{course.short_description}</p>
            <p className="mt-3 whitespace-pre-line text-gray-700">{course.description}</p>
            <div className="mt-6 space-y-4">
              {cur.modules.map((m) => (
                <div key={m.id} className="rounded-lg border border-gray-100">
                  <p className="border-b border-gray-100 px-4 py-2 font-semibold text-brand-navy">{m.title}</p>
                  <div className="divide-y divide-gray-50">
                    {m.lessons.map((l) => (
                      <div key={l.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-brand-navy">
                          ▶ {l.title} <span className="ml-2 rounded bg-gray-100 px-1.5 text-xs">{TYPE_LABEL[l.lesson_type]}</span>
                          {l.duration_minutes ? <span className="ml-2 text-xs text-gray-400">{l.duration_minutes}m</span> : null}
                        </p>
                        {l.youtube_video_id && (
                          <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg">
                            <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${l.youtube_video_id}`} title={l.title} allowFullScreen />
                          </div>
                        )}
                        {l.blocks && l.blocks.length > 0 && (
                          <div className="mt-3"><BlockRenderer blocks={l.blocks as Block[]} /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      {tab === "Submit" && (
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">Review your course, then submit it for admin review. You can&apos;t publish directly.</p>
          <ul className="text-sm text-gray-500">
            <li>{course.title ? "✓" : "✗"} Title</li>
            <li>{course.description ? "✓" : "✗"} Description</li>
            <li>{cur.modules.length ? "✓" : "✗"} At least one chapter</li>
            <li>{totalLessons ? "✓" : "✗"} At least one lesson</li>
          </ul>
          {editable && <button onClick={onSubmit} className="rounded-md bg-brand-orange px-6 py-2 font-semibold text-white">Submit for Review</button>}
          {isAdmin && <button onClick={onPublish} className="ml-3 rounded-md bg-green-600 px-6 py-2 font-semibold text-white">Publish Course</button>}
        </div>
      )}
    </div>
  );
}

function LessonRow({
  l, editable, modules, onSave, onUp, onDown, onDup, onDelete, onMoveTo,
}: {
  l: BuilderLesson; editable: boolean; modules: BuilderModule[];
  onSave: (p: Partial<BuilderLesson>) => void;
  onUp: () => void; onDown: () => void; onDup: () => void; onDelete: () => void;
  onMoveTo: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 break-words text-left text-sm">
          <span className="text-gray-400">{open ? "▾" : "▸"}</span> {l.title}
          <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-brand-blue">{TYPE_LABEL[l.lesson_type]}</span>
          {l.is_preview && <span className="ml-1 rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-600">Preview</span>}
        </button>
        {editable && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 text-gray-400">
            <button onClick={onUp} title="Up" className="tap-target inline-flex items-center justify-center rounded hover:bg-gray-100">↑</button>
            <button onClick={onDown} title="Down" className="tap-target inline-flex items-center justify-center rounded hover:bg-gray-100">↓</button>
            <button onClick={onDup} title="Duplicate" className="tap-target inline-flex items-center justify-center rounded hover:bg-gray-100">⧉</button>
            <button onClick={onDelete} title="Delete" className="tap-target inline-flex items-center justify-center rounded text-red-500 hover:bg-red-50">🗑</button>
          </div>
        )}
      </div>
      {open && editable && (
        <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 sm:grid-cols-2">
          <input defaultValue={l.title} onBlur={(e) => onSave({ title: e.target.value })} placeholder="Lesson title" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-base" />
          <select defaultValue={l.lesson_type} onChange={(e) => onSave({ lesson_type: e.target.value })} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-base">
            {LESSON_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          <input defaultValue={l.youtube_video_id} onBlur={(e) => onSave({ youtube_video_id: e.target.value })} placeholder="YouTube video ID" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-base" />
          <input defaultValue={l.duration_minutes} onBlur={(e) => onSave({ duration_minutes: Number(e.target.value) || 0 })} placeholder="Duration (min)" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-base" />
          <input defaultValue={l.resource_url} onBlur={(e) => onSave({ resource_url: e.target.value })} placeholder="Resource/PDF URL" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-base sm:col-span-2" />
          <textarea defaultValue={l.content} onBlur={(e) => onSave({ content: e.target.value })} placeholder="Text content / notes" rows={2} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-base sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked={l.is_preview} onChange={(e) => onSave({ is_preview: e.target.checked })} /> Free preview</label>
          <label className="flex items-center gap-2 text-sm">
            Move to:
            <select value="" onChange={(e) => e.target.value && onMoveTo(Number(e.target.value))} className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-base">
              <option value="">(choose chapter)</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </label>
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Lesson content (blocks)</p>
            <BlockEditor blocks={l.blocks || []} onChange={(blocks: Block[]) => onSave({ blocks })} />
          </div>
        </div>
      )}
    </div>
  );
}
