"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "@/components/RequireRole";
import {
  downloadUsersCsv,
  getReportDetail,
  getReportSegments,
  type ReportDetail,
  type ReportSegment,
} from "@/lib/admin";
import type { Profile } from "@/lib/auth";

const allow = (u?: Profile | null) =>
  !!u &&
  (!!u.is_staff || !!u.is_superuser || ["admin", "super_admin", "content_manager"].includes(u.role));

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function fmtMetric(metric: number | null, label: string | null) {
  if (metric == null) return null;
  if (label === "seconds watched") {
    const h = Math.floor(metric / 3600);
    const m = Math.round((metric % 3600) / 60);
    return `${h}h ${m}m`;
  }
  return `${metric}`;
}

function ReportsPage() {
  const [segments, setSegments] = useState<ReportSegment[]>([]);
  const [active, setActive] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getReportSegments().then(setSegments).catch(() => setSegments([])).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, ReportSegment[]>();
    for (const s of segments) {
      map.set(s.category, [...(map.get(s.category) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [segments]);

  const open = (key: string) => {
    setDetailLoading(true);
    getReportDetail(key)
      .then(setActive)
      .catch(() => setActive(null))
      .finally(() => setDetailLoading(false));
  };

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">Admin</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-nal-navy md:text-3xl">Reports Center</h1>
            <p className="mt-1 text-sm text-nal-slate">
              Ready-made segments over your learners — click any card to see who&apos;s in it.
            </p>
          </div>
          <button
            onClick={() => downloadUsersCsv()}
            className="rounded-lg border border-nal-border bg-white px-4 py-2.5 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment"
          >
            ⬇ Export all users (CSV)
          </button>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-nal-slate">Loading reports…</p>
        ) : (
          categories.map(([cat, segs]) => (
            <section key={cat} className="mt-10">
              <h2 className="border-b border-nal-border pb-2 font-display text-lg font-bold text-nal-navy">{cat}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {segs.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => open(s.key)}
                    className={`rounded-2xl border p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift ${
                      active?.key === s.key ? "border-nal-saffron bg-nal-parchment/40" : "border-nal-border bg-white"
                    }`}
                  >
                    <p className="font-display text-2xl font-extrabold text-nal-navy">{s.count}</p>
                    <p className="mt-1 text-sm font-semibold text-nal-navy">{s.label}</p>
                    <p className="mt-1 text-xs text-nal-slate">{s.description}</p>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}

        {/* Detail table */}
        {detailLoading && <p className="mt-10 text-sm text-nal-slate">Loading segment…</p>}
        {active && !detailLoading && (
          <section className="mt-10 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-nal-navy">
                  {active.label} <span className="text-nal-slate">({active.count})</span>
                </h2>
                <p className="text-sm text-nal-slate">{active.description}</p>
              </div>
              <button
                onClick={() => downloadUsersCsv(active.key)}
                className="rounded-lg border border-nal-border bg-white px-4 py-2 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment"
              >
                ⬇ Export this segment
              </button>
            </div>
            {active.users.length === 0 ? (
              <p className="mt-6 text-sm text-nal-slate">No users in this segment right now.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-nal-border text-left text-xs uppercase tracking-wide text-nal-slate">
                      <th className="py-2 pr-3">User</th>
                      <th className="py-2 pr-3">Role</th>
                      <th className="py-2 pr-3">Joined</th>
                      <th className="py-2 pr-3">Last login</th>
                      {active.metric_label && <th className="py-2 capitalize">{active.metric_label}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {active.users.map((u) => (
                      <tr key={u.id} className="border-b border-nal-border/60 last:border-0">
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-nal-navy">{u.full_name || "—"}</p>
                          <p className="text-xs text-nal-slate">{u.email}</p>
                        </td>
                        <td className="py-2.5 pr-3 capitalize">{u.role.replace(/_/g, " ")}</td>
                        <td className="py-2.5 pr-3">{fmtDate(u.date_joined)}</td>
                        <td className="py-2.5 pr-3">{fmtDate(u.last_login)}</td>
                        {active.metric_label && (
                          <td className="py-2.5 font-semibold text-nal-navy">
                            {fmtMetric(u.metric, active.metric_label)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {active.count > active.users.length && (
                  <p className="mt-3 text-xs text-nal-slate">
                    Showing first {active.users.length} of {active.count} — export the CSV for the full list.
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole allow={allow}>
      <ReportsPage />
    </RequireRole>
  );
}
