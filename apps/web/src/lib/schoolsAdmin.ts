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

export interface AdminSchool {
  id?: number;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  long_description?: string;
  icon?: string;
  image_url?: string;
  hero_image_url?: string;
  course_count?: number;
  order?: number;
  is_published?: boolean;
}

export const getAdminSchools = () =>
  authFetch("/api/admin/schools/").then((r) => j<AdminSchool[]>(r));

export const createSchool = (data: AdminSchool) =>
  authFetch("/api/admin/schools/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminSchool>(r));

export const updateSchool = (id: number, data: Partial<AdminSchool>) =>
  authFetch(`/api/admin/schools/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminSchool>(r));

export const deleteSchool = (id: number) =>
  authFetch(`/api/admin/schools/${id}/`, { method: "DELETE" }).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error("Delete failed");
  });
