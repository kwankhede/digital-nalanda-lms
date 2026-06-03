"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getCounsellingQueue, replyCounselling, type Counselling } from "@/lib/assistant";

const ALLOWED = ["mentor", "admin", "content_manager", "super_admin"];

export default function CounsellingQueuePage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Counselling[]>([]);
  const [reply, setReply] = useState<Record<number, string>>({});
  const allowed = !!user && (user.is_staff || ALLOWED.includes(user.role));

  function load() { getCounsellingQueue().then(setItems).catch(() => setItems([])); }
  useEffect(() => { if (allowed) load(); }, [allowed]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 text-gray-500">Loading…</div>;
  if (user && !allowed) return <div className="mx-auto max-w-4xl px-4 py-16 text-gray-500">No access.</div>;

  async function act(id: number, action: string) {
    await replyCounselling(id, { action, mentor_reply: reply[id] }); load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Counselling Queue</h1>
      <div className="mt-6 space-y-4">
        {items.length === 0 && <p className="text-gray-500">No requests.</p>}
        {items.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-brand-navy">{c.subject} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{c.status.replace("_", " ")}</span></p>
                <p className="text-xs text-gray-400">{c.student_name} · {c.category}{c.assigned_name ? ` · assigned: ${c.assigned_name}` : ""}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{c.message}</p>
            {c.mentor_reply && <p className="mt-2 rounded-md bg-blue-50 p-2 text-sm text-gray-700">{c.mentor_reply}</p>}
            {c.status !== "closed" && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input placeholder="Reply…" value={reply[c.id] ?? ""} onChange={(e) => setReply({ ...reply, [c.id]: e.target.value })} className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm" />
                <button onClick={() => act(c.id, "reply")} className="rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white">Reply</button>
                <button onClick={() => act(c.id, "assign")} className="rounded-md border border-gray-200 px-4 py-1.5 text-sm">Assign to me</button>
                <button onClick={() => act(c.id, "close")} className="rounded-md border border-gray-200 px-4 py-1.5 text-sm">Close</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
