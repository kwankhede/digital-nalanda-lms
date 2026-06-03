"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFeaturedStories } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeading from "./SectionHeading";

export default function SuccessStories() {
  const { data, loading, error } = useApi(getFeaturedStories);
  const stories = data ?? [];
  const [i, setI] = useState(0);

  // Auto-rotate every 6s once stories are loaded.
  useEffect(() => {
    if (stories.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % stories.length), 6000);
    return () => clearInterval(t);
  }, [stories.length]);

  // Hide the section entirely if it errors or is empty.
  if (error || (!loading && stories.length === 0)) return null;

  const go = (d: number) =>
    setI((p) => (p + d + stories.length) % stories.length);
  const story = stories[i];

  return (
    <section className="bg-brand-navy text-white">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeading eyebrow="Real outcomes" title="Success Stories" />

        {loading || !story ? (
          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white/10" />
        ) : (
          <>
            <div className="mt-8 grid items-center gap-8 md:grid-cols-[200px_1fr]">
              <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-6xl">
                {story.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.featured_image} alt={story.student_name} className="h-full w-full object-cover" />
                ) : (
                  "🎓"
                )}
              </div>
              <blockquote>
                <p className="text-xl leading-relaxed text-white/90">
                  “{story.quote || story.summary}”
                </p>
                <footer className="mt-5">
                  <p className="font-bold">{story.student_name}</p>
                  <p className="text-sm text-brand-orange">{story.institution}</p>
                </footer>
              </blockquote>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => go(-1)} aria-label="Previous story" className="rounded-full border border-white/30 px-3 py-1 hover:bg-white/10">←</button>
              <button onClick={() => go(1)} aria-label="Next story" className="rounded-full border border-white/30 px-3 py-1 hover:bg-white/10">→</button>
              <div className="ml-2 flex gap-1.5">
                {stories.map((_, idx) => (
                  <span key={idx} className={`h-2 w-2 rounded-full ${idx === i ? "bg-brand-orange" : "bg-white/30"}`} />
                ))}
              </div>
              <Link href="/stories" className="ml-auto text-sm font-semibold text-brand-orange hover:underline">
                View all stories →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
