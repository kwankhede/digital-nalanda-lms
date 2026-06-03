"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { applyCreator, getApplicationStatus, type Application } from "@/lib/creator";

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "full_name", label: "Full name" },
  { key: "phone", label: "Phone" },
  { key: "expertise_area", label: "Expertise area" },
  { key: "current_role", label: "Current role" },
  { key: "bio", label: "Short bio", type: "textarea" },
  { key: "teaching_experience", label: "Teaching experience", type: "textarea" },
  { key: "proposed_course_topics", label: "Proposed course topics", type: "textarea" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "portfolio_url", label: "Portfolio URL" },
];

export default function BecomeTeacherPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ full_name: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user) getApplicationStatus().then(setApp).catch(() => setApp({ status: "none" }));
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await applyCreator(form as never);
      setApp(res);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Teach on Digital Nalanda</h1>
      <p className="mt-3 text-gray-600">
        Share your knowledge with thousands of learners across India. Apply to
        become a course creator — our team reviews every application.
      </p>

      {loading ? null : !user ? (
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="rounded-md bg-brand-orange px-6 py-3 font-semibold text-white">Login to Apply</Link>
          <Link href="/register" className="rounded-md border border-gray-200 px-6 py-3 font-semibold">Register</Link>
        </div>
      ) : app && ["pending", "approved", "rejected"].includes(app.status) && !done ? (
        <div className="mt-8 rounded-xl border border-gray-100 p-6 shadow-sm">
          <p className="font-bold text-brand-navy">Application status: <span className="capitalize">{app.status}</span></p>
          {app.status === "approved" && (
            <Link href="/creator/dashboard" className="mt-4 inline-block rounded-md bg-brand-blue px-5 py-2 font-semibold text-white">Go to Creator Dashboard</Link>
          )}
          {app.status === "rejected" && app.admin_notes && (
            <p className="mt-2 text-sm text-gray-500">Notes: {app.admin_notes}</p>
          )}
          {app.status === "pending" && (
            <p className="mt-2 text-sm text-gray-500">We&apos;ll email you once it&apos;s reviewed.</p>
          )}
        </div>
      ) : done ? (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
          <p className="font-bold text-green-700">🎉 Application submitted!</p>
          <p className="mt-1 text-sm text-green-600">Our team will review it shortly.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea required={f.key === "full_name"} value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-blue" rows={3} />
              ) : (
                <input required={f.key === "full_name"} value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-blue" />
              )}
            </div>
          ))}
          <button type="submit" className="rounded-md bg-brand-orange px-6 py-3 font-semibold text-white hover:opacity-90">Submit Application</button>
        </form>
      )}
    </div>
  );
}
