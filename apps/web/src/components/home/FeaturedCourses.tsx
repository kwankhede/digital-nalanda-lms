"use client";

import Link from "next/link";
import { getFeaturedCourses } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeading from "./SectionHeading";
import { CardSkeleton, EmptyState, ErrorState } from "./SectionState";

export default function FeaturedCourses() {
  const { data, loading, error } = useApi(getFeaturedCourses);
  const featured = (data ?? []).slice(0, 4);

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <SectionHeading
            eyebrow="Start today"
            title="Featured Courses"
            subtitle="Free, self-paced, and built for real outcomes."
          />
          <Link
            href="/courses"
            className="hidden shrink-0 text-sm font-semibold text-brand-blue hover:underline sm:block"
          >
            View all courses →
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={4} />
        ) : error ? (
          <ErrorState message={error} />
        ) : featured.length === 0 ? (
          <EmptyState message="Courses are coming soon." />
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                {c.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnail_url} alt={c.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="h-36 w-full bg-brand-navy/10" />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap gap-2">
                    {c.category && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                        {c.category.name}
                      </span>
                    )}
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-600">
                      {c.level}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-brand-navy">{c.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-gray-500">{c.short_description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-400">{c.language}</span>
                    {c.is_free && <span className="font-bold text-green-600">Free</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
