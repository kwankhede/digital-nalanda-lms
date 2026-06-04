import type { Metadata } from "next";
import { getHomeUpcoming, type HomeUpcomingItem } from "@/lib/api";
import { sampleUpcoming } from "@/lib/homeFallbacks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Classes & Events | Digital Nalanda",
  description:
    "Upcoming live classes, workshops and events at Digital Nalanda — free and open to every learner.",
};

function fmt(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    month: d.toLocaleDateString(undefined, { month: "short" }),
    full: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function Row({ it }: { it: HomeUpcomingItem }) {
  const d = fmt(it.start_time);
  const external = Boolean(it.join_or_register_url);
  return (
    <li className="group flex items-start gap-3 rounded-xl border border-nal-border bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-nal-navy text-white transition-colors group-hover:bg-nal-saffron">
        <span className="text-sm font-extrabold leading-none">{d.day}</span>
        <span className="text-[9px] uppercase tracking-wide">{d.month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-sm font-bold leading-snug text-nal-navy">{it.title}</h3>
        <p className="mt-0.5 text-[11px] text-nal-slate">
          {d.full} · {d.time}{it.speaker_or_mentor ? ` · ${it.speaker_or_mentor}` : ""}
        </p>
        {it.description && <p className="mt-1 line-clamp-2 text-xs text-nal-slate">{it.description}</p>}
      </div>
      {external && (
        <a
          href={it.join_or_register_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 shrink-0 rounded-md bg-nal-saffron px-2.5 py-1 text-[11px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          {it.type === "live_session" ? "Join" : "Register"}
        </a>
      )}
    </li>
  );
}

function Column({ title, subtitle, items }: { title: string; subtitle: string; items: HomeUpcomingItem[] }) {
  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-nal-border pb-3">
        <h2 className="font-display text-2xl font-bold text-nal-navy">{title}</h2>
        <span className="text-sm text-nal-slate">{items.length}</span>
      </div>
      <p className="mt-2 text-sm text-nal-slate">{subtitle}</p>
      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-nal-border bg-white/50 p-6 text-sm text-nal-slate">
          Nothing scheduled right now — check back soon.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((it) => <Row key={it.id} it={it} />)}
        </ul>
      )}
    </section>
  );
}

export default async function EventsPage() {
  const fetched = await getHomeUpcoming({ limit: 100, days: 365 });
  const items = (fetched.length > 0 ? fetched : sampleUpcoming()).sort(
    (a, b) => +new Date(a.start_time) - +new Date(b.start_time),
  );
  const liveClasses = items.filter((i) => i.type === "live_session");
  const events = items.filter((i) => i.type === "event");

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">What&apos;s on</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">
          Live Classes &amp; Events
        </h1>
        <p className="mt-3 max-w-2xl text-nal-slate">
          Join upcoming live classes, weekend workshops and events — all free and open to every learner.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <Column
            title="Live Classes"
            subtitle="Interactive online sessions with our educators and mentors."
            items={liveClasses}
          />
          <Column
            title="Events"
            subtitle="Meetups, open days and community gatherings."
            items={events}
          />
        </div>
      </div>
    </div>
  );
}
