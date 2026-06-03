import { STEPS } from "@/lib/homeData";
import SectionHeading from "./SectionHeading";

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading center eyebrow="Simple" title="How Learning Works" />
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {STEPS.map((s) => (
          <li key={s.n} className="relative text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-lg font-bold text-white">
              {s.n}
            </div>
            <h3 className="mt-3 text-sm font-bold text-brand-navy">{s.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{s.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
