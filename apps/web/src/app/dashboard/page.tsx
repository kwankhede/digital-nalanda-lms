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

  // --- Auth guard: redirect to login once we know there's no user. ---
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Load enrolled courses.
  useEffect(() => {
    if (!user) return;
    getMyCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
    getMyCertificates()
      .then(setCerts)
      .catch(() => setCerts([]));
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">
            Welcome back, {user.full_name || user.email} 👋
          </h1>
          <p className="mt-1 text-gray-500">Keep learning, keep growing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/counselling" className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Guidance
          </Link>
          <button
            onClick={() => logout()}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- My Courses --- */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-brand-navy">My Courses</h2>
        {coursesLoading ? (
          <p className="mt-4 text-sm text-gray-400">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            You haven&apos;t enrolled in any courses yet.{" "}
            <Link href="/courses" className="font-semibold text-brand-blue">
              Browse courses
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {courses.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-brand-navy">
                      {e.course.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {e.completed_lessons}/{e.total_lessons} lessons ·{" "}
                      {e.status === "completed" ? "Completed 🎉" : "In progress"}
                    </p>
                  </div>
                  <Link
                    href={`/courses/${e.course.slug}`}
                    className="rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Continue
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

      {/* --- My Certificates --- */}
      {certs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-brand-navy">My Certificates</h2>
          <div className="mt-4 space-y-3">
            {certs.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-brand-navy">{c.course_title}</p>
                  <p className="text-xs text-gray-400">
                    {c.certificate_number} · Issued {c.issue_date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadCertificate(c.id, `${c.certificate_number}.pdf`)
                    }
                    className="rounded-md bg-brand-orange px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Download
                  </button>
                  <Link
                    href={`/verify/${c.verification_code}`}
                    className="rounded-md border border-brand-blue px-4 py-1.5 text-sm font-medium text-brand-blue hover:bg-blue-50"
                  >
                    Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Live Classes --- */}
      <LiveClasses />

      {/* --- Assignments --- */}
      <Assignments />

      {/* --- Profile --- */}
      <div className="mt-10 rounded-lg border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy">My Profile</h2>
          {!editing && (
            <button
              onClick={startEdit}
              className="rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
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
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
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
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                )}
              </div>
            ))}
            <div className="col-span-full mt-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border border-gray-200 px-5 py-2 text-sm font-medium hover:bg-gray-50"
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
