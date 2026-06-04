"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCreatorCourse } from "@/lib/creator";

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", short_description: "", level: "beginner", language: "English", description: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const c = await createCreatorCourse(form);
      router.replace(`/creator/courses/${c.id}/edit`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-navy">New Course (Draft)</h1>
      {err && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base" />
        <input placeholder="Short description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base" />
        <textarea placeholder="Full description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base sm:w-auto">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base sm:flex-1" />
        </div>
        <button type="submit" className="rounded-md bg-brand-orange px-6 py-2 font-semibold text-white">Create Draft</button>
      </form>
    </div>
  );
}
