"use client";

import { authFetch } from "@/lib/auth";

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) { let d="Request failed"; try { d=(await r.json()).detail ?? d; } catch {} throw new Error(d); }
  return r.json();
}

// --- Chatbot ---
export interface ChatMessage { id: number; role: "user" | "bot"; text: string; created_at: string; }
export const getChatHistory = () => authFetch("/api/assistant/chat/").then((r) => j<ChatMessage[]>(r));
export const sendChat = (message: string) =>
  authFetch("/api/assistant/chat/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }).then((r) => j<{ reply: string }>(r));

// --- AI ---
export interface CourseSummary {
  source: string; short_summary: string; long_summary: string;
  learning_outcomes: string[]; key_takeaways: string[]; prerequisites: string[];
  who_should_take: string[]; seo_description: string;
}
export const aiCourseSummary = (title: string, description: string) =>
  authFetch("/api/assistant/ai/course-summary/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description }) }).then((r) => j<CourseSummary>(r));

// --- Counselling ---
export interface Counselling {
  id: number; category: string; subject: string; message: string; status: string;
  student_name?: string; assigned_name?: string | null; mentor_reply: string; created_at: string;
}
export const COUNSELLING_CATEGORIES = [
  ["academic", "Academic question"], ["career", "Career guidance"],
  ["course_selection", "Course selection"], ["learning_difficulty", "Learning difficulty"],
  ["mentorship", "Mentorship request"],
] as const;
export const getMyCounselling = () => authFetch("/api/counselling/").then((r) => j<Counselling[]>(r));
export const submitCounselling = (data: { category: string; subject: string; message: string }) =>
  authFetch("/api/counselling/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => j<Counselling>(r));
export const getCounsellingQueue = () => authFetch("/api/counselling/manage/").then((r) => j<Counselling[]>(r));
export const replyCounselling = (id: number, body: { action: string; mentor_reply?: string }) =>
  authFetch(`/api/counselling/${id}/reply/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => j<Counselling>(r));

// Public course AI summary (no auth) — available on every published course page.
const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const getCoursePublicSummary = (slug: string) =>
  fetch(`${PUBLIC_API}/api/courses/${slug}/ai-summary/`, { cache: "no-store" }).then((r) => j<CourseSummary>(r));
