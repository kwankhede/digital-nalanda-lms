import type { Block } from "@/lib/blocks";
"use client";

import { authFetch } from "@/lib/auth";

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let d = "Request failed";
    try { d = (await res.json()).detail ?? d; } catch {}
    throw new Error(d);
  }
  return res.json();
}

export interface Application {
  id?: number;
  status: string; // none | pending | approved | rejected
  full_name?: string;
  admin_notes?: string;
}

export interface CreatorCourse {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  level: string;
  language: string;
  status: string;
  rejected_reason: string;
}

export interface ApplicationInput {
  full_name: string;
  phone?: string;
  expertise_area?: string;
  current_role?: string;
  bio?: string;
  teaching_experience?: string;
  proposed_course_topics?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export const getApplicationStatus = () =>
  authFetch("/api/creator/application/status/").then((r) => j<Application>(r));

export const applyCreator = (data: ApplicationInput) =>
  authFetch("/api/creator/apply/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<Application>(r));

export const getCreatorCourses = () =>
  authFetch("/api/creator/courses/").then((r) => j<CreatorCourse[]>(r));

export const getCreatorCourse = (id: number) =>
  authFetch(`/api/creator/courses/${id}/`).then((r) => j<CreatorCourse>(r));

export const createCreatorCourse = (data: Partial<CreatorCourse>) =>
  authFetch("/api/creator/courses/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<CreatorCourse>(r));

export const updateCreatorCourse = (id: number, data: Partial<CreatorCourse>) =>
  authFetch(`/api/creator/courses/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<CreatorCourse>(r));

export const submitCreatorCourse = (id: number) =>
  authFetch(`/api/creator/courses/${id}/submit/`, { method: "POST" }).then((r) => j<CreatorCourse>(r));

// --- Admin ---
export interface AdminApplication extends Application {
  email?: string;
  expertise_area?: string;
  bio?: string;
  teaching_experience?: string;
  proposed_course_topics?: string;
}
export interface AdminCourse {
  id: number;
  title: string;
  slug: string;
  status: string;
  creator_email: string | null;
}

export const adminGetApplications = (status?: string) =>
  authFetch(`/api/admin/creator-applications/${status ? `?status=${status}` : ""}`).then((r) => j<AdminApplication[]>(r));
export const adminApproveApplication = (id: number, notes: string) =>
  authFetch(`/api/admin/creator-applications/${id}/approve/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin_notes: notes }),
  }).then((r) => j(r));
export const adminRejectApplication = (id: number, notes: string) =>
  authFetch(`/api/admin/creator-applications/${id}/reject/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin_notes: notes }),
  }).then((r) => j(r));

export const adminGetCourseReviews = (status?: string) =>
  authFetch(`/api/admin/course-reviews/${status ? `?status=${status}` : ""}`).then((r) => j<AdminCourse[]>(r));
export const adminCourseAction = (id: number, action: string, body?: object) =>
  authFetch(`/api/admin/course-reviews/${id}/${action}/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  }).then((r) => j(r));

// --- Curriculum (modules/lessons) ---
export const addModule = (courseId: number, title: string, order = 0) =>
  authFetch(`/api/creator/courses/${courseId}/modules/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, order }),
  }).then((r) => j(r));

export const addLesson = (
  moduleId: number,
  data: { title: string; lesson_type?: string; youtube_video_id?: string; content?: string; order?: number; duration_minutes?: number },
) =>
  authFetch(`/api/creator/modules/${moduleId}/lessons/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j(r));

// --- Visual curriculum builder ---
export interface BuilderLesson {
  id: number;
  title: string;
  slug: string;
  lesson_type: string;
  youtube_video_id: string;
  content: string;
  resource_url: string;
  live_session: number | null;
  order: number;
  duration_minutes: number;
  is_preview: boolean;
  is_published: boolean;
  blocks: Block[];
}
export interface BuilderModule {
  id: number;
  title: string;
  order: number;
  lessons: BuilderLesson[];
}
export interface Curriculum {
  course: { id: number; title: string; status: string };
  modules: BuilderModule[];
}

export const LESSON_TYPES = [
  "youtube", "video", "text", "pdf", "quiz", "assignment", "live_class",
] as const;

export const getCurriculum = (courseId: number) =>
  authFetch(`/api/creator/courses/${courseId}/curriculum/`).then((r) => j<Curriculum>(r));

export const updateModule = (moduleId: number, data: { title?: string }) =>
  authFetch(`/api/creator/modules/${moduleId}/`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j(r));

export const deleteModule = (moduleId: number) =>
  authFetch(`/api/creator/modules/${moduleId}/`, { method: "DELETE" });

export const duplicateModule = (moduleId: number) =>
  authFetch(`/api/creator/modules/${moduleId}/duplicate/`, { method: "POST" }).then((r) => j(r));

export const updateLesson = (lessonId: number, data: Partial<BuilderLesson>) =>
  authFetch(`/api/creator/lessons/${lessonId}/`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j(r));

export const deleteLesson = (lessonId: number) =>
  authFetch(`/api/creator/lessons/${lessonId}/`, { method: "DELETE" });

export const duplicateLesson = (lessonId: number) =>
  authFetch(`/api/creator/lessons/${lessonId}/duplicate/`, { method: "POST" }).then((r) => j(r));

export const reorderCurriculum = (
  courseId: number,
  modules: { id: number; lessons: number[] }[],
) =>
  authFetch(`/api/creator/courses/${courseId}/reorder/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modules }),
  }).then((r) => j(r));

export interface CreatorCourseStats {
  id: number;
  title: string;
  slug: string;
  status: string;
  enrollments: number;
  completed: number;
  completion_rate: number;
  avg_progress: number;
  active_last_7_days: number;
}

export const getCreatorCourseStats = () =>
  authFetch("/api/creator/courses/stats/").then((r) =>
    j<{ courses: CreatorCourseStats[] }>(r),
  );
