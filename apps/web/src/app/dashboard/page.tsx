"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, type Profile } from "@/lib/auth";
import LiveClasses from "@/components/LiveClasses";
import Assignments from "@/components/Assignments";
import {
  getMyCourses,
  getMyCertificates,
  downloadCertificate,
  type Enrollment,
  type Certificate,
} from "@/lib/student";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/lib/dashboard";
import {
  getHomeUpcoming,
  getFeaturedCourses,
  type HomeUpcomingItem,
  type CourseListItem,
} from "@/lib/api";
import { getMyCounselling, type Counselling } from "@/lib/assistant";

// Editable profile fields (email/role are read-only on the backend).
const FIELDS: { key: keyof Profile; label: string; type?: string }[] = [
  { key: "full_name", label: "Full name" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "date_of_birth", label: "Date of birth", type: "date" },
  { key: "city", label: "City" },
  { key: "district", label: "District" },
  { key: "state", label: "State" },
  { key: "education_level", label: "Education level" },
  { key: "profession", label: "Profession" },
  { key: "category", label: "Category" },
  { key: "preferred_language", label: "Preferred language" },
];

function firstNameOf(p: Profile): string {
  const name = (p.full_name || "").trim();
  if (name) return name.split(/\s+/)[0];
  return p.email.split("@")[0];
}

function fmtWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcoming, setUpcoming] = useState<HomeUpcomingItem[]>([]);
  const [recommended, setRecommended] = useState<CourseListItem[]>([]);
  const [counselling, setCounselling] = useState<Counselling[]>([]);

  // --- Auth guard: redirect to login once we know there's no user. ---
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Load dashboard data. Every call is guarded so the page never crashes.
  useEffect(() => {
    if (!user) return;
    getMyCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
    getMyCertificates()
      .then(setCerts)
      .catch(() => setCerts([]));
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
    getHomeUpcoming({ limit: 4 })
      .then(setUpcoming)
      .catch(() => setUpcoming([]));
    getFeaturedCourses()
      .then(setRecommended)
      .catch(() => setRecommended([]));
    getMyCounselling()
      .then(setCounselling)
      .catch(() => setCounselling([]));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-gray-500">Loading…</div>
    );
  }

  function startEdit() {
    setForm(user ?? {});
    setError("");
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  // --- Derived data ---
  const metrics = summary?.metrics ?? {};
  const metricStrip = [
    { label: "Enrolled", value: metrics.enrolled ?? courses.length },
    {
      label: "In Progress",
      value:
        metrics.in_progress ??
        courses.filter((c) => c.status === "active").length,
    },
    { label: "Certificates", value: metrics.certificates ?? certs.length },
    { label: "Assignments Due", value: metrics.assignments_due ?? 0 },
  ];

  // Most recent in-progress / active enrollments for "Continue learning".
  const continueLearning = [...courses]
    .filter((c) => c.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime(),
    )
    .slice(0, 3);

  const liveUpcoming = upcoming.filter((u) => u.type === "live_session");

  const openCounselling = counselling.filter(
    (c) => c.status !== "resolved" && c.status !== "closed",
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* --- Welcome --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display break-words text-2xl font-extrabold text-brand-navy md:text-3xl">
            Welcome back, {firstNameOf(user)} 👋
          </h1>
          <p className="mt-1 text-gray-500">Keep learning, keep growing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/counselling"
            className="tap-target rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Guidance
          </Link>
          <button
            onClick={() => logout()}
            className="tap-target rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- Metrics strip --- */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metricStrip.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <p className="font-display text-2xl font-extrabold text-brand-navy">
              {m.value}
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* --- Continue learning --- */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-navy">
            Continue learning
          </h2>
          {courses.length > 0 && (
            <Link
              href="/courses"
              className="text-sm font-semibold text-brand-blue hover:underline"
            >
              Browse all
            </Link>
          )}
        </div>
        {coursesLoading ? (
          <p className="mt-4 text-sm text-gray-400">Loading…</p>
        ) : continueLearning.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            You&apos;re not enrolled in any courses yet —{" "}
            <Link href="/courses" className="font-semibold text-brand-blue">
              Browse courses
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {continueLearning.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-brand-navy">
                      {e.course.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {e.completed_lessons}/{e.total_lessons} lessons ·{" "}
                      {e.status === "completed"
                        ? "Completed 🎉"
                        : "In progress"}
                    </p>
                  </div>
                  <Link
                    href={`/courses/${e.course.slug}`}
                    className="tap-target inline-flex shrink-0 items-center justify-center rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    {e.status === "completed" ? "Review" : "Continue"}
                  </Link>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-brand-blue"
                      style={{ width: `${e.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {e.progress_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Upcoming live classes --- */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-navy">
            Upcoming live classes
          </h2>
          <Link
            href="/events"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            View all
          </Link>
        </div>
        {liveUpcoming.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No live classes scheduled right now —{" "}
            <Link href="/events" className="font-semibold text-brand-blue">
              see what&apos;s coming up
            </Link>
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {liveUpcoming.map((s) => (
              <Link
                key={s.id}
                href="/events"
                className="block rounded-lg border border-gray-100 p-4 shadow-sm transition hover:border-brand-blue hover:shadow"
              >
                <p className="break-words font-semibold text-brand-navy">
                  {s.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {fmtWhen(s.start_time)}
                  {s.speaker_or_mentor ? ` · ${s.speaker_or_mentor}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* --- Assignments due (summary) --- */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-navy">
          Assignments due
        </h2>
        {(metrics.assignments_due ?? 0) > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-800">
              You have{" "}
              <span className="font-bold">{metrics.assignments_due}</span>{" "}
              assignment{metrics.assignments_due === 1 ? "" : "s"} awaiting your
              submission.
            </p>
            <a
              href="#assignments"
              className="tap-target inline-flex shrink-0 items-center justify-center rounded-md bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              View assignments
            </a>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            You&apos;re all caught up — no assignments due right now.
          </p>
        )}
      </section>

      {/* --- Recent certificates --- */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-navy">
          Recent certificates
        </h2>
        {certs.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            Complete a course to earn your first certificate.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {certs.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words font-semibold text-brand-navy">
                    {c.course_title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c.certificate_number} · Issued {c.issue_date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadCertificate(c.id, `${c.certificate_number}.pdf`)
                    }
                    className="tap-target rounded-md bg-brand-orange px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Download
                  </button>
                  <Link
                    href={`/verify/${c.verification_code}`}
                    className="tap-target inline-flex items-center justify-center rounded-md border border-brand-blue px-4 py-1.5 text-sm font-medium text-brand-blue hover:bg-blue-50"
                  >
                    Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Counselling --- */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-navy">
          Guidance &amp; mentorship
        </h2>
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            {openCounselling.length > 0 ? (
              <>
                You have{" "}
                <span className="font-bold text-brand-navy">
                  {openCounselling.length}
                </span>{" "}
                open guidance request
                {openCounselling.length === 1 ? "" : "s"}.
              </>
            ) : (
              "Need academic help, career guidance, or course selection advice?"
            )}
          </p>
          <Link
            href="/dashboard/counselling"
            className="tap-target inline-flex shrink-0 items-center justify-center rounded-md bg-brand-blue px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            {openCounselling.length > 0 ? "View requests" : "Ask a mentor"}
          </Link>
        </div>
      </section>

      {/* --- Recommended courses --- */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-navy">
            Recommended for you
          </h2>
          <Link
            href="/courses"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            Browse all
          </Link>
        </div>
        {recommended.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No recommendations yet —{" "}
            <Link href="/courses" className="font-semibold text-brand-blue">
              explore the catalogue
            </Link>
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="group block overflow-hidden rounded-lg border border-gray-100 shadow-sm transition hover:border-brand-blue hover:shadow"
              >
                {c.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.thumbnail_url}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-brand-blue/10 to-brand-navy/10" />
                )}
                <div className="p-4">
                  <p className="break-words font-semibold text-brand-navy group-hover:text-brand-blue">
                    {c.title}
                  </p>
                  {c.short_description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {c.short_description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    {c.category && <span>{c.category.name}</span>}
                    {c.is_free && (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 font-semibold text-green-600">
                        Free
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* --- Live Classes (existing component, full detail) --- */}
      <LiveClasses />

      {/* --- Assignments (existing component) --- */}
      <div id="assignments">
        <Assignments />
      </div>

      {/* --- Profile --- */}
      <div className="mt-10 rounded-lg border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-navy">
            My Profile
          </h2>
          {!editing && (
            <button
              onClick={startEdit}
              className="tap-target rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Edit profile
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {!editing ? (
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-gray-400">Email</dt>
              <dd className="text-sm">{user.email}</dd>
            </div>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <dt className="text-xs uppercase text-gray-400">{f.label}</dt>
                <dd className="text-sm">
                  {(user[f.key] as string) || (
                    <span className="text-gray-300">—</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <form
            onSubmit={save}
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs uppercase text-gray-400">
                  {f.label}
                </label>
                {f.key === "gender" ? (
                  <select
                    value={(form[f.key] as string) ?? ""}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, [f.key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:border-brand-blue"
                  >
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input
                    type={f.type ?? "text"}
                    value={(form[f.key] as string) ?? ""}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, [f.key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-base outline-none focus:border-brand-blue"
                  />
                )}
              </div>
            ))}
            <div className="col-span-full mt-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="tap-target rounded-md bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="tap-target rounded-md border border-gray-200 px-5 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
