"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isAdmin } from "@/lib/roles";
import {
  getAdminTicker,
  createTicker,
  updateTicker,
  deleteTicker,
  type AdminTickerItem,
} from "@/lib/tickerAdmin";

const EMPTY: AdminTickerItem = { text: "", link: "", is_active: true, order: 0 };

function Manager() {
  const [list, setList] = useState<AdminTickerItem[]>([]);
  const [form, setForm] = useState<AdminTickerItem>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    getAdminTicker().then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  function startEdit(t: AdminTickerItem) {
    setEditingId(t.id ?? null);
    setForm({ ...EMPTY, ...t });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditingId(null); setForm(EMPTY); }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.text.trim()) { setError("Notice text is required."); return; }
    setBusy(true); setError("");
    try {
      if (editingId) await updateTicker(editingId, form);
      else await createTicker(form);
      reset(); reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function remove(id?: number) {
    if (!id || !confirm("Delete this notice?")) return;
    setBusy(true);
    try { await deleteTicker(id); if (editingId === id) reset(); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  async function toggleActive(t: AdminTickerItem) {
    if (!t.id) return;
    try { await updateTicker(t.id, { is_active: !t.is_active }); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Update failed"); }
  }

  const set = (k: keyof AdminTickerItem, v: unknown) => setForm((s) => ({ ...s, [k]: v }));
  const inputCls = "mt-1 w-full rounded-md border border-nal-border px-3 py-2 text-base outline-none focus:border-nal-saffron";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">Manage Notice Ticker</h1>
      <p className="mt-2 text-nal-slate">
        These scroll in the notice bar below the homepage hero. Active notices appear instantly.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={save} className="mt-8 rounded-2xl border border-nal-border bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-lg font-bold text-nal-navy">
          {editingId ? "Edit notice" : "Add a notice"}
        </h2>

        <label className="mt-4 block text-sm">
          <span className="text-nal-slate">Notice text *</span>
          <input
            value={form.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="e.g. CUET UG 2026 registration is now open…"
            className={inputCls}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_120px]">
          <label className="block text-sm">
            <span className="text-nal-slate">Link (optional)</span>
            <input value={form.link ?? ""} onChange={(e) => set("link", e.target.value)} placeholder="https://…" className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="text-nal-slate">Order</span>
            <input type="number" value={form.order ?? 0} onChange={(e) => set("order", Number(e.target.value))} className={inputCls} />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-nal-navy">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
          Active (visible on the site)
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={busy}
            className="min-h-[44px] rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Update notice" : "Add notice"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="min-h-[44px] rounded-md border border-nal-border px-6 py-2.5 text-sm font-medium hover:bg-nal-parchment">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-nal-navy">All notices ({list.length})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-nal-slate">Loading…</p>
        ) : list.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-nal-border bg-white/50 p-6 text-sm text-nal-slate">
            No notices yet — add your first one above.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-nal-border rounded-2xl border border-nal-border bg-white shadow-soft">
            {list.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-nal-navy">
                    {t.text}{" "}
                    {!t.is_active && <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">inactive</span>}
                  </p>
                  {t.link && <p className="break-all text-xs text-nal-slate">{t.link}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button onClick={() => toggleActive(t)} className="rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment">
                    {t.is_active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => startEdit(t)} className="rounded-md border border-nal-border px-3 py-1.5 text-sm font-medium text-nal-navy hover:bg-nal-parchment">Edit</button>
                  <button onClick={() => remove(t.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageTickerPage() {
  return (
    <RequireRole allow={isAdmin}>
      <Manager />
    </RequireRole>
  );
}
