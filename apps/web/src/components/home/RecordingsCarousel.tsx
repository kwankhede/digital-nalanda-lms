"use client";

import { useRef } from "react";
import type { HomeRecording } from "@/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Sample recordings shown only when the API returns none, so the carousel is
// never empty. Latest first. They auto-replace once real recordings exist.
function sampleRecordings(): HomeRecording[] {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  const vid = "I9q-7GPQr1Y";
  const base = {
    slug: "",
    recording_url: `https://www.youtube.com/watch?v=${vid}`,
    recording_thumbnail_url: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
    course_title: null as string | null,
  };
  return [
    { ...base, id: -1, title: "Mastering Quadratic Equations", recording_title: "Mastering Quadratic Equations", recording_duration_minutes: 58, start_time: daysAgo(2), mentor_name: "Prof. Anant Kumar" },
    { ...base, id: -2, title: "The Indian Constitution Explained", recording_title: "The Indian Constitution Explained", recording_duration_minutes: 64, start_time: daysAgo(6), mentor_name: "Adv. Meera Krishnan" },
    { ...base, id: -3, title: "Introduction to Python Programming", recording_title: "Introduction to Python Programming", recording_duration_minutes: 72, start_time: daysAgo(11), mentor_name: "Meera Joshi" },
    { ...base, id: -4, title: "Editorial Analysis & Current Affairs", recording_title: "Editorial Analysis & Current Affairs", recording_duration_minutes: 45, start_time: daysAgo(16), mentor_name: "Fatima Ansari" },
    { ...base, id: -5, title: "Foundations of Spoken English", recording_title: "Foundations of Spoken English", recording_duration_minutes: 50, start_time: daysAgo(23), mentor_name: "Ven. Tenzin Dorje" },
  ];
}

export default function RecordingsCarousel({
  recordings,
}: {
  recordings: HomeRecording[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Use real recordings when available, otherwise show samples. Always latest first.
  const shown = (recordings && recordings.length > 0 ? recordings : sampleRecordings())
    .slice()
    .sort((a, b) => +new Date(b.start_time) - +new Date(a.start_time));

  function scroll(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-nal-navy md:text-3xl">
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
        {shown.map((r) => (
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
