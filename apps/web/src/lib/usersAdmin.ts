"use client";

import { authFetch } from "@/lib/auth";

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let d = "Request failed";
    try { d = (await r.json()).detail ?? d; } catch {}
    throw new Error(d);
  }
  return r.json();
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

interface Paginated<T> {
  count?: number;
  results?: T[];
}

export const ROLES: { value: string; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "teacher_applicant", label: "Teacher Applicant" },
  { value: "course_creator", label: "Course Creator" },
  { value: "mentor", label: "Mentor" },
  { value: "event_manager", label: "Event Manager" },
  { value: "library_coordinator", label: "Library Coordinator" },
  { value: "volunteer", label: "Volunteer" },
  { value: "content_manager", label: "Content Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export const roleLabel = (value: string): string =>
  ROLES.find((r) => r.value === value)?.label ?? value;

export async function getAdminUsers(
  params?: { search?: string; role?: string },
): Promise<AdminUser[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.role) qs.set("role", params.role);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await authFetch(`/api/admin/users/${suffix}`).then(
    (r) => j<Paginated<AdminUser> | AdminUser[]>(r),
  );
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export const setUserRole = (id: number, role: string) =>
  authFetch(`/api/admin/users/${id}/role/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  }).then((r) => j<{ detail?: string }>(r));

export const activateUser = (id: number) =>
  authFetch(`/api/admin/users/${id}/activate/`, { method: "POST" }).then(
    (r) => j<{ detail?: string }>(r),
  );

export const deactivateUser = (id: number) =>
  authFetch(`/api/admin/users/${id}/deactivate/`, { method: "POST" }).then(
    (r) => j<{ detail?: string }>(r),
  );

export const sendUserPasswordReset = (id: number) =>
  authFetch(`/api/admin/users/${id}/send-password-reset/`, {
    method: "POST",
  }).then((r) => j<{ detail?: string }>(r));
