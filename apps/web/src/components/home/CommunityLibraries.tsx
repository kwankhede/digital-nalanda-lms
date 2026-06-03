"use client";

import { getCommunityLibraries } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeading from "./SectionHeading";
import { CardSkeleton, EmptyState, ErrorState } from "./SectionState";

export default function CommunityLibraries() {
  const { data, loading, error } = useApi(getCommunityLibraries);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="On the ground"
        title="14 Community Libraries"
        subtitle="Beyond the screen — physical learning centres bringing books, internet, and mentorship to underserved communities."
      />
      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="Library details are coming soon." />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((l) => (
            <div
              key={l.id ?? l.name}
              className="overflow-hidden rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-blue/20 to-brand-orange/20 text-3xl">
                📚
              </div>
              <div className="p-4">
                <h3 className="font-bold text-brand-navy">{l.name}</h3>
                <p className="text-xs text-brand-blue">{l.location}</p>
                <p className="mt-1 text-sm text-gray-500">{l.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
