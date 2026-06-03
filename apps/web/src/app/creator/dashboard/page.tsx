"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getCreatorCourses, type CreatorCourse } from "@/lib/creator";

const CREATOR_ROLES = ["course_creator", "admin", "content_manager", "super_admin"];
const GROUPS = ["draft", "submitted", "approved", "published", "rejected", "archived"];

export default function CreatorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<CreatorCourse[]>([]);
  const [err, setErr] = useState("");

  const isCreator = !!user && (user.is_staff || CREATOR_ROLES.includes(user.role));

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (isCreator) getCreatorCourses().then(setCourses).catch((e) => setErr(e.message));
  }, [isCreator]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 text-gray-500">Loading…</div>;

  if (user && !isCreator) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-extrabold text-brand-navy">Creator Dashboard</h1>
        <p className="mt-2 text-gray-500">
          You&apos;re not an approved course creator yet.
        </p>
        <Link href="/become-teacher" className="mt-4 inline-block rounded-md bg-brand-orange px-5 py-2 font-semibold text-white">
          Apply to teach
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-brand-navy">Creator Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/creator/assignments" className="rounded-md border border-gray-200 px-5 py-2 font-semibold text-brand-navy">
            Assignments
          </Link>
          <Link href="/creator/courses/new" className="rounded-md bg-brand-orange px-5 py-2 font-semibold text-white">
            + New Course
          </Link>
        </div>
      </div>
      {err && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      {GROUPS.map((g) => {
        const list = courses.filter((c) => c.status === g);
        if (list.length === 0) return null;
        return (
          <section key={g} className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">{g} ({list.length})</h2>
            <div className="mt-3 space-y-3">
              {list.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-brand-navy">{c.title}</p>
                    {c.status === "rejected" && c.rejected_reason && (
                      <p className="text-xs text-red-500">Reason: {c.rejected_reason}</p>
                    )}
                  </div>
                  <Link href={`/creator/courses/${c.id}/edit`} className="rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white">
                    {["draft", "rejected"].includes(c.status) ? "Edit" : "View"}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {courses.length === 0 && (
        <p className="mt-8 text-gray-500">No courses yet. Create your first course.</p>
      )}
    </div>
  );
}
