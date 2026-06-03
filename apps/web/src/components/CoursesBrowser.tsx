"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CourseListItem } from "@/lib/api";

const LEVELS = ["beginner", "intermediate", "advanced"];

export default function CoursesBrowser({ courses }: { courses: CourseListItem[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category?.name).filter(Boolean))).sort() as string[],
    [courses],
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (category !== "all" && c.category?.name !== category) return false;
      if (level !== "all" && c.level !== level) return false;
      if (term && !(`${c.title} ${c.short_description}`.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [courses, q, category, level]);

  return (
    <div className="mt-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nal-slate" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-md border border-nal-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-nal-saffron"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-nal-border bg-white px-3 py-2 text-sm text-nal-navy outline-none focus:border-nal-saffron">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)}
          className="rounded-md border border-nal-border bg-white px-3 py-2 text-sm capitalize text-nal-navy outline-none focus:border-nal-saffron">
          <option value="all">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
        </select>
        <span className="ml-auto text-sm text-nal-slate">{shown.length} courses</span>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-nal-border bg-white/50 p-8 text-center text-nal-slate">
          No courses match your filters.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-nal-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/50 hover:shadow-lift"
            >
              <div className="relative h-40 overflow-hidden bg-nal-parchment">
                {c.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnail_url} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-nal-navy/10 via-nal-teal/10 to-nal-saffron/15 text-4xl">🎓</div>
                )}
                {c.is_free && (
                  <span className="absolute right-3 top-3 rounded-full bg-nal-saffron px-2.5 py-0.5 text-xs font-bold text-white shadow-soft">
                    Free
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-2">
                  {c.category && (
                    <span className="rounded-full bg-nal-parchment px-2.5 py-0.5 text-xs font-semibold text-nal-navy">{c.category.name}</span>
                  )}
                  <span className="rounded-full bg-nal-saffron/15 px-2.5 py-0.5 text-xs font-semibold capitalize text-nal-saffron">{c.level}</span>
                </div>
                <h2 className="mt-3 font-display text-lg font-bold text-nal-navy">{c.title}</h2>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-nal-slate">{c.short_description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-nal-slate">{c.language}</span>
                  <span className="font-semibold text-nal-saffron opacity-0 transition group-hover:opacity-100">View course →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
