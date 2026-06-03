"use client";

import { getCommunityLibraries } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { COMMUNITY_LIBRARIES } from "@/lib/homeData";
import SectionHeading from "./SectionHeading";
import FadeInSection from "@/components/anim/FadeInSection";
import { CardSkeleton } from "./SectionState";

export default function CommunityLibraries() {
  const { data, loading } = useApi(getCommunityLibraries);
  const libraries = data && data.length > 0 ? data : COMMUNITY_LIBRARIES;

  return (
    <section id="community-libraries" className="bg-nal-parchment/50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHeading
          center
          eyebrow="On the ground"
          title="14 community libraries"
          subtitle="Beyond the screen — physical learning centres bringing books, internet, and mentorship to underserved communities."
        />
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {libraries.slice(0, 4).map((l, i) => (
              <FadeInSection key={(l as { id?: number }).id ?? l.name} delayMs={i * 60}>
                <div className="group h-full overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/50 hover:shadow-lift">
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-nal-teal/15 via-nal-gold/15 to-nal-saffron/15 text-4xl transition-transform duration-500 group-hover:scale-105">
                    📚
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-nal-navy">{l.name}</h3>
                    <p className="text-xs font-semibold text-nal-saffron">{l.location}</p>
                    <p className="mt-2 text-sm text-nal-slate">{l.description}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
