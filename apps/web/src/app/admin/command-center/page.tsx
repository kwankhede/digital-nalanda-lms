"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import { OpsInbox } from "@/components/dashboard/DashboardShell";
import { getCommandCenter, type CommandCenter } from "@/lib/admin";
import type { Profile } from "@/lib/auth";

const allow = (u?: Profile | null) =>
  !!u && (!!u.is_superuser || u.role === "super_admin");

const SEVERITY_STYLE: Record<string, string> = {
  high: "border-red-300 bg-red-50 text-red-800",
  medium: "border-amber-300 bg-amber-50 text-amber-800",
  low: "border-nal-border bg-white text-nal-slate",
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CommandCenterPage() {
  const [data, setData] = useState<CommandCenter | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCommandCenter().then(setData).catch(() => setError(true));
  }, []);

  if (error)
    return (
      <p className="mx-auto max-w-3xl px-4 py-20 text-center text-nal-slate">
        Could not load the command center. Are you logged in as a super admin?
      </p>
    );
  if (!data)
    return (
      <p className="mx-auto max-w-3xl px-4 py-20 text-center text-nal-slate">
        Loading…
      </p>
    );

  const TODAY: { key: keyof CommandCenter["today"]; label: string }[] = [
    { key: "signups", label: "New signups today" },
    { key: "logins", label: "Users logged in today" },
    { key: "enrollments", label: "Enrollments today" },
    { key: "lessons_completed", label: "Lessons completed today" },
  ];

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">
          Super Admin
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-nal-navy md:text-3xl">
          Command Center
        </h1>
        <p className="mt-1 text-sm text-nal-slate">
          Everything that needs eyes today · generated{" "}
          {fmtTime(data.generated_at)}
        </p>

        {/* Today */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TODAY.map((m) => (
            <div
              key={m.key}
              className="rounded-2xl border border-nal-border bg-white p-5 shadow-soft"
            >
              <p className="font-display text-3xl font-extrabold text-nal-navy">
                {data.today[m.key]}
              </p>
              <p className="mt-1 text-sm text-nal-slate">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <section className="mt-8 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-nal-navy">
            Alerts
          </h2>
          {data.alerts.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-nal-border bg-nal-parchment/40 p-6 text-center text-sm text-nal-slate">
              ✅ Nothing is silently going wrong right now.
            </div>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {data.alerts.map((a, i) => (
                <li key={i}>
                  <Link
                    href={a.link}
                    className={`block rounded-xl border p-3.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-soft ${SEVERITY_STYLE[a.severity]}`}
                  >
                    <span className="mr-2 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {a.severity}
                    </span>
                    {a.message}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Live sessions next 48h */}
        <section className="mt-6 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-nal-navy">
            Live sessions — next 48 hours
          </h2>
          {data.live_next_48h.length === 0 ? (
            <p className="mt-4 text-sm text-nal-slate">
              No sessions scheduled in the next 48 hours.{" "}
              <Link href="/events/dashboard" className="text-nal-saffron hover:underline">
                Schedule one →
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {data.live_next_48h.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-nal-border p-3.5"
                >
                  <div>
                    <p className="font-medium text-nal-navy">{s.title}</p>
                    <p className="text-xs text-nal-slate">{fmtTime(s.start_time)}</p>
                  </div>
                  {s.has_join_link ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Join link set
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      ⚠ No join link
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* People & roles */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-nal-navy">People &amp; roles</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="font-display text-2xl font-extrabold text-nal-navy">{data.people.total}</p>
                <p className="text-xs text-nal-slate">Total users</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-nal-navy">{data.people.new_this_week}</p>
                <p className="text-xs text-nal-slate">New this week</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-nal-navy">{data.people.active_this_week}</p>
                <p className="text-xs text-nal-slate">Active this week</p>
              </div>
              <div>
                <p className={`font-display text-2xl font-extrabold ${data.people.unverified_emails > 0 ? "text-amber-600" : "text-nal-navy"}`}>
                  {data.people.unverified_emails}
                </p>
                <p className="text-xs text-nal-slate">Unverified emails</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(data.people.by_role).map(([role, n]) => (
                <Link
                  key={role}
                  href="/admin/users"
                  className="rounded-full border border-nal-border bg-nal-parchment/50 px-3 py-1 text-xs font-semibold capitalize text-nal-navy transition hover:border-nal-saffron"
                >
                  {role.replace(/_/g, " ")}: {n}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-nal-navy">Platform</h2>
            <ul className="mt-4 space-y-2 text-sm text-nal-slate">
              <li className="flex justify-between gap-2">
                <span>Debug mode</span>
                <span className={`font-semibold ${data.platform.debug ? "text-amber-600" : "text-emerald-700"}`}>
                  {data.platform.debug ? "ON (dev)" : "off"}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Email backend</span>
                <span className="font-semibold text-nal-navy">{data.platform.email_backend}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Database</span>
                <span className="font-semibold text-nal-navy">{data.platform.database_engine}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Time zone</span>
                <span className="font-semibold text-nal-navy">{data.platform.time_zone}</span>
              </li>
            </ul>
            <h3 className="mt-6 font-display text-sm font-bold text-nal-navy">Quick links</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link className="text-nal-saffron hover:underline" href="/admin/reports">Reports Center →</Link></li>
              <li><Link className="text-nal-saffron hover:underline" href="/admin/users">Manage users →</Link></li>
              <li><Link className="text-nal-saffron hover:underline" href="/admin/applications">Teacher applications →</Link></li>
              <li><Link className="text-nal-saffron hover:underline" href="/admin/course-reviews">Course reviews →</Link></li>
              <li><Link className="text-nal-saffron hover:underline" href="/admin/schools">Schools →</Link></li>
              <li><Link className="text-nal-saffron hover:underline" href="/admin/audit-logs">Audit logs →</Link></li>
            </ul>
          </section>
        </div>

        {/* Operations inbox (shared component) */}
        <OpsInbox attention={data.attention} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole allow={allow}>
      <CommandCenterPage />
    </RequireRole>
  );
}
