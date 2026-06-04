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

export const RESOURCE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "slides", label: "Slides" },
  { value: "video", label: "Video" },
  { value: "link", label: "Link" },
  { value: "other", label: "Other" },
] as const;

export interface AdminStudyMaterial {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  resource_type?: string;
  url: string;
  is_published?: boolean;
  order?: number;
}

export const getAdminStudyMaterials = () =>
  authFetch("/api/admin/study-materials/").then((r) => j<AdminStudyMaterial[]>(r));

export const createStudyMaterial = (data: AdminStudyMaterial) =>
  authFetch("/api/admin/study-materials/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminStudyMaterial>(r));

export const updateStudyMaterial = (id: number, data: Partial<AdminStudyMaterial>) =>
  authFetch(`/api/admin/study-materials/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminStudyMaterial>(r));

export const deleteStudyMaterial = (id: number) =>
  authFetch(`/api/admin/study-materials/${id}/`, { method: "DELETE" }).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error("Delete failed");
  });
