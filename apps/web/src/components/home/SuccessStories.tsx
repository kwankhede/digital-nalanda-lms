"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFeaturedStories } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { STORIES } from "@/lib/homeData";
import SectionHeading from "./SectionHeading";

interface NormStory {
  name: string;
  institution: string;
  quote: string;
  image?: string;
}

export default function SuccessStories() {
  const { data, loading } = useApi(getFeaturedStories);

  const stories: NormStory[] =
    data && data.length > 0
      ? data.map((s) => ({
          name: s.student_name,
          institution: s.institution,
          quote: s.quote || s.summary,
          image: s.featured_image,
        }))
      : STORIES.map((s) => ({ name: s.name, institution: s.credential, quote: s.quote }));

  const [i, setI] = useState(0);
  useEffect(() => {
    if (stories.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % stories.length), 6500);
    return () => clearInterval(t);
  }, [stories.length]);

  const go = (d: number) => setI((p) => (p + d + stories.length) % stories.length);
  const story = stories[i];

  return (
    <section className="relative overflow-hidden bg-nal-navy text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeading eyebrow="Real outcomes" title="Success stories" />

        {loading || !story ? (
          <div className="mt-10 h-48 animate-pulse rounded-2xl bg-white/10" />
        ) : (
          <>
            <div className="mt-10 grid items-center gap-8 md:grid-cols-[180px_1fr]">
              <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-6xl ring-1 ring-white/15">
                {story.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
                ) : (
                  "🎓"
                )}
              </div>
              <blockquote>
                <p className="text-3xl leading-none text-nal-saffron">&ldquo;</p>
                <p className="-mt-3 font-display text-xl leading-relaxed text-white/90 md:text-2xl">
                  {story.quote}
                </p>
                <footer className="mt-5">
                  <p className="font-bold">{story.name}</p>
                  <p className="text-sm text-nal-gold">{story.institution}</p>
                </footer>
              </blockquote>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => go(-1)} aria-label="Previous story" className="rounded-full border border-white/30 px-3 py-1 transition hover:bg-white/10">←</button>
              <button onClick={() => go(1)} aria-label="Next story" className="rounded-full border border-white/30 px-3 py-1 transition hover:bg-white/10">→</button>
              <div className="ml-2 flex gap-1.5">
                {stories.map((_, idx) => (
                  <span key={idx} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-nal-saffron" : "w-2 bg-white/30"}`} />
                ))}
              </div>
              <Link href="/stories" className="ml-auto text-sm font-semibold text-nal-gold hover:underline">
                View all stories →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
