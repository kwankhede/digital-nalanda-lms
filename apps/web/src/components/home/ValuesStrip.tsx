import FadeInSection from "@/components/anim/FadeInSection";

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const VALUES = [
  {
    title: "Educate",
    line: "Knowledge empowers.",
    icon: (<svg className="h-7 w-7" viewBox="0 0 24 24" {...S}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M7 9.5V15c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V9.5"/></svg>),
  },
  {
    title: "Agitate",
    line: "Awareness leads to change.",
    icon: (<svg className="h-7 w-7" viewBox="0 0 24 24" {...S}><path d="M3 11l11-5v12L3 13z"/><path d="M14 8a3 3 0 0 1 0 6"/><path d="M6 13v4a2 2 0 0 0 4 0"/></svg>),
  },
  {
    title: "Organize",
    line: "Collective action creates impact.",
    icon: (<svg className="h-7 w-7" viewBox="0 0 24 24" {...S}><circle cx="8" cy="9" r="2.6"/><circle cx="16" cy="9" r="2.6"/><path d="M3 19c0-2.5 2.2-4.2 5-4.2S13 16.5 13 19M11 19c0-2.5 2.2-4.2 5-4.2s5 1.7 5 4.2"/></svg>),
  },
];

export default function ValuesStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        {/* Values */}
        <FadeInSection className="relative overflow-hidden rounded-2xl border border-nal-border bg-white p-8 shadow-soft md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-nal-saffron via-nal-gold to-nal-terracotta" />
          <div className="grid gap-8 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="group">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nal-navy text-white shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-nal-saffron group-hover:shadow-lift">
                  {v.icon}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-nal-navy">{v.title}</h3>
                <p className="mt-1.5 text-sm text-nal-slate">{v.line}</p>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* Quote */}
        <FadeInSection
          delayMs={120}
          className="relative overflow-hidden rounded-2xl bg-nal-navy p-8 text-white shadow-soft"
        >
          {/* subtle book line-art */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 opacity-10"
            viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.4"
          >
            <path d="M3 6h7v14H3zM14 6h7v14h-7z" />
            <path d="M6 10h1M17 10h1M6 13h1M17 13h1" />
          </svg>
          <p className="text-5xl leading-none text-nal-saffron">&ldquo;</p>
          <blockquote className="mt-2 font-display text-xl font-semibold leading-snug">
            We are Indians, firstly and lastly. Nothing is more important than that.
          </blockquote>
          <p className="mt-4 text-sm text-white/70">— Dr. B. R. Ambedkar</p>
        </FadeInSection>
      </div>
    </section>
  );
}
