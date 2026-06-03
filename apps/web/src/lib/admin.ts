"use client";

import { authFetch } from "@/lib/auth";

export interface GrowthPoint { month: string; count: number; }
export interface AdminStats {
  totals: Record<string, number>;
  completion_rate: number;
  student_growth: GrowthPoint[];
  enrollment_growth: GrowthPoint[];
  newsletter_growth: GrowthPoint[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await authFetch("/api/admin/stats/");
  if (!res.ok) throw new Error("Not authorized");
  return res.json();
}

export async function downloadNewsletterCsv(): Promise<void> {
  const res = await authFetch("/api/admin/newsletter/export/");
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "newsletter_subscribers.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
