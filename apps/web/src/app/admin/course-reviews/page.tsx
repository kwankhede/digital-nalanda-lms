"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminGetCourseReviews, adminCourseAction, type AdminCourse } from "@/lib/creator";

const ADMIN_ROLES = ["admin", "content_manager", "super_admin"];

export default function AdminCourseReviewsPage() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [reason, setReason] = useState<Record<number, string>>({});
  const isAdmin = !!user && (user.is_staff || ADMIN_ROLES.includes(user.role));

  function load() { adminGetCourseReviews().then(setCourses).catch(() => setCourses([])); }
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-16 text-gray-500">Loading…</div>;
  if (user && !isAdmin) return <div className="mx-auto max-w-5xl px-4 py-16 text-gray-500">No access.</div>;

  async function act(id: number, action: string) {
    await adminCourseAction(id, action, action === "reject" ? { reason: reason[id] ?? "" } : undefined);
    load();
  }

  const ACTIONS: Record<string, string[]> = {
    submitted: ["approve", "reject"],
    approved: ["publish", "reject"],
    published: ["unpublish", "archive"],
    rejected: [],
    draft: [],
    archived: [],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Course Review</h1>
      <div className="mt-6 space-y-4">
        {courses.length === 0 && <p className="text-gray-500">No courses.</p>}
        {courses.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-brand-navy break-words">{c.title} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{c.status}</span></p>
                <p className="text-xs text-gray-400 break-words">{c.creator_email}</p>
              </div>
              <a href={`/courses/${c.slug}`} target="_blank" rel="noopener noreferrer" className="shrink-0 whitespace-nowrap text-sm text-brand-blue hover:underline">Preview ↗</a>
            </div>
            {(ACTIONS[c.status] ?? []).length > 0 && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {ACTIONS[c.status].includes("reject") && (
                  <input placeholder="Reject reason" value={reason[c.id] ?? ""} onChange={(e) => setReason({ ...reason, [c.id]: e.target.value })} className="min-h-[44px] flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-base sm:text-sm" />
                )}
                {ACTIONS[c.status].map((a) => (
                  <button key={a} onClick={() => act(c.id, a)} className="min-h-[44px] whitespace-nowrap rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium capitalize text-white hover:opacity-90">{a}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
