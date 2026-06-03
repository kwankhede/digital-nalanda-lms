import type { HomeUpcomingItem } from "@/lib/api";

function dateBadge(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    month: d.toLocaleDateString(undefined, { month: "short" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

const TYPE_LABEL: Record<string, string> = {
  live_session: "Live Class",
  event: "Event",
};

export default function UpcomingEvents({
  items,
}: {
  items: HomeUpcomingItem[];
}) {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-extrabold text-brand-navy">
          Upcoming Classes &amp; Events
        </h2>
        <p className="mt-2 text-gray-500">Next 30 days.</p>

        {!items || items.length === 0 ? (
          <p className="mt-6 text-gray-500">
            No upcoming classes or events scheduled right now. Check back soon.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const b = dateBadge(it.start_time);
              return (
                <article
                  key={it.id}
                  className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-navy text-white">
                    <span className="text-lg font-extrabold leading-none">
                      {b.day}
                    </span>
                    <span className="text-xs uppercase">{b.month}</span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                        {TYPE_LABEL[it.type] ?? it.type}
                      </span>
                      <span className="text-xs text-gray-400">{b.time}</span>
                    </div>
                    <h3 className="mt-1 font-bold text-brand-navy">{it.title}</h3>
                    {it.speaker_or_mentor && (
                      <p className="text-xs text-gray-500">
                        {it.speaker_or_mentor}
                      </p>
                    )}
                    {it.join_or_register_url && (
                      <a
                        href={it.join_or_register_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-fit rounded-md bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
                      >
                        {it.type === "live_session" ? "Join" : "Register"}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
