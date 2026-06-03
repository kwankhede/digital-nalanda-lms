"use client";

import { getEducators } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeading from "./SectionHeading";
import { CardSkeleton, EmptyState, ErrorState } from "./SectionState";

export default function Educators() {
  const { data, loading, error } = useApi(getEducators);

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          center
          eyebrow="20+ educators & mentors"
          title="Learn From Dedicated Educators"
          subtitle="Experienced teachers and mentors who guide every learner personally."
        />
        {loading ? (
          <CardSkeleton count={6} />
        ) : error ? (
          <ErrorState message={error} />
        ) : !data || data.length === 0 ? (
          <EmptyState message="Educator profiles are coming soon." />
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((e) => (
              <div
                key={e.id ?? e.name}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xl font-bold text-white">
                  {e.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-brand-navy">{e.name}</p>
                  <p className="text-sm text-gray-500">{e.expertise}</p>
                  <p className="text-xs font-semibold text-brand-blue">{e.school}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
