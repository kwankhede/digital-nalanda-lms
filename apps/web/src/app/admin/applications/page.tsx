"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminGetApplications, adminApproveApplication, adminRejectApplication, type AdminApplication } from "@/lib/creator";

const ADMIN_ROLES = ["admin", "content_manager", "super_admin"];

export default function AdminApplicationsPage() {
  const { user, loading } = useAuth();
  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const isAdmin = !!user && (user.is_staff || ADMIN_ROLES.includes(user.role));

  function load() { adminGetApplications().then(setApps).catch(() => setApps([])); }
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-16 text-gray-500">Loading…</div>;
  if (user && !isAdmin) return <div className="mx-auto max-w-5xl px-4 py-16 text-gray-500">No access.</div>;

  async function act(id: number, approve: boolean) {
    const n = notes[id] ?? "";
    if (approve) await adminApproveApplication(id, n);
    else await adminRejectApplication(id, n);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Creator Applications</h1>
      <div className="mt-6 space-y-4">
        {apps.length === 0 && <p className="text-gray-500">No applications.</p>}
        {apps.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-brand-navy">{a.full_name} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{a.status}</span></p>
                <p className="text-xs text-gray-400">{a.email} · {a.expertise_area}</p>
              </div>
            </div>
            {a.bio && <p className="mt-2 text-sm text-gray-600">{a.bio}</p>}
            {a.status === "pending" && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input placeholder="Admin notes" value={notes[a.id!] ?? ""} onChange={(e) => setNotes({ ...notes, [a.id!]: e.target.value })} className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm" />
                <button onClick={() => act(a.id!, true)} className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white">Approve</button>
                <button onClick={() => act(a.id!, false)} className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
