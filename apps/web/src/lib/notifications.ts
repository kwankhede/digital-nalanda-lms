"use client";

import { authFetch } from "@/lib/auth";

export interface Notification {
  id: number; type: string; title: string; message: string;
  link: string; is_read: boolean; created_at: string;
}
export interface NotifPage {
  results: Notification[]; unread_count: number; next: string | null;
}

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error("Request failed");
  return r.json();
}

export const getNotifications = (params = "") =>
  authFetch(`/api/notifications/${params}`).then((r) => j<NotifPage>(r));
export const getUnreadCount = () =>
  authFetch("/api/notifications/unread-count/").then((r) => j<{ unread_count: number }>(r));
export const markRead = (id: number) =>
  authFetch(`/api/notifications/${id}/read/`, { method: "POST" });
export const markAllRead = () =>
  authFetch("/api/notifications/read-all/", { method: "POST" });

// --- Announcements ---
export interface Announcement { id: number; title: string; content: string; audience: string; }
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export async function getActiveAnnouncements(token?: string): Promise<Announcement[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/announcements/active/`, { headers, cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}
