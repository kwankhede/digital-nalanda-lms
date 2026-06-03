"use client";

import { authFetch } from "@/lib/auth";

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) { let d="Request failed"; try { d=(await r.json()).detail ?? d; } catch {} throw new Error(d); }
  return r.json();
}

export interface Submission {
  id: number; assignment: number; assignment_title?: string; student?: number;
  student_name?: string; text_response: string; file_url: string;
  score: number | null; max_score?: number; feedback: string; status: string;
  submitted_at: string; graded_at: string | null;
}
export interface MyAssignment {
  id: number; course: number; course_title: string; title: string; description: string;
  assignment_type: string; external_url: string; due_date: string | null;
  max_score: number; submission: Submission | null;
}
export interface Assignment {
  id: number; course: number; course_title: string; title: string;
  description: string; assignment_type: string; due_date: string | null; max_score: number;
}

export const getMyAssignments = () => authFetch("/api/my/assignments/").then((r) => j<MyAssignment[]>(r));
export const submitAssignment = (id: number, body: { text_response?: string; file_url?: string }) =>
  authFetch(`/api/assignments/${id}/submit/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => j<Submission>(r));

// Teacher/mentor
export const getMyCourseAssignments = () => authFetch("/api/creator/assignments/mine/").then((r) => j<Assignment[]>(r));
export const createAssignment = (courseId: number, data: Partial<Assignment>) =>
  authFetch(`/api/creator/courses/${courseId}/assignments/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => j<Assignment>(r));
export const getSubmissions = (assignmentId: number) =>
  authFetch(`/api/assignments/${assignmentId}/submissions/`).then((r) => j<Submission[]>(r));
export const gradeSubmission = (id: number, body: { score: number; feedback: string }) =>
  authFetch(`/api/submissions/${id}/grade/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => j<Submission>(r));
