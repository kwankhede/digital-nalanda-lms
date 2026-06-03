"use client";

import { getActiveAnnouncements, type Announcement } from "@/lib/notifications";
import { useApi } from "@/lib/useApi";

// Shown only if the announcements API returns nothing (keeps the section alive
// and matching the design until real announcements are added in the admin).
const FALLBACK: Announcement[] = [
  { id: -1, title: "New course on 'Ethics & Leadership' is now live!", content: "", audience: "all", start_date: "2025-05-20" },
  { id: -2, title: "Digital Nalanda Annual Educators Meet on June 5, 2025.", content: "", audience: "all", start_date: "2025-05-18" },
  { id: -3, title: "Community Library Grant applications are now open.", content: "", audience: "all", start_date: "2025-05-15" },
];

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function LatestAnnouncements() {
  const { data, loading } = useApi(() => getActiveAnnouncements());
  const items = (data && data.length > 0 ? data : FALLBACK).slice(0, 3);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-nal-parchment bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-nal-navy">Latest Announcements</h3>
        <a href="/notifications" className="text-xs font-semibold text-nal-saffron hover:underline">
          View All →
        </a>
      </div>

      {loading ? (
        <ul className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-nal-parchment" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-nal-parchment" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-nal-parchment" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nal-saffron/15 text-nal-saffron">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l14-6v14L3 13z" /><path d="M7 13v4a2 2 0 0 0 4 0" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-nal-navy">{a.title}</p>
                {a.content && <p className="mt-0.5 line-clamp-2 text-xs text-nal-slate">{a.content}</p>}
                {fmtDate(a.start_date) && (
                  <p className="mt-0.5 text-xs text-nal-slate">{fmtDate(a.start_date)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
