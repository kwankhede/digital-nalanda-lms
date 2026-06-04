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

export interface AuditLog {
  id?: number;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id: number | string;
  note?: string;
  created_at: string;
}

export const getAuditLogs = () =>
  authFetch("/api/admin/audit-logs/").then((r) => j<AuditLog[]>(r));
