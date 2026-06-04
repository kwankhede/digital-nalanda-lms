"use client";

import { useEffect, useState } from "react";
import { getMyAssignments, submitAssignment, type MyAssignment } from "@/lib/assignments";

export default function Assignments() {
  const [items, setItems] = useState<MyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<number, string>>({});

  function load() { getMyAssignments().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function submit(a: MyAssignment) {
    const body = a.assignment_type === "external_form" ? { file_url: draft[a.id] } : { text_response: draft[a.id] };
    if (!draft[a.id]) return;
    await submitAssignment(a.id, body);
    load();
  }

  if (loading) return null;
  if (items.length === 0) return null;

  const pending = items.filter((a) => !a.submission || a.submission.status !== "graded");
  const done = items.filter((a) => a.submission && a.submission.status === "graded");

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-brand-navy">Assignments</h2>

      {pending.length > 0 && <h3 className="mt-3 text-sm font-semibold text-gray-500">Pending</h3>}
      <div className="mt-2 space-y-3">
        {pending.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-100 p-4 shadow-sm">
            <p className="font-semibold text-brand-navy">{a.title} <span className="text-xs text-gray-400">· {a.course_title}</span></p>
            <p className="text-sm text-gray-500">{a.description}</p>
            {a.due_date && <p className="text-xs text-gray-400">Due {new Date(a.due_date).toLocaleDateString()}</p>}
            {a.submission ? (
              <p className="mt-2 text-xs text-green-600">Submitted — awaiting grade.</p>
            ) : a.assignment_type === "external_form" ? (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input placeholder="Link to your work / form response URL" value={draft[a.id] ?? ""} onChange={(e) => setDraft({ ...draft, [a.id]: e.target.value })} className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-base" />
                <button onClick={() => submit(a)} className="tap-target shrink-0 rounded-md bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white">Submit</button>
              </div>
            ) : (
              <div className="mt-2">
                <textarea placeholder="Your response… (paste a file link for uploads)" value={draft[a.id] ?? ""} onChange={(e) => setDraft({ ...draft, [a.id]: e.target.value })} rows={3} className="w-full rounded-md border border-gray-200 px-3 py-2 text-base" />
                <button onClick={() => submit(a)} className="tap-target mt-2 w-full rounded-md bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white sm:w-auto">Submit</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {done.length > 0 && <h3 className="mt-5 text-sm font-semibold text-gray-500">Graded</h3>}
      <div className="mt-2 space-y-3">
        {done.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-brand-navy">{a.title}</p>
              <span className="rounded bg-green-50 px-2 py-0.5 text-sm font-bold text-green-600">{a.submission!.score}/{a.max_score}</span>
            </div>
            {a.submission!.feedback && <p className="mt-1 text-sm text-gray-600">Feedback: {a.submission!.feedback}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
