"use client";

import { getActiveAnnouncements } from "@/lib/notifications";
import { useApi } from "@/lib/useApi";
import { FALLBACK_ANNOUNCEMENTS } from "@/lib/homeFallbacks";

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function AnnouncementsPage() {
  const { data, loading } = useApi(() => getActiveAnnouncements());
  const items = data && data.length > 0 ? data : FALLBACK_ANNOUNCEMENTS;

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">News</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">
          Latest Announcements
        </h1>
        <p className="mt-3 max-w-2xl text-nal-slate">
          Updates from the Digital Nalanda community — new courses, events and opportunities.
        </p>

        {loading ? (
          <ul className="mt-10 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-24 animate-pulse rounded-2xl bg-white/60" />
            ))}
          </ul>
        ) : (
          <ul className="mt-10 space-y-4">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-4 rounded-2xl border border-nal-border bg-white p-5 shadow-soft"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nal-saffron/15 text-nal-saffron">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l14-6v14L3 13z" /><path d="M7 13v4a2 2 0 0 0 4 0" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-nal-navy">{a.title}</h2>
                  {a.content && <p className="mt-1 text-sm text-nal-slate">{a.content}</p>}
                  {fmtDate(a.start_date) && (
                    <p className="mt-2 text-xs font-medium text-nal-slate">{fmtDate(a.start_date)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
