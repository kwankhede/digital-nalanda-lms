"use client";

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { isAdmin } from "@/lib/roles";
import { getAuditLogs, type AuditLog } from "@/lib/auditLogs";

function humanizeAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const yr = Math.round(mo / 12);
  return `${yr} year${yr === 1 ? "" : "s"} ago`;
}

function Viewer() {
  const [list, setList] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">Audit Logs</h1>
      <p className="mt-2 text-nal-slate">A reverse-chronological record of administrative activity.</p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-nal-slate">Loading…</p>
        ) : list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-nal-border bg-white/50 p-6 text-sm text-nal-slate">
            No activity logged yet.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-nal-border bg-nal-parchment/50 text-nal-slate">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Actor</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Entity</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nal-border">
                  {list.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 font-medium text-nal-navy">{log.actor_email || "System"}</td>
                      <td className="px-4 py-3 text-nal-navy">{humanizeAction(log.action)}</td>
                      <td className="px-4 py-3 text-nal-slate">{log.entity_type} #{log.entity_id}</td>
                      <td className="px-4 py-3 text-nal-slate">{log.note || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-nal-slate" title={log.created_at}>{relativeTime(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {list.map((log) => (
                <div key={log.id} className="rounded-2xl border border-nal-border bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-nal-navy">{humanizeAction(log.action)}</p>
                    <span className="shrink-0 text-xs text-nal-slate" title={log.created_at}>{relativeTime(log.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-nal-slate">{log.actor_email || "System"}</p>
                  <p className="mt-1 text-xs text-nal-slate">{log.entity_type} #{log.entity_id}</p>
                  {log.note && <p className="mt-2 break-words text-sm text-nal-navy">{log.note}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <RequireRole allow={isAdmin}>
      <Viewer />
    </RequireRole>
  );
}
