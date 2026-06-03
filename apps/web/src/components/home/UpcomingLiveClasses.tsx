import Link from "next/link";
import type { HomeUpcomingItem } from "@/lib/api";

function badge(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    month: d.toLocaleDateString(undefined, { month: "short" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function UpcomingLiveClasses({ items }: { items: HomeUpcomingItem[] }) {
  // Live classes first, then events; show at most three on the homepage.
  const sorted = [...(items ?? [])].sort((a, b) =>
    a.type === b.type ? 0 : a.type === "live_session" ? -1 : 1,
  );
  const shown = sorted.slice(0, 3);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-nal-parchment bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-nal-navy">Upcoming Live Classes</h3>
        <Link href="/#events" className="text-xs font-semibold text-nal-saffron hover:underline">
          View All →
        </Link>
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 flex-1 text-sm text-nal-slate">
          No live classes scheduled right now. Check back soon.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {shown.map((it) => {
            const b = badge(it.start_time);
            return (
              <li key={it.id} className="group flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-nal-navy text-white">
                  <span className="text-base font-extrabold leading-none">{b.day}</span>
                  <span className="text-[10px] uppercase tracking-wide">{b.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-nal-navy">{it.title}</p>
                  {it.speaker_or_mentor && (
                    <p className="truncate text-xs text-nal-slate">By {it.speaker_or_mentor}</p>
                  )}
                  <p className="text-xs text-nal-slate">{b.time}</p>
                </div>
                {it.join_or_register_url && (
                  <a
                    href={it.join_or_register_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={it.type === "live_session" ? "Join" : "Register"}
                    className="mt-1 flex h-8 w-8 items-center justify-center rounded-md border border-nal-parchment text-nal-saffron transition group-hover:border-nal-saffron group-hover:bg-nal-saffron group-hover:text-white"
                  >
                    →
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
