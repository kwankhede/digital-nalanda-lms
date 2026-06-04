"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import { isCreator } from "@/lib/roles";
import {
  getVersions,
  getWorkingDiff,
  compareVersions,
  restoreVersion,
  createCheckpoint,
  diffCounts,
  type CourseVersion,
  type Diff,
  type WorkingDiff,
  type CompareResult,
} from "@/lib/versioning";

function short(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "yes" : "no";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}

function DiffView({ diff }: { diff: Diff }) {
  const c = diffCounts(diff);
  const nothing =
    !c.courseFields && !c.modulesAdded && !c.modulesRemoved && !c.modulesModified && !c.lessons;
  if (nothing) {
    return <p className="text-sm text-gray-500">No differences — content is identical.</p>;
  }
  const courseFields = Object.entries(diff.course || {});
  return (
    <div className="space-y-4 text-sm">
      {courseFields.length > 0 && (
        <div>
          <p className="font-semibold text-brand-navy">Course details</p>
          <ul className="mt-1 space-y-1">
            {courseFields.map(([k, ch]) => (
              <li key={k} className="text-gray-600">
                <span className="font-medium">{k}</span>:{" "}
                <span className="text-red-500 line-through">{short(ch.old)}</span> →{" "}
                <span className="text-green-600">{short(ch.new)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.modules.added.map((m) => (
        <p key={`a${m.id}`} className="text-green-600">
          + Chapter added: <span className="font-medium">{m.title}</span>{" "}
          ({m.lesson_count ?? 0} lessons)
        </p>
      ))}
      {diff.modules.removed.map((m) => (
        <p key={`r${m.id}`} className="text-red-500">
          − Chapter removed: <span className="font-medium line-through">{m.title}</span>
        </p>
      ))}

      {diff.modules.modified.map((m) => (
        <div key={`m${m.id}`} className="rounded-md border border-gray-100 p-3">
          <p className="font-semibold text-brand-navy">Chapter: {m.title}</p>
          {m.fields && Object.keys(m.fields).length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Changed: {Object.keys(m.fields).join(", ")}
            </p>
          )}
          <ul className="mt-1 space-y-1">
            {m.lessons?.added.map((l) => (
              <li key={`la${l.id}`} className="text-green-600">+ Lesson added: {l.title}</li>
            ))}
            {m.lessons?.removed.map((l) => (
              <li key={`lr${l.id}`} className="text-red-500">− Lesson removed: {l.title}</li>
            ))}
            {m.lessons?.modified.map((l) => (
              <li key={`lm${l.id}`} className="text-amber-600">
                ~ Lesson edited: {l.title}{" "}
                <span className="text-xs text-gray-400">({(l.fields ?? []).join(", ")})</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function VersionsInner() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);

  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [working, setWorking] = useState<WorkingDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [cmpA, setCmpA] = useState<number | "">("");
  const [cmpB, setCmpB] = useState<number | "">("");
  const [cmp, setCmp] = useState<CompareResult | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([getVersions(courseId), getWorkingDiff(courseId).catch(() => null)])
      .then(([v, w]) => {
        setVersions(v);
        setWorking(w);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function doRestore(n: number) {
    if (!confirm(`Restore the working draft to version ${n}? Current state is checkpointed first.`)) return;
    setBusy(true);
    setError("");
    try {
      await restoreVersion(courseId, n);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setBusy(false);
    }
  }

  async function doCheckpoint() {
    const label = prompt("Checkpoint label (optional):", "Manual checkpoint");
    if (label === null) return;
    setBusy(true);
    setError("");
    try {
      await createCheckpoint(courseId, { label });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkpoint failed");
    } finally {
      setBusy(false);
    }
  }

  async function doCompare() {
    if (cmpA === "" || cmpB === "") return;
    setError("");
    try {
      setCmp(await compareVersions(courseId, Number(cmpA), Number(cmpB)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compare failed");
    }
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Version history</h1>
          <p className="mt-1 text-sm text-gray-500">
            Every publish is snapshotted. Compare, review changes, or roll back.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/creator/courses/${courseId}/edit`}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Back to editor
          </Link>
          <button
            onClick={doCheckpoint}
            disabled={busy}
            className="rounded-md bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            Save checkpoint
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* --- Unpublished changes (working draft vs published) --- */}
      <section className="mt-8 rounded-lg border border-gray-100 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-navy">Unpublished changes</h2>
        {!working || working.base_version === null ? (
          <p className="mt-2 text-sm text-gray-500">
            This course has never been published yet, so there is nothing to compare against.
          </p>
        ) : working.has_changes ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Working draft vs published version {working.base_version}:
            </p>
            <div className="mt-3">
              <DiffView diff={working.diff} />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-green-600">
            ✓ The working draft matches the published version {working.base_version}.
          </p>
        )}
      </section>

      {/* --- Compare two versions --- */}
      {versions.length >= 2 && (
        <section className="mt-8 rounded-lg border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-brand-navy">Compare versions</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <select
              value={cmpA}
              onChange={(e) => setCmpA(e.target.value === "" ? "" : Number(e.target.value))}
              className="rounded-md border border-gray-200 px-3 py-1.5"
            >
              <option value="">From…</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version_number}>v{v.version_number}</option>
              ))}
            </select>
            <span>→</span>
            <select
              value={cmpB}
              onChange={(e) => setCmpB(e.target.value === "" ? "" : Number(e.target.value))}
              className="rounded-md border border-gray-200 px-3 py-1.5"
            >
              <option value="">To…</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version_number}>v{v.version_number}</option>
              ))}
            </select>
            <button
              onClick={doCompare}
              className="rounded-md bg-brand-navy px-4 py-1.5 font-medium text-white hover:opacity-90"
            >
              Compare
            </button>
          </div>
          {cmp && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600">
                v{cmp.from_version} → v{cmp.to_version}
              </p>
              <div className="mt-2">
                <DiffView diff={cmp.diff} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- Version list --- */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-brand-navy">All versions</h2>
        {versions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No versions saved yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-brand-navy">
                    v{v.version_number}{" "}
                    {v.is_published_snapshot && (
                      <span className="ml-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        published
                      </span>
                    )}{" "}
                    <span className="font-normal text-gray-500">{v.label}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {v.module_count} chapters · {v.lesson_count} lessons · by{" "}
                    {v.created_by_name} · {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => doRestore(v.version_number)}
                  disabled={busy}
                  className="rounded-md border border-brand-blue px-4 py-1.5 text-sm font-medium text-brand-blue hover:bg-blue-50 disabled:opacity-60"
                >
                  Restore this version
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-gray-400">
          Restoring only works while the course is a draft. Surviving lessons keep their
          identity, so student progress is preserved where possible.
        </p>
      </section>
    </div>
  );
}

export default function CourseVersionsPage() {
  return (
    <RequireRole allow={isCreator}>
      <VersionsInner />
    </RequireRole>
  );
}
