"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getMyCounselling, submitCounselling, COUNSELLING_CATEGORIES, type Counselling } from "@/lib/assistant";

export default function CounsellingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Counselling[]>([]);
  const [form, setForm] = useState({ category: "academic", subject: "", message: "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);
  function load() { getMyCounselling().then(setItems).catch(() => setItems([])); }
  useEffect(() => { if (user) load(); }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    if (!form.subject || !form.message) { setErr("Subject and message are required."); return; }
    try { await submitCounselling(form); setForm({ category: "academic", subject: "", message: "" }); setMsg("Request submitted. A mentor will reply soon."); load(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
  }

  if (loading || !user) return <div className="mx-auto max-w-3xl px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-navy">Academic Guidance &amp; Mentorship</h1>
      <p className="mt-1 text-sm text-gray-500">Ask for academic help, career guidance, course selection, or mentorship. (Not medical counselling.)</p>

      {msg && <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">{msg}</p>}
      {err && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-gray-100 p-5 shadow-sm">
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base">
          {COUNSELLING_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base" />
        <textarea placeholder="Describe your question…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base" />
        <button className="tap-target w-full rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white sm:w-auto">Submit Question</button>
      </form>

      <h2 className="mt-10 text-lg font-bold text-brand-navy">My Requests</h2>
      <div className="mt-3 space-y-3">
        {items.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 break-words font-semibold text-brand-navy">{c.subject}</p>
              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{c.status.replace("_", " ")}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{c.message}</p>
            {c.mentor_reply && (
              <div className="mt-3 rounded-md bg-blue-50 p-3 text-sm">
                <p className="font-semibold text-brand-blue">Mentor reply{c.assigned_name ? ` · ${c.assigned_name}` : ""}</p>
                <p className="mt-1 text-gray-700">{c.mentor_reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
