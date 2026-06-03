"use client";

import Link from "next/link";
import { getSchools, type SchoolDTO } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { toSlug } from "@/lib/homeData";
import SectionHeading from "./SectionHeading";
import { CardSkeleton } from "./SectionState";
import FadeInSection from "@/components/anim/FadeInSection";

// Reference schools — shown only when the API returns nothing.
const FALLBACK: SchoolDTO[] = [
  { name: "School of Law", slug: toSlug("School of Law"), description: "", icon: "⚖️", image_url: "/images/home/school-law.webp", course_count: 0 },
  { name: "School of Social Sciences", slug: toSlug("School of Social Sciences"), description: "", icon: "👥", image_url: "/images/home/school-social.webp", course_count: 0 },
  { name: "School of Buddhist Studies", slug: toSlug("School of Buddhist Studies"), description: "", icon: "☸️", image_url: "/images/home/school-buddhist.webp", course_count: 0 },
  { name: "School of Data Science", slug: toSlug("School of Data Science"), description: "", icon: "🧠", image_url: "/images/home/school-data.webp", course_count: 0 },
  { name: "School of Design", slug: toSlug("School of Design"), description: "", icon: "✏️", image_url: "/images/home/school-design.webp", course_count: 0 },
  { name: "School of Critical Thought", slug: toSlug("School of Critical Thought"), description: "", icon: "💡", image_url: "/images/home/school-critical.webp", course_count: 0 },
];

export default function SchoolsGrid() {
  const { data, loading } = useApi(getSchools);
  const schools = data && data.length > 0 ? data : FALLBACK;
  const shown = schools.slice(0, 6);

  return (
    <section id="schools" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHeading
        center
        eyebrow="Schools of Digital Nalanda"
        title="Explore knowledge. Develop critical thinking. Create impact."
      />

      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s, i) => (
              <FadeInSection key={s.slug} delayMs={i * 60}>
                <Link
                  href={`/schools/${s.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative isolate flex aspect-[5/4] items-center justify-center overflow-hidden bg-nal-cream">
                    {s.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.image_url}
                          alt={s.name}
                          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-white" />
                      </>
                    ) : (
                      <span className="text-5xl transition-transform duration-500 group-hover:scale-110">
                        {s.icon || "🎓"}
                      </span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-display text-base font-bold text-nal-navy">{s.name}</h3>
                    {s.course_count > 0 && (
                      <p className="mt-1 text-xs font-semibold text-nal-saffron">
                        {s.course_count} courses
                      </p>
                    )}
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/schools"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-nal-navy hover:text-nal-saffron"
            >
              View All Schools
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
