"use client";

import { authFetch, type Profile } from "@/lib/auth";
import type { CourseListItem } from "@/lib/api";

export interface Enrollment {
  id: number;
  course: CourseListItem;
  status: "active" | "completed" | "cancelled";
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface LessonProgress {
  id: number;
  lesson: number;
  course: number;
  is_completed: boolean;
  completed_at: string | null;
  watch_seconds: number;
  last_watched_at: string | null;
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const d = await res.json();
      detail = d.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function enroll(slug: string): Promise<void> {
  const res = await authFetch(`/api/courses/${slug}/enroll/`, { method: "POST" });
  // 201 (new) and 200 (already enrolled) are both success.
  if (!res.ok) await asJson(res);
}

export async function getMyCourses(): Promise<Enrollment[]> {
  return asJson(await authFetch(`/api/my/courses/`));
}

export async function getCourseProgress(slug: string): Promise<LessonProgress[]> {
  return asJson(await authFetch(`/api/my/progress/?course=${slug}`));
}

export interface CompleteResult {
  lesson: LessonProgress;
  enrollment: Enrollment | null;
}

export async function completeLesson(lessonId: number): Promise<CompleteResult> {
  return asJson<CompleteResult>(
    await authFetch(`/api/lessons/${lessonId}/complete/`, { method: "POST" }),
  );
}

export type { Profile };

// --- Certificates ---

export interface Certificate {
  id: number;
  certificate_number: string;
  verification_code: string;
  course_title: string;
  course_slug: string;
  recipient_name: string;
  issue_date: string;
  completion_date: string | null;
  percentage_completed: number;
  is_revoked: boolean;
}

export async function getMyCertificates(): Promise<Certificate[]> {
  return asJson(await authFetch(`/api/my/certificates/`));
}

export async function generateCertificate(slug: string): Promise<Certificate> {
  return asJson(
    await authFetch(`/api/certificates/generate/${slug}/`, { method: "POST" }),
  );
}

// Owner-only download: fetch the PDF with auth, then trigger a browser save.
export async function downloadCertificate(
  id: number,
  filename: string,
): Promise<void> {
  const res = await authFetch(`/api/certificates/${id}/download/`);
  if (!res.ok) throw new Error("Could not download certificate");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Live sessions / workshops ---

export interface LiveSession {
  id: number;
  title: string;
  slug: string;
  description: string;
  course: number | null;
  course_title: string | null;
  mentor: number | null;
  mentor_name: string | null;
  zoom_join_url: string;
  start_time: string;
  end_time: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
  recording_url: string;
  created_at: string;
}

export interface SessionAttendanceRow {
  id: number;
  student: number;
  student_name: string;
  student_email: string;
  joined_at: string | null;
  attendance_status: string;
}

export interface LiveSessionInput {
  title: string;
  description?: string;
  course?: number | null;
  mentor?: number | null;
  zoom_join_url?: string;
  start_time: string;
  end_time?: string | null;
  status?: string;
  recording_url?: string;
}

export async function getUpcomingSessions(): Promise<LiveSession[]> {
  return asJson(await authFetch(`/api/live-sessions/upcoming/`));
}

export async function getLiveSessions(): Promise<LiveSession[]> {
  return asJson(await authFetch(`/api/live-sessions/`));
}

export async function joinSession(slug: string): Promise<{ zoom_join_url: string }> {
  return asJson(await authFetch(`/api/live-sessions/${slug}/join/`, { method: "POST" }));
}

// Admin
export async function getAdminSessions(): Promise<LiveSession[]> {
  return asJson(await authFetch(`/api/admin/live-sessions/`));
}
export async function createSession(data: LiveSessionInput): Promise<LiveSession> {
  return asJson(
    await authFetch(`/api/admin/live-sessions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
}
export async function updateSession(id: number, data: Partial<LiveSessionInput>): Promise<LiveSession> {
  return asJson(
    await authFetch(`/api/admin/live-sessions/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
}
export async function deleteSession(id: number): Promise<void> {
  const res = await authFetch(`/api/admin/live-sessions/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not delete session");
}

// Mentor
export async function getMentorSessions(): Promise<LiveSession[]> {
  return asJson(await authFetch(`/api/mentor/live-sessions/`));
}
export async function getSessionAttendance(slug: string): Promise<SessionAttendanceRow[]> {
  return asJson(await authFetch(`/api/live-sessions/${slug}/attendance/`));
}
