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

export interface AdminEducator {
  id?: number;
  name: string;
  slug?: string;
  title?: string;
  expertise?: string;
  school?: string;
  bio?: string;
  long_bio?: string;
  photo_url?: string;
  linkedin_url?: string;
  website_url?: string;
  is_featured?: boolean;
  order?: number;
}

export const getAdminEducators = () =>
  authFetch("/api/admin/educators/").then((r) => j<AdminEducator[]>(r));

export const createEducator = (data: AdminEducator) =>
  authFetch("/api/admin/educators/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminEducator>(r));

export const updateEducator = (id: number, data: Partial<AdminEducator>) =>
  authFetch(`/api/admin/educators/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminEducator>(r));

export const deleteEducator = (id: number) =>
  authFetch(`/api/admin/educators/${id}/`, { method: "DELETE" }).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error("Delete failed");
  });
