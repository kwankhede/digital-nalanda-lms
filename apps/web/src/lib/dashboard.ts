"use client";

import { authFetch } from "@/lib/auth";

export interface PendingItem {
  label: string;
  count: number;
  href: string;
}
export interface RecentItem {
  text: string;
  at: string; // ISO datetime
}
export interface DashboardSummary {
  role: string;
  metrics: Record<string, number>;
  pending: PendingItem[];
  recent: RecentItem[];
}

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error("Failed to load dashboard");
  return r.json();
}

/** Role-aware dashboard data: metrics, pending tasks, recent activity. */
export const getDashboardSummary = () =>
  authFetch("/api/dashboard/summary/").then((r) => j<DashboardSummary>(r));
