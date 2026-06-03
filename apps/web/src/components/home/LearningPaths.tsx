"use client";

import { getLearningPaths } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeading from "./SectionHeading";
import { CardSkeleton, EmptyState, ErrorState } from "./SectionState";

export default function LearningPaths() {
  const { data, loading, error } = useApi(getLearningPaths);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="Guided journeys"
        title="Learning Paths"
        subtitle="Curated sequences of courses that take you from beginner to confident — pick a goal and follow the path."
      />
      {loading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="Learning paths are coming soon." />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <div
              key={p.slug}
              className="flex flex-col rounded-xl border border-gray-100 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-2xl">
                {p.icon}
              </div>
              <h3 className="mt-4 font-bold text-brand-navy">{p.name}</h3>
              <p className="mt-1 flex-1 text-sm text-gray-500">{p.description}</p>
              <p className="mt-3 text-xs font-semibold text-brand-blue">
                {p.course_count} courses
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
