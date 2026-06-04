"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import {
  getAdminSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  type AdminSchool,
} from "@/lib/schoolsAdmin";

const EMPTY: AdminSchool = {
  name: "", tagline: "", description: "", long_description: "",
  icon: "", image_url: "", hero_image_url: "", order: 0, is_published: true,
};

const allowSchools = (u: { role: string; is_staff?: boolean }) =>
  !!u.is_staff || ["content_manager", "admin", "super_admin"].includes(u.role);

function Manager() {
  const [list, setList] = useState<AdminSchool[]>([]);
  const [form, setForm] = useState<AdminSchool>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    getAdminSchools().then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  function startEdit(s: AdminSchool) {
    setEditingId(s.id ?? null);
    setForm({ ...EMPTY, ...s });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditingId(null); setForm(EMPTY); }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true); setError("");
    try {
      if (editingId) await updateSchool(editingId, form);
      else await createSchool(form);
      reset(); reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function toggleArchive(s: AdminSchool) {
    if (!s.id) return;
    setBusy(true); setError("");
    try { await updateSchool(s.id, { is_published: !s.is_published }); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Update failed"); }
    finally { setBusy(false); }
  }

  async function remove(id?: number) {
    if (!id || !confirm("Delete this school? This cannot be undone.")) return;
    setBusy(true);
    try { await deleteSchool(id); if (editingId === id) reset(); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  const set = (k: keyof AdminSchool, v: unknown) => setForm((s) => ({ ...s, [k]: v }));
  const inputCls = "mt-1 w-full rounded-md border border-nal-border px-3 py-2 text-base outline-none focus:border-nal-saffron";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">Manage Schools</h1>
      <p className="mt-2 text-nal-slate">
        Create, edit and archive schools — they appear instantly across the public site.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Form */}
      <form onSubmit={save} className="mt-8 rounded-2xl border border-nal-border bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-lg font-bold text-nal-navy">
          {editingId ? "Edit school" : "Add a school"}
        </h2>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Name *</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Tagline</span>
          <input value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Short description</span>
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls} />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Long description</span>
          <textarea value={form.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} rows={4} className={inputCls} />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-nal-slate">Icon</span>
            <input value={form.icon ?? ""} onChange={(e) => set("icon", e.target.value)} placeholder="emoji or icon name" className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="text-nal-slate">Order</span>
            <input type="number" value={form.order ?? 0} onChange={(e) => set("order", Number(e.target.value))} className={inputCls} />
          </label>
        </div>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Card image URL</span>
          <input value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" className={inputCls} />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Hero image URL</span>
          <input value={form.hero_image_url ?? ""} onChange={(e) => set("hero_image_url", e.target.value)} placeholder="https://…" className={inputCls} />
        </label>

        <label className="mt-4 flex items-center gap-2 text-sm text-nal-navy">
          <input type="checkbox" checked={!!form.is_published} onChange={(e) => set("is_published", e.target.checked)} />
          Published (visible on the public site)
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={busy}
            className="min-h-[44px] rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Update school" : "Add school"}
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
        <h2 className="font-display text-lg font-bold text-nal-navy">All schools ({list.length})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-nal-slate">Loading…</p>
        ) : list.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-nal-border bg-white/50 p-6 text-sm text-nal-slate">
            No schools yet — add your first one above.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-nal-border bg-nal-parchment/50 text-nal-slate">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Tagline</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nal-border">
                  {list.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-semibold text-nal-navy">
                        {s.icon && <span className="mr-2">{s.icon}</span>}{s.name}
                      </td>
                      <td className="px-4 py-3 text-nal-slate">{s.tagline || "—"}</td>
                      <td className="px-4 py-3">
                        {s.is_published ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Published</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Archived</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(s)} className="min-h-[44px] rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment">Edit</button>
                          <button onClick={() => toggleArchive(s)} disabled={busy} className="min-h-[44px] rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment disabled:opacity-60">
                            {s.is_published ? "Archive" : "Unarchive"}
                          </button>
                          <button onClick={() => remove(s.id)} className="min-h-[44px] rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mt-4 space-y-3 md:hidden">
              {list.map((s) => (
                <div key={s.id} className="rounded-2xl border border-nal-border bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-nal-navy">
                        {s.icon && <span className="mr-2">{s.icon}</span>}{s.name}
                      </p>
                      {s.tagline && <p className="mt-0.5 break-words text-xs text-nal-slate">{s.tagline}</p>}
                    </div>
                    {s.is_published ? (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Published</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Archived</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => startEdit(s)} className="min-h-[44px] flex-1 rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment">Edit</button>
                    <button onClick={() => toggleArchive(s)} disabled={busy} className="min-h-[44px] flex-1 rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment disabled:opacity-60">
                      {s.is_published ? "Archive" : "Unarchive"}
                    </button>
                    <button onClick={() => remove(s.id)} className="min-h-[44px] flex-1 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ManageSchoolsPage() {
  return (
    <RequireRole allow={allowSchools}>
      <Manager />
    </RequireRole>
  );
}
