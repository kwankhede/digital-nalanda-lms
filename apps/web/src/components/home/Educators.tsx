"use client";

import { getEducators } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { EDUCATORS } from "@/lib/homeData";
import SectionHeading from "./SectionHeading";
import FadeInSection from "@/components/anim/FadeInSection";
import { CardSkeleton } from "./SectionState";

export default function Educators() {
  const { data, loading } = useApi(getEducators);
  const educators = data && data.length > 0 ? data : EDUCATORS;

  return (
    <section id="educators" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHeading
        center
        eyebrow="20+ educators · 300+ mentors"
        title="Learn from dedicated educators"
        subtitle="Experienced teachers and mentors who guide every learner personally."
      />
      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {educators.slice(0, 6).map((e, i) => (
            <FadeInSection key={(e as { id?: number }).id ?? e.name} delayMs={i * 60}>
              <div className="group flex h-full items-center gap-4 rounded-2xl border border-nal-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/50 hover:shadow-lift">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-nal-navy text-2xl font-bold text-white transition-colors group-hover:bg-nal-saffron">
                  {e.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-nal-navy">{e.name}</p>
                  <p className="text-sm text-nal-slate">{e.expertise}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-nal-parchment px-2.5 py-0.5 text-xs font-semibold text-nal-saffron">
                    {e.school}
                  </span>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      )}
    </section>
  );
}
