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

export interface AttentionItem { id: number; title: string; waiting_days: number | null; }
export interface AttentionQueue {
  count: number;
  oldest_days: number | null;
  items: AttentionItem[];
  link: string;
}
export interface AdminAttention {
  total_waiting: number;
  queues: Record<string, AttentionQueue>;
}

export async function getAdminAttention(): Promise<AdminAttention> {
  const res = await authFetch("/api/admin/attention/");
  if (!res.ok) throw new Error("Not authorized");
  return res.json();
}

export interface CommandCenterToday {
  signups: number;
  logins: number;
  enrollments: number;
  lessons_completed: number;
}
export interface CommandCenterSession {
  id: number;
  title: string;
  slug: string;
  start_time: string;
  has_join_link: boolean;
}
export interface CommandCenterAlert {
  severity: "high" | "medium" | "low";
  message: string;
  link: string;
}
export interface CommandCenterPeople {
  total: number;
  by_role: Record<string, number>;
  new_this_week: number;
  active_this_week: number;
  unverified_emails: number;
}
export interface CommandCenterPlatform {
  debug: boolean;
  email_backend: string;
  database_engine: string;
  frontend_url: string;
  time_zone: string;
}
export interface CommandCenter {
  today: CommandCenterToday;
  live_next_48h: CommandCenterSession[];
  alerts: CommandCenterAlert[];
  attention: AdminAttention;
  people: CommandCenterPeople;
  platform: CommandCenterPlatform;
  generated_at: string;
}

export async function getCommandCenter(): Promise<CommandCenter> {
  const res = await authFetch("/api/admin/command-center/");
  if (!res.ok) throw new Error("Not authorized");
  return res.json();
}

export interface ReportSegment {
  key: string;
  label: string;
  description: string;
  category: string;
  count: number;
  metric_label: string | null;
}
export interface ReportUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  date_joined: string | null;
  last_login: string | null;
  metric: number | null;
}
export interface ReportDetail {
  key: string;
  label: string;
  description: string;
  metric_label: string | null;
  count: number;
  users: ReportUser[];
}

export async function getReportSegments(): Promise<ReportSegment[]> {
  const res = await authFetch("/api/admin/reports/");
  if (!res.ok) throw new Error("Not authorized");
  return (await res.json()).segments;
}

export async function getReportDetail(key: string): Promise<ReportDetail> {
  const res = await authFetch(`/api/admin/reports/${key}/`);
  if (!res.ok) throw new Error("Failed to load report");
  return res.json();
}

export async function downloadUsersCsv(report?: string): Promise<void> {
  const qs = report ? `?report=${report}` : "";
  const res = await authFetch(`/api/admin/users/export/${qs}`);
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = report ? `users_${report}.csv` : "users_all.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
