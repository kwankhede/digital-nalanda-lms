"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { configForRole } from "@/lib/dashboards";
import { getDashboardSummary, type DashboardSummary } from "@/lib/dashboard";

function timeAgo(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function QuickActionLink({ a }: { a: { label: string; href: string; primary?: boolean; external?: boolean } }) {
  const cls = a.primary
    ? "rounded-lg bg-nal-saffron px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
    : "rounded-lg border border-nal-border bg-white px-4 py-2.5 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment";
  return a.external ? (
    <a href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>{a.label}</a>
  ) : (
    <Link href={a.href} className={cls}>{a.label}</Link>
  );
}

export default function DashboardShell() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => setSummary(null)).finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const cfg = configForRole(user.role, user.is_superuser);
  const metrics = summary?.metrics ?? {};
  const pending = (summary?.pending ?? []).filter((p) => p.count > 0);
  const recent = summary?.recent ?? [];
  const firstName = (user.full_name || user.email || "there").split(" ")[0];

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* 1. Welcome */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">
            Welcome, {firstName}
          </h1>
          <span className="rounded-full bg-nal-navy px-3 py-1 text-xs font-semibold text-white">{cfg.title}</span>
        </div>
        <p className="mt-1 text-nal-slate">{cfg.intro}</p>

        {/* 4. Quick actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {cfg.quickActions.map((a) => <QuickActionLink key={a.label} a={a} />)}
        </div>

        {/* Metrics */}
        {cfg.metricCards.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cfg.metricCards.map((m) => (
              <div key={m.key} className="rounded-2xl border border-nal-border bg-white p-5 shadow-soft">
                <p className="font-display text-3xl font-extrabold text-nal-navy">
                  {loading ? "—" : (metrics[m.key] ?? 0)}
                </p>
                <p className="mt-1 text-sm text-nal-slate">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* 3. Pending tasks */}
          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-nal-navy">Needs your attention</h2>
            {loading ? (
              <p className="mt-4 text-sm text-nal-slate">Loading…</p>
            ) : pending.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-nal-border bg-nal-parchment/40 p-6 text-center text-sm text-nal-slate">
                🎉 You&apos;re all caught up — nothing needs attention right now.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {pending.map((p) => (
                  <li key={p.label}>
                    <Link href={p.href} className="group flex items-center justify-between rounded-xl border border-nal-border p-4 transition hover:border-nal-saffron/50 hover:bg-nal-parchment/40">
                      <span className="font-medium text-nal-navy">{p.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-nal-saffron px-2.5 py-0.5 text-sm font-bold text-white">{p.count}</span>
                        <span className="text-nal-saffron transition group-hover:translate-x-0.5">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 2. Responsibilities */}
          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-nal-navy">You&apos;re responsible for</h2>
            <ul className="mt-4 space-y-2 text-sm text-nal-slate">
              {cfg.responsibilities.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-nal-saffron" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* 5. Recent activity */}
          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-nal-navy">Recent activity</h2>
            {loading ? (
              <p className="mt-4 text-sm text-nal-slate">Loading…</p>
            ) : recent.length === 0 ? (
              <p className="mt-4 text-sm text-nal-slate">No recent activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 border-b border-nal-border/60 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-nal-navy">{r.text}</span>
                    <span className="shrink-0 text-xs text-nal-slate">{timeAgo(r.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 6. Shortcuts */}
          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-nal-navy">Helpful shortcuts</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {cfg.shortcuts.map((s) => (
                s.external ? (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="text-nal-saffron hover:underline">{s.label} ↗</a></li>
                ) : (
                  <li key={s.label}><Link href={s.href} className="text-nal-saffron hover:underline">{s.label} →</Link></li>
                )
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
