"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isCreator } from "@/lib/roles";
import {
  getAdminEducators,
  createEducator,
  updateEducator,
  deleteEducator,
  type AdminEducator,
} from "@/lib/educatorsAdmin";

const EMPTY: AdminEducator = {
  name: "", title: "", expertise: "", school: "", bio: "", long_bio: "",
  photo_url: "", linkedin_url: "", website_url: "", is_featured: true, order: 0,
};

const TEXT_FIELDS: { key: keyof AdminEducator; label: string; ph?: string }[] = [
  { key: "name", label: "Full name *" },
  { key: "title", label: "Title", ph: "e.g. Senior Mentor" },
  { key: "expertise", label: "Expertise", ph: "e.g. Constitutional Law" },
  { key: "school", label: "School", ph: "e.g. School of Law" },
  { key: "photo_url", label: "Photo URL" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "website_url", label: "Website URL" },
];

function Manager() {
  const [list, setList] = useState<AdminEducator[]>([]);
  const [form, setForm] = useState<AdminEducator>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    getAdminEducators().then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  function startEdit(e: AdminEducator) {
    setEditingId(e.id ?? null);
    setForm({ ...EMPTY, ...e });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditingId(null); setForm(EMPTY); }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true); setError("");
    try {
      if (editingId) await updateEducator(editingId, form);
      else await createEducator(form);
      reset(); reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function remove(id?: number) {
    if (!id || !confirm("Delete this mentor profile?")) return;
    setBusy(true);
    try { await deleteEducator(id); if (editingId === id) reset(); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  const set = (k: keyof AdminEducator, v: unknown) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-nal-navy">Manage Educators &amp; Mentors</h1>
      <p className="mt-2 text-nal-slate">Add or edit mentor profiles — they appear instantly on the public Educators page.</p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Form */}
      <form onSubmit={save} className="mt-8 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-nal-navy">
            {editingId ? "Edit mentor" : "Add a mentor"}
          </h2>
          {form.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photo_url} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-nal-parchment" />
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <label key={f.key} className="block text-sm">
              <span className="text-nal-slate">{f.label}</span>
              <input
                value={(form[f.key] as string) ?? ""}
                placeholder={f.ph}
                onChange={(e) => set(f.key, e.target.value)}
                className="mt-1 w-full rounded-md border border-nal-border px-3 py-2 outline-none focus:border-nal-saffron"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="text-nal-slate">Order</span>
            <input type="number" value={form.order ?? 0} onChange={(e) => set("order", Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-nal-border px-3 py-2 outline-none focus:border-nal-saffron" />
          </label>
        </div>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Short bio (card)</span>
          <input value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)}
            className="mt-1 w-full rounded-md border border-nal-border px-3 py-2 outline-none focus:border-nal-saffron" />
        </label>
        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Full bio (profile page)</span>
          <textarea rows={4} value={form.long_bio ?? ""} onChange={(e) => set("long_bio", e.target.value)}
            className="mt-1 w-full rounded-md border border-nal-border px-3 py-2 outline-none focus:border-nal-saffron" />
        </label>

        <label className="mt-4 flex items-center gap-2 text-sm text-nal-navy">
          <input type="checkbox" checked={!!form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
          Featured on homepage
        </label>

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={busy}
            className="rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Update mentor" : "Add mentor"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="rounded-md border border-nal-border px-6 py-2.5 text-sm font-medium hover:bg-nal-parchment">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-nal-navy">All mentors ({list.length})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-nal-slate">Loading…</p>
        ) : (
          <div className="mt-4 divide-y divide-nal-border rounded-2xl border border-nal-border bg-white shadow-soft">
            {list.map((e) => (
              <div key={e.id} className="flex items-center gap-4 p-4">
                {e.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.photo_url} alt={e.name} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-nal-parchment" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-nal-navy text-lg font-bold text-white">{e.name.charAt(0)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-nal-navy">
                    {e.name} {e.is_featured && <span className="ml-1 rounded-full bg-nal-saffron/15 px-2 py-0.5 text-xs font-medium text-nal-saffron">featured</span>}
                  </p>
                  <p className="truncate text-xs text-nal-slate">{e.expertise}{e.school ? ` · ${e.school}` : ""}</p>
                </div>
                <button onClick={() => startEdit(e)} className="rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment">Edit</button>
                <button onClick={() => remove(e.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageEducatorsPage() {
  return (
    <RequireRole allow={isCreator}>
      <Manager />
    </RequireRole>
  );
}
