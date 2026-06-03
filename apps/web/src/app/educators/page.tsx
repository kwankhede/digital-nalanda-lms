import type { Metadata } from "next";
import { getAllEducators } from "@/lib/api";
import EducatorsBrowser from "@/components/EducatorsBrowser";
import { EDUCATORS_FALLBACK } from "@/lib/educatorsFallback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Educators & Mentors | Digital Nalanda",
  description:
    "Meet the educators and mentors who guide every Digital Nalanda learner personally — filter by school and explore their profiles.",
};

export default async function EducatorsPage() {
  const fetched = await getAllEducators();
  const educators = fetched.length > 0 ? fetched : EDUCATORS_FALLBACK;

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">
          Educators &amp; Mentors
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-nal-navy">
          The people who teach &amp; mentor
        </h1>
        <p className="mt-3 max-w-2xl text-nal-slate">
          A team of 20+ educators and 300+ mentors who guide every learner
          personally — patiently, and free of cost.
        </p>

        {educators.length === 0 ? (
          <p className="mt-10 text-nal-slate">Educator profiles will appear here soon.</p>
        ) : (
          <EducatorsBrowser educators={educators} />
        )}
      </div>
    </div>
  );
}
