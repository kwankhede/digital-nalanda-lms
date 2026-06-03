"use client";

import SectionHeading from "./SectionHeading";
import { useInViewReveal } from "@/lib/useInViewReveal";

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const c = "h-6 w-6";

const MILESTONES = [
  { year: "2013", label: "Nalanda Founded", icon: (
    <svg className={c} viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6 6l12 12M18 6 6 18"/></svg>) },
  { year: "2014", label: "First Library", icon: (
    <svg className={c} viewBox="0 0 24 24" {...S}><path d="M4 5h7v14H4zM13 5h7v14h-7z"/></svg>) },
  { year: "2018", label: "Nalanda Labs", icon: (
    <svg className={c} viewBox="0 0 24 24" {...S}><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M9 3h6"/></svg>) },
  { year: "2019", label: "Community Libraries", icon: (
    <svg className={c} viewBox="0 0 24 24" {...S}><path d="M3 7h5l2 2h11v9H3z"/><path d="M3 7V5h5l2 2"/></svg>) },
  { year: "2020", label: "Digital Nalanda", icon: (
    <svg className={c} viewBox="0 0 24 24" {...S}><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20"/></svg>) },
  { year: "2026", label: "Nalanda Campus", icon: (
    <svg className={c} viewBox="0 0 24 24" {...S}><path d="M4 21V8a8 8 0 0 1 16 0v13"/><path d="M4 21h16"/></svg>) },
];

export default function JourneyTimeline() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>({ threshold: 0.25 });

  return (
    <section className="bg-nal-parchment/50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHeading center eyebrow="Our Journey" title="A movement built over more than a decade." />

        <div ref={ref} className="relative mt-14">
          {/* decorative watercolor blobs at the ends */}
          <div className="pointer-events-none absolute -left-6 top-0 -z-0 hidden md:block" aria-hidden="true">
            <div className="h-24 w-24 rounded-full bg-nal-teal/20 blur-md" />
            <div className="-mt-10 ml-8 h-16 w-16 rounded-full bg-nal-saffron/20 blur-md" />
          </div>
          <div className="pointer-events-none absolute -right-6 top-0 -z-0 hidden md:block" aria-hidden="true">
            <div className="ml-auto h-24 w-24 rounded-full bg-nal-gold/20 blur-md" />
            <div className="-mt-10 h-16 w-16 rounded-full bg-nal-teal/20 blur-md" />
          </div>
          {/* desktop connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-0.5 bg-nal-saffron/30 md:block" />
          <div
            className={`timeline-line pointer-events-none absolute left-0 right-0 top-7 hidden h-0.5 bg-nal-saffron md:block ${inView ? "is-visible" : ""}`}
          />

          <ol className="grid gap-10 md:grid-cols-6 md:gap-4">
            {MILESTONES.map((m, i) => (
              <li
                key={m.year}
                className="group relative flex items-center gap-4 md:flex-col md:gap-3 md:text-center"
                style={{
                  transition: "opacity .6s ease-out, transform .6s ease-out",
                  transitionDelay: `${i * 110}ms`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "scale(.85)",
                }}
              >
                <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-nal-saffron bg-nal-cream text-nal-navy shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-nal-saffron group-hover:text-white group-hover:shadow-lift">
                  {m.icon}
                </span>
                <div>
                  <p className="font-display text-2xl font-bold text-nal-saffron">{m.year}</p>
                  <p className="mt-0.5 text-sm font-medium text-nal-navy">{m.label}</p>
                </div>
                {/* vertical connector on mobile */}
                {i < MILESTONES.length - 1 && (
                  <span className="absolute left-7 top-14 h-10 w-0.5 bg-nal-saffron/30 md:hidden" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
