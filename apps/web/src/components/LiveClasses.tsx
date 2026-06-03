"use client";

import { useEffect, useState } from "react";
import { getLiveSessions, joinSession, type LiveSession } from "@/lib/student";
import AddToCalendar from "@/components/AddToCalendar";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short", day: "numeric", month: "short",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });
}
function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

function SessionCard({
  s,
  onJoin,
}: {
  s: LiveSession;
  onJoin?: (s: LiveSession) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-navy">{s.title}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {fmtDate(s.start_time)} · {fmtTime(s.start_time)}
            {s.mentor_name ? ` · ${s.mentor_name}` : ""}
          </p>
        </div>
        {onJoin ? (
          <div className="flex shrink-0 items-center gap-2">
            <AddToCalendar event={{ slug: s.slug, title: s.title, description: s.description, start_time: s.start_time, end_time: s.end_time, joinUrl: s.zoom_join_url }} />
            {s.zoom_join_url && (
              <button
                onClick={() => onJoin(s)}
                className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Join Zoom
              </button>
            )}
          </div>
        ) : s.recording_url ? (
          <a
            href={s.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md border border-brand-blue px-4 py-1.5 text-sm font-medium text-brand-blue hover:bg-blue-50"
          >
            Watch Recording
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function LiveClasses() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin(s: LiveSession) {
    try {
      const { zoom_join_url } = await joinSession(s.slug);
      if (zoom_join_url) window.open(zoom_join_url, "_blank", "noopener");
      else alert("Join link not available yet.");
    } catch {
      alert("Could not join the session.");
    }
  }

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-bold text-brand-navy">Live Classes</h2>
        <p className="mt-4 text-sm text-gray-400">Loading…</p>
      </section>
    );
  }

  const now = Date.now();
  const today = sessions.filter(
    (s) => isToday(s.start_time) && s.status !== "completed",
  );
  const upcoming = sessions.filter(
    (s) =>
      new Date(s.start_time).getTime() > now &&
      !isToday(s.start_time) &&
      s.status !== "completed",
  );
  const recordings = sessions.filter(
    (s) => s.status === "completed" && s.recording_url,
  );

  if (sessions.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-bold text-brand-navy">Live Classes</h2>
        <p className="mt-4 text-sm text-gray-500">No live classes scheduled yet.</p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-brand-navy">Live Classes</h2>

      {today.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-green-600">Today</h3>
          <div className="mt-2 space-y-3">
            {today.map((s) => (
              <SessionCard key={s.id} s={s} onJoin={handleJoin} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500">Upcoming</h3>
          <div className="mt-2 space-y-3">
            {upcoming.map((s) => (
              <SessionCard key={s.id} s={s} onJoin={handleJoin} />
            ))}
          </div>
        </div>
      )}

      {recordings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500">Past Recordings</h3>
          <div className="mt-2 space-y-3">
            {recordings.map((s) => (
              <SessionCard key={s.id} s={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
