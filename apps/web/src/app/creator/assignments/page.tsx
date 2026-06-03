"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isCreator } from "@/lib/roles";
import {
  getMyCourseAssignments, getSubmissions, gradeSubmission, createAssignment,
  type Assignment, type Submission,
} from "@/lib/assignments";
import { getCreatorCourses, type CreatorCourse } from "@/lib/creator";

function Grader() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [grade, setGrade] = useState<Record<number, { score: string; feedback: string }>>({});

  const [courses, setCourses] = useState<CreatorCourse[]>([]);
  const [form, setForm] = useState({ course: "", title: "", description: "", assignment_type: "text_response", max_score: "100" });
  function reloadAssignments() { getMyCourseAssignments().then(setAssignments).catch(() => setAssignments([])); }
  useEffect(() => { reloadAssignments(); getCreatorCourses().then(setCourses).catch(() => setCourses([])); }, []);

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course || !form.title) return;
    await createAssignment(Number(form.course), {
      title: form.title, description: form.description,
      assignment_type: form.assignment_type, max_score: Number(form.max_score) || 100,
    } as never);
    setForm({ course: "", title: "", description: "", assignment_type: "text_response", max_score: "100" });
    reloadAssignments();
  }

  async function open(a: Assignment) {
    setOpenId(a.id);
    setSubs(await getSubmissions(a.id).catch(() => []));
  }
  async function doGrade(s: Submission) {
    const g = grade[s.id] || { score: "", feedback: "" };
    await gradeSubmission(s.id, { score: Number(g.score) || 0, feedback: g.feedback });
    if (openId) setSubs(await getSubmissions(openId));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-navy">Assignments &amp; Grading</h1>
      <form onSubmit={addAssignment} className="mt-6 grid grid-cols-1 gap-2 rounded-xl border border-gray-100 p-4 shadow-sm sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-bold uppercase text-gray-400">New assignment</p>
        <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
          <option value="">Select course…</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm sm:col-span-2" />
        <select value={form.assignment_type} onChange={(e) => setForm({ ...form, assignment_type: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
          <option value="text_response">Text Response</option>
          <option value="essay">Essay</option>
          <option value="pdf_upload">PDF Upload</option>
          <option value="file_upload">File Upload</option>
          <option value="external_form">External Form</option>
        </select>
        <input type="number" placeholder="Max score" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} className="rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <button className="rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Create assignment</button>
      </form>
      {assignments.length === 0 && <p className="mt-4 text-gray-500">No assignments yet — create one above.</p>}
      <div className="mt-6 space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-navy">{a.title}</p>
                <p className="text-xs text-gray-400">{a.course_title} · max {a.max_score}</p>
              </div>
              <button onClick={() => open(a)} className="rounded-md bg-brand-blue px-4 py-1.5 text-sm font-medium text-white">View submissions</button>
            </div>
            {openId === a.id && (
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                {subs.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
                {subs.map((s) => (
                  <div key={s.id} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm font-medium text-brand-navy">{s.student_name} <span className="text-xs text-gray-400">· {s.status}</span></p>
                    {s.text_response && <p className="mt-1 text-sm text-gray-600">{s.text_response}</p>}
                    {s.file_url && <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue underline">View file</a>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input type="number" placeholder={`Score /${a.max_score}`} defaultValue={s.score ?? ""} onChange={(e) => setGrade({ ...grade, [s.id]: { ...(grade[s.id] || { feedback: s.feedback }), score: e.target.value } })} className="w-24 rounded-md border border-gray-200 px-2 py-1 text-sm" />
                      <input placeholder="Feedback" defaultValue={s.feedback} onChange={(e) => setGrade({ ...grade, [s.id]: { ...(grade[s.id] || { score: String(s.score ?? "") }), feedback: e.target.value } })} className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm" />
                      <button onClick={() => doGrade(s)} className="rounded-md bg-brand-orange px-4 py-1 text-sm font-semibold text-white">Grade</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreatorAssignmentsPage() {
  return <RequireRole allow={isCreator}><Grader /></RequireRole>;
}
