"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getAdminStats, downloadNewsletterCsv, type AdminStats } from "@/lib/admin";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ADMIN_ROLES = ["admin", "content_manager"];

// Entity modules: managed via Django admin (the management backend).
const MODULES = [
  { label: "Schools", path: "content/school/" },
  { label: "Learning Paths", path: "content/learningpath/" },
  { label: "Educators", path: "content/educator/" },
  { label: "Community Libraries", path: "content/communitylibrary/" },
  { label: "Impact Metrics", path: "content/impactmetric/" },
  { label: "Stories", path: "content/story/" },
  { label: "Courses", path: "courses/course/" },
  { label: "Live Sessions", path: "live_sessions/livesession/" },
  { label: "Events", path: "live_sessions/event/" },
  { label: "Newsletter Subscribers", path: "content/newslettersubscriber/" },
];

const METRIC_CARDS: { key: string; label: string }[] = [
  { key: "students", label: "Students" },
  { key: "enrollments", label: "Enrollments" },
  { key: "completed_enrollments", label: "Course Completions" },
  { key: "certificates", label: "Certificates Issued" },
  { key: "live_attendance", label: "Live Class Attendance" },
  { key: "newsletter_subscribers", label: "Newsletter Subscribers" },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  const isAdmin = !!user && (user.is_staff || ADMIN_ROLES.includes(user.role));

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    getAdminStats().then(setStats).catch((e) => setError(e.message));
  }, [isAdmin]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-gray-500">Loading…</div>;
  }
  if (user && !isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-2xl font-extrabold text-brand-navy">Admin</h1>
        <p className="mt-2 text-gray-500">You don&apos;t have access to this area.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Admin Dashboard</h1>
      <p className="mt-1 text-gray-500">Operations overview for Digital Nalanda.</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {METRIC_CARDS.map((m) => (
          <div key={m.key} className="rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-3xl font-extrabold text-brand-blue">
              {stats ? (stats.totals[m.key] ?? 0) : "—"}
            </p>
            <p className="mt-1 text-sm text-gray-500">{m.label}</p>
          </div>
        ))}
      </div>

      {stats && (
        <div className="mt-4 rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Course completion rate:{" "}
            <span className="font-bold text-brand-navy">{stats.completion_rate}%</span>
          </p>
        </div>
      )}

      {/* Growth */}
      {stats && (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <GrowthCard title="Student Growth" data={stats.student_growth} />
          <GrowthCard title="Enrollment Growth" data={stats.enrollment_growth} />
          <GrowthCard title="Newsletter Growth" data={stats.newsletter_growth} />
        </div>
      )}

      {/* Newsletter export */}
      <div className="mt-8">
        <button
          onClick={() => downloadNewsletterCsv()}
          className="min-h-[44px] w-full rounded-md bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
        >
          Export Newsletter Subscribers (CSV)
        </button>
      </div>

      {/* Governance: applications + course review */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-brand-navy">Governance</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a href="/admin/applications" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-brand-navy shadow-sm hover:bg-gray-50">
            Creator Applications <span className="text-gray-400">→</span>
          </a>
          <a href="/admin/course-reviews" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-brand-navy shadow-sm hover:bg-gray-50">
            Course Review <span className="text-gray-400">→</span>
          </a>
          <a href="/admin/courses/new" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-brand-navy shadow-sm hover:bg-gray-50">
            + New Course <span className="text-gray-400">→</span>
          </a>
          <a href="/admin/counselling" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-brand-navy shadow-sm hover:bg-gray-50">
            Counselling Queue <span className="text-gray-400">→</span>
          </a>
        </div>
      </section>

      {/* Management modules → Django admin */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-brand-navy">Manage Content</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create, edit, search, and filter records in Django Admin.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <a
              key={m.label}
              href={`${API_URL}/admin/${m.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-brand-navy shadow-sm hover:bg-gray-50"
            >
              {m.label}
              <span className="text-gray-400">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function GrowthCard({ title, data }: { title: string; data: { month: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm font-bold text-brand-navy">{title}</p>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="mt-4 flex h-28 items-end gap-2">
          {data.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-brand-blue"
                style={{ height: `${(d.count / max) * 100}%`, minHeight: "4px" }}
                title={`${d.month}: ${d.count}`}
              />
              <span className="text-[10px] text-gray-400">{d.month.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
