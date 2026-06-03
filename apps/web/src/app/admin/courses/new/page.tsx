"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import { isAdmin } from "@/lib/roles";
import { createCreatorCourse } from "@/lib/creator";

export default function AdminNewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", short_description: "", level: "beginner", language: "English", description: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const c = await createCreatorCourse(form);
      router.replace(`/admin/courses/${c.id}/edit`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <RequireRole allow={isAdmin}>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-extrabold text-brand-navy">New Course (Admin)</h1>
        <p className="mt-1 text-sm text-gray-500">Create a course, then add curriculum and publish.</p>
        {err && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input required placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2" />
          <input placeholder="Short description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2" />
          <textarea placeholder="Full description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-md border border-gray-200 px-3 py-2" />
          <div className="flex gap-3">
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2">
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </select>
            <input placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2" />
          </div>
          <button type="submit" className="rounded-md bg-brand-orange px-6 py-2 font-semibold text-white">Create</button>
        </form>
      </div>
    </RequireRole>
  );
}
