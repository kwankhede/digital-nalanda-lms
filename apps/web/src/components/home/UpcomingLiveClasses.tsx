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

// Placeholder classes shown only when no real sessions are scheduled yet, so
// the section matches the design. They auto-replace once live classes exist.
function sampleClasses(): HomeUpcomingItem[] {
  const mk = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const base = {
    type: "live_session" as const,
    description: "",
    end_time: null,
    thumbnail_url: "",
    join_or_register_url: "",
    status: "scheduled",
  };
  return [
    { ...base, id: "s1", title: "Understanding the Buddha's Teachings", speaker_or_mentor: "Ven. Tenzin Dorje", start_time: mk(3, 10) },
    { ...base, id: "s2", title: "The Indian Constitution: A People's Document", speaker_or_mentor: "Adv. Meera Krishnan", start_time: mk(5, 16) },
    { ...base, id: "s3", title: "Leadership for Social Change", speaker_or_mentor: "Prof. Anant Kumar", start_time: mk(7, 11) },
  ];
}

export default function UpcomingLiveClasses({ items }: { items: HomeUpcomingItem[] }) {
  const real = [...(items ?? [])].sort((a, b) =>
    a.type === b.type ? 0 : a.type === "live_session" ? -1 : 1,
  );
  const shown = (real.length > 0 ? real : sampleClasses()).slice(0, 3);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-nal-navy">Upcoming Live Classes</h3>
        <Link href="/#events" className="text-xs font-semibold text-nal-saffron hover:underline">
          View All →
        </Link>
      </div>

      <ul className="mt-5 space-y-4">
        {shown.map((it) => {
          const b = badge(it.start_time);
          const arrowHref = it.join_or_register_url || "/#events";
          const external = Boolean(it.join_or_register_url);
          return (
            <li key={it.id} className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-nal-parchment/60">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-nal-navy text-white transition-colors group-hover:bg-nal-saffron">
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
              <a
                href={arrowHref}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={external ? "Join" : "View live classes"}
                className="mt-1 flex h-8 w-8 items-center justify-center rounded-md border border-nal-border text-nal-saffron transition group-hover:border-nal-saffron group-hover:bg-nal-saffron group-hover:text-white"
              >
                →
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
