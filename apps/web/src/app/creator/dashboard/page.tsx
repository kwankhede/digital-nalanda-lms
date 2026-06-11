"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isCreator } from "@/lib/roles";
import { useAuth } from "@/lib/auth";
import { configForRole } from "@/lib/dashboards";
import { getDashboardSummary, type DashboardSummary } from "@/lib/dashboard";
import {
  getCreatorCourses,
  getCreatorCourseStats,
  type CreatorCourse,
  type CreatorCourseStats,
} from "@/lib/creator";

// --- helpers -------------------------------------------------------------

function timeAgo(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// Course pipeline groups, in display order.
const PIPELINE: { status: string; label: string }[] = [
  { status: "draft", label: "Drafts" },
  { status: "submitted", label: "Under Review" },
  { status: "approved", label: "Approved" },
  { status: "published", label: "Published" },
  { status: "rejected", label: "Needs Changes" },
];

const STATUS_CHIP: Record<string, string> = {
  draft: "bg-nal-parchment text-nal-slate border border-nal-border",
  submitted: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  published: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Under review",
  approved: "Approved",
  published: "Published",
  rejected: "Needs changes",
};

// Metric cards shown on this dashboard (keys map to summary.metrics).
const METRICS: { key: string; label: string }[] = [
  { key: "draft", label: "Drafts" },
  { key: "submitted", label: "Under Review" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "students", label: "Your Students" },
];

// Secondary quick actions. (No standalone live-session creator UI — link to /events.)
const SECONDARY_ACTIONS = [
  { label: "Assignments", href: "/creator/assignments" },
  { label: "AI Assistant", href: "/chatbot" },
  { label: "Mentor profile", href: "/creator/educators" },
];

// --- small presentational pieces ----------------------------------------

function StatusChip({ status }: { status: string }) {
  const cls = STATUS_CHIP[status] ?? "bg-nal-parchment text-nal-slate border border-nal-border";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function CourseRow({ c }: { c: CreatorCourse }) {
  const editable = c.status === "draft" || c.status === "rejected";
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-semibold text-nal-navy">{c.title}</p>
          <StatusChip status={c.status} />
        </div>
        {c.status === "rejected" && c.rejected_reason && (
          <p className="mt-1 break-words text-xs text-red-600">
            Reviewer feedback: {c.rejected_reason}
          </p>
        )}
      </div>
      <Link
        href={`/creator/courses/${c.id}/edit`}
        className="flex min-h-[44px] shrink-0 items-center rounded-lg border border-nal-border bg-white px-5 py-2 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment"
      >
        {editable ? "Edit" : "View"}
      </Link>
    </div>
  );
}

// --- main ----------------------------------------------------------------

function CreatorDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courses, setCourses] = useState<CreatorCourse[]>([]);
  const [stats, setStats] = useState<CreatorCourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // Both calls are independent and individually resilient.
      const [s, c, st] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getCreatorCourses().catch(() => [] as CreatorCourse[]),
        getCreatorCourseStats().catch(() => ({ courses: [] as CreatorCourseStats[] })),
      ]);
      if (!active) return;
      setSummary(s);
      setCourses(c);
      setStats(st.courses);
      setLoading(false);
      setCoursesLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;
  const cfg = configForRole("course_creator");
  const firstName = (user.full_name || user.email || "there").split(" ")[0];

  // Resilient metrics: prefer the summary, else compute counts from courses.
  const fallbackCounts = courses.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});
  const metrics = summary?.metrics ?? fallbackCounts;
  const metricsLoading = loading && coursesLoading;

  const pending = (summary?.pending ?? []).filter((p) => p.count > 0);
  const recent = summary?.recent ?? [];

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* 1. Welcome */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">
            Welcome, {firstName}
          </h1>
          <span className="rounded-full bg-nal-navy px-3 py-1 text-xs font-semibold text-white">
            Course Creator
          </span>
        </div>
        <p className="mt-1 text-nal-slate">{cfg.intro}</p>

        {/* 2. Primary CTA + quick actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/creator/courses/new"
            className="flex min-h-[44px] items-center rounded-lg bg-nal-saffron px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            + Create New Course
          </Link>
          {SECONDARY_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex min-h-[44px] items-center rounded-lg border border-nal-border bg-white px-5 py-2.5 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment"
            >
              {a.label}
            </Link>
          ))}
        </div>

        {/* 3. Metrics row */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {METRICS.map((m) => (
            <div
              key={m.key}
              className="rounded-2xl border border-nal-border bg-white p-5 shadow-soft"
            >
              <p className="font-display text-3xl font-extrabold text-nal-navy">
                {metricsLoading ? "—" : metrics[m.key] ?? 0}
              </p>
              <p className="mt-1 text-sm text-nal-slate">{m.label}</p>
            </div>
          ))}
        </div>

        {/* 4. Pending actions */}
        <section className="mt-8 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-nal-navy">
            Needs your attention
          </h2>
          {loading ? (
            <p className="mt-4 text-sm text-nal-slate">Loading…</p>
          ) : pending.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-nal-border bg-nal-parchment/40 p-6 text-center text-sm text-nal-slate">
              🎉 You&apos;re all caught up — nothing needs attention right now.
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {pending.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="group flex min-h-[44px] items-center justify-between rounded-xl border border-nal-border p-4 transition hover:border-nal-saffron/50 hover:bg-nal-parchment/40"
                  >
                    <span className="font-medium text-nal-navy">{p.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-nal-saffron px-2.5 py-0.5 text-sm font-bold text-white">
                        {p.count}
                      </span>
                      <span className="text-nal-saffron transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>


        {/* 5b. Course performance (analytics v1) */}
        {stats.some((s) => s.enrollments > 0) && (
          <section className="mt-8 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-nal-navy">Course performance</h2>
            <p className="mt-1 text-sm text-nal-slate">
              How learners are doing in your published courses.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-nal-border text-left text-xs uppercase tracking-wide text-nal-slate">
                    <th className="py-2 pr-3">Course</th>
                    <th className="py-2 pr-3">Enrolled</th>
                    <th className="py-2 pr-3">Completed</th>
                    <th className="py-2 pr-3">Completion</th>
                    <th className="py-2 pr-3">Avg progress</th>
                    <th className="py-2">Active (7d)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.id} className="border-b border-nal-border/60 last:border-0">
                      <td className="max-w-[220px] truncate py-2.5 pr-3 font-medium text-nal-navy">{s.title}</td>
                      <td className="py-2.5 pr-3">{s.enrollments}</td>
                      <td className="py-2.5 pr-3">{s.completed}</td>
                      <td className="py-2.5 pr-3">{s.completion_rate}%</td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-nal-parchment">
                            <span
                              className="block h-full rounded-full bg-nal-saffron"
                              style={{ width: `${Math.min(100, s.avg_progress)}%` }}
                            />
                          </span>
                          {s.avg_progress}%
                        </span>
                      </td>
                      <td className="py-2.5">{s.active_last_7_days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 5. Course pipeline */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-nal-navy">
              Your course pipeline
            </h2>
            <Link
              href="/creator/courses"
              className="text-sm font-semibold text-nal-saffron hover:underline"
            >
              View all courses →
            </Link>
          </div>

          {coursesLoading ? (
            <p className="mt-4 text-sm text-nal-slate">Loading your courses…</p>
          ) : courses.length === 0 ? (
            // Onboarding empty state
            <div className="mt-4 rounded-2xl border border-dashed border-nal-border bg-white p-10 text-center shadow-soft">
              <h3 className="font-display text-lg font-bold text-nal-navy">
                No courses yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-nal-slate">
                Create your first course and start building content.
              </p>
              <Link
                href="/creator/courses/new"
                className="mt-5 inline-flex min-h-[44px] items-center rounded-lg bg-nal-saffron px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                + Create Course
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {PIPELINE.map((g) => {
                const list = courses.filter((c) => c.status === g.status);
                if (list.length === 0) return null;
                return (
                  <div key={g.status}>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-nal-slate">
                      {g.label} ({list.length})
                    </h3>
                    <div className="mt-2 divide-y divide-nal-border rounded-2xl border border-nal-border bg-white shadow-soft">
                      {list.map((c) => (
                        <CourseRow key={c.id} c={c} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6 + 7. Recent activity / Responsibilities + Shortcuts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent activity */}
          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-nal-navy">
              Recent activity
            </h2>
            {loading ? (
              <p className="mt-4 text-sm text-nal-slate">Loading…</p>
            ) : recent.length === 0 ? (
              <p className="mt-4 text-sm text-nal-slate">No recent activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recent.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-3 border-b border-nal-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-nal-navy">{r.text}</span>
                    <span className="shrink-0 text-xs text-nal-slate">
                      {timeAgo(r.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Responsibilities + Helpful shortcuts */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold text-nal-navy">
                You&apos;re responsible for
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-nal-slate">
                {cfg.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-nal-saffron" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold text-nal-navy">
                Helpful shortcuts
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {cfg.shortcuts.map((s) =>
                  s.external ? (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-nal-saffron hover:underline"
                      >
                        {s.label} ↗
                      </a>
                    </li>
                  ) : (
                    <li key={s.label}>
                      <Link href={s.href} className="text-nal-saffron hover:underline">
                        {s.label} →
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  return (
    <RequireRole allow={isCreator}>
      <CreatorDashboard />
    </RequireRole>
  );
}
