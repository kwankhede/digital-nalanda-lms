import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="parchment relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_1.15fr] md:gap-12 md:py-24">
        {/* Left: copy */}
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-nal-navy animate-fade-up md:text-6xl">
            Knowledge
            <br />
            from the past.
            <br />
            <span className="text-nal-saffron">Opportunities</span>
            <br />
            <span className="text-nal-saffron">for the future.</span>
          </h1>
          <p
            className="mt-6 max-w-md text-lg text-nal-slate animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            Digital Nalanda is a global learning ecosystem inspired by wisdom,
            rooted in justice, and driven by technology.
          </p>
          <div
            className="mt-8 flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "220ms" }}
          >
            <Link
              href="/courses"
              className="rounded-md bg-nal-navy px-7 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              Explore Courses →
            </Link>
            <Link
              href="/#ecosystem"
              className="rounded-md border border-nal-navy/25 bg-white px-7 py-3 text-base font-semibold text-nal-navy transition hover:border-nal-navy/50 hover:bg-nal-parchment"
            >
              Explore Libraries
            </Link>
          </div>
        </div>

        {/* Right: editorial hero illustration — larger, blended onto the page. */}
        <div className="relative isolate animate-fade-in rounded-2xl bg-nal-cream md:-mr-8 lg:-mr-16" style={{ animationDelay: "150ms" }}>
          <Image
            src="/images/home/hero.webp"
            alt="Dr. B. R. Ambedkar guiding students at a laptop showing the Digital Nalanda mark, with books and digital learning elements"
            width={1400}
            height={933}
            priority
            sizes="(max-width: 768px) 100vw, 760px"
            className="h-auto w-full mix-blend-multiply"
          />
        </div>
      </div>
    </section>
  );
}
