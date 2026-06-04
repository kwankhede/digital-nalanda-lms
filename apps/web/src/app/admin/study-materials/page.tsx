"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isAdmin } from "@/lib/roles";
import {
  getAdminStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  RESOURCE_TYPES,
  type AdminStudyMaterial,
} from "@/lib/studyMaterialsAdmin";

const EMPTY: AdminStudyMaterial = {
  title: "", description: "", category: "", resource_type: "pdf",
  url: "", is_published: true, order: 0,
};

function Manager() {
  const [list, setList] = useState<AdminStudyMaterial[]>([]);
  const [form, setForm] = useState<AdminStudyMaterial>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    getAdminStudyMaterials().then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  function startEdit(m: AdminStudyMaterial) {
    setEditingId(m.id ?? null);
    setForm({ ...EMPTY, ...m });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditingId(null); setForm(EMPTY); }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      setError("Title and link (URL) are required.");
      return;
    }
    setBusy(true); setError("");
    try {
      if (editingId) await updateStudyMaterial(editingId, form);
      else await createStudyMaterial(form);
      reset(); reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function remove(id?: number) {
    if (!id || !confirm("Delete this study material?")) return;
    setBusy(true);
    try { await deleteStudyMaterial(id); if (editingId === id) reset(); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  const set = (k: keyof AdminStudyMaterial, v: unknown) => setForm((s) => ({ ...s, [k]: v }));
  const inputCls = "mt-1 w-full rounded-md border border-nal-border px-3 py-2 text-base outline-none focus:border-nal-saffron";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">Manage Study Materials</h1>
      <p className="mt-2 text-nal-slate">
        Add or edit resources — they appear instantly on the public Study Materials page.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Form */}
      <form onSubmit={save} className="mt-8 rounded-2xl border border-nal-border bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-lg font-bold text-nal-navy">
          {editingId ? "Edit material" : "Add a material"}
        </h2>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Title *</span>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Link / file URL *</span>
          <input
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://… (PDF, Google Drive, YouTube, etc.)"
            className={inputCls}
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Short description</span>
          <input value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls} />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-nal-slate">Category</span>
            <input
              value={form.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Mathematics"
              className={inputCls}
            />
          </label>
          <label className="block text-sm">
            <span className="text-nal-slate">Type</span>
            <select value={form.resource_type ?? "pdf"} onChange={(e) => set("resource_type", e.target.value)} className={inputCls}>
              {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-nal-slate">Order</span>
            <input type="number" value={form.order ?? 0} onChange={(e) => set("order", Number(e.target.value))} className={inputCls} />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-nal-navy">
          <input type="checkbox" checked={!!form.is_published} onChange={(e) => set("is_published", e.target.checked)} />
          Published (visible to learners)
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={busy}
            className="min-h-[44px] rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Update material" : "Add material"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="min-h-[44px] rounded-md border border-nal-border px-6 py-2.5 text-sm font-medium hover:bg-nal-parchment">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-nal-navy">All materials ({list.length})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-nal-slate">Loading…</p>
        ) : list.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-nal-border bg-white/50 p-6 text-sm text-nal-slate">
            No materials yet — add your first one above.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-nal-border rounded-2xl border border-nal-border bg-white shadow-soft">
            {list.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold text-nal-navy">
                    {m.title}{" "}
                    {!m.is_published && <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">draft</span>}
                  </p>
                  <p className="break-words text-xs text-nal-slate">
                    {(m.category || "General")} · {m.resource_type}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => startEdit(m)} className="rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment">Edit</button>
                  <button onClick={() => remove(m.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageStudyMaterialsPage() {
  return (
    <RequireRole allow={isAdmin}>
      <Manager />
    </RequireRole>
  );
}
