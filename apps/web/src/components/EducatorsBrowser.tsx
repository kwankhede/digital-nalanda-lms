"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EducatorDTO } from "@/lib/api";

type Sort = "featured" | "az" | "za";

export default function EducatorsBrowser({ educators }: { educators: EducatorDTO[] }) {
  const [school, setSchool] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");

  const schools = useMemo(
    () => Array.from(new Set(educators.map((e) => e.school).filter(Boolean))).sort(),
    [educators],
  );

  const shown = useMemo(() => {
    let list = educators.filter((e) => school === "all" || e.school === school);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "za") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [educators, school, sort]);

  return (
    <div className="mt-8">
      {/* Filter + sort controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-nal-navy">
          School
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="ml-2 rounded-md border border-nal-border bg-white px-3 py-1.5 text-sm text-nal-navy outline-none focus:border-nal-saffron"
          >
            <option value="all">All schools</option>
            {schools.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-nal-navy">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="ml-2 rounded-md border border-nal-border bg-white px-3 py-1.5 text-sm text-nal-navy outline-none focus:border-nal-saffron"
          >
            <option value="featured">Featured first</option>
            <option value="az">Name A–Z</option>
            <option value="za">Name Z–A</option>
          </select>
        </label>
        <span className="ml-auto text-sm text-nal-slate">{shown.length} people</span>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-nal-slate">No mentors match this filter.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <Link
              key={e.id ?? e.name}
              href={e.slug ? `/educators/${e.slug}` : "#"}
              className="group flex h-full flex-col rounded-2xl border border-nal-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/50 hover:shadow-lift"
            >
              <div className="flex items-center gap-4">
                {e.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.photo_url}
                    alt={e.name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-nal-parchment"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-nal-navy text-2xl font-bold text-white">
                    {e.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-nal-navy">{e.name}</p>
                  <p className="text-sm text-nal-saffron">{e.expertise}</p>
                </div>
              </div>
              {e.bio && <p className="mt-4 flex-1 text-sm text-nal-slate">{e.bio}</p>}
              <div className="mt-4 flex items-center justify-between">
                {e.school && (
                  <span className="rounded-full bg-nal-parchment px-2.5 py-0.5 text-xs font-semibold text-nal-navy">
                    {e.school}
                  </span>
                )}
                <span className="text-sm font-semibold text-nal-saffron opacity-0 transition group-hover:opacity-100">
                  View profile →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
