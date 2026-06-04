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

export interface AdminTickerItem {
  id?: number;
  text: string;
  link?: string;
  is_active?: boolean;
  order?: number;
}

export const getAdminTicker = () =>
  authFetch("/api/admin/ticker/").then((r) => j<AdminTickerItem[]>(r));

export const createTicker = (data: AdminTickerItem) =>
  authFetch("/api/admin/ticker/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminTickerItem>(r));

export const updateTicker = (id: number, data: Partial<AdminTickerItem>) =>
  authFetch(`/api/admin/ticker/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => j<AdminTickerItem>(r));

export const deleteTicker = (id: number) =>
  authFetch(`/api/admin/ticker/${id}/`, { method: "DELETE" }).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error("Delete failed");
  });
