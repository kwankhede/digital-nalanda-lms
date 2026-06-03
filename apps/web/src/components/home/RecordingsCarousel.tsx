"use client";

import { useRef } from "react";
import type { HomeRecording } from "@/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function RecordingsCarousel({
  recordings,
}: {
  recordings: HomeRecording[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Empty state: hide-ish with an elegant message.
  if (!recordings || recordings.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-3xl font-bold text-nal-navy">
          Recent Online Class Recordings
        </h2>
        <p className="mt-3 text-nal-slate">
          Recordings from our live classes will appear here soon.
        </p>
      </section>
    );
  }

  function scroll(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold text-nal-navy">
          Recent Online Class Recordings
        </h2>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="rounded-full border border-nal-border px-3 py-1 text-nal-navy transition hover:bg-nal-parchment"
          >
            ←
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="rounded-full border border-nal-border px-3 py-1 text-nal-navy transition hover:bg-nal-parchment"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="mt-6 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recordings.map((r) => (
          <article
            key={r.id}
            className="group w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="relative h-40 w-full bg-nal-navy/10 overflow-hidden">
              {r.recording_thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.recording_thumbnail_url}
                  alt={r.recording_title || r.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-nal-navy/40">
                  ▶ Recording
                </div>
              )}
              {r.recording_duration_minutes ? (
                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                  {r.recording_duration_minutes} min
                </span>
              ) : null}
            </div>
            <div className="flex flex-col p-4">
              <h3 className="font-display font-bold text-nal-navy">
                {r.recording_title || r.title}
              </h3>
              <p className="mt-1 text-xs text-nal-slate">
                {fmtDate(r.start_time)}
                {r.mentor_name ? ` · ${r.mentor_name}` : ""}
                {r.course_title ? ` · ${r.course_title}` : ""}
              </p>
              <a
                href={r.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 rounded-lg bg-nal-saffron px-4 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                Watch Recording
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
