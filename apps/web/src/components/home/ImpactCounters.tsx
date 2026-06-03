"use client";

import { getImpact } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import Counter from "./Counter";

// Fallback used only when the API returns nothing (per design spec).
const FALLBACK = [
  { value: 20000, suffix: "+", label: "Students Reached" },
  { value: 2300, suffix: "+", label: "Students in Top Universities" },
  { value: 60, suffix: "+", label: "Students Abroad" },
  { value: 15, suffix: "+", label: "Community Libraries" },
  { value: 200, suffix: "+", label: "Mentors" },
  { value: 18000, suffix: "+", label: "Digital Learners" },
];

// Lightweight line icons chosen by keyword in the stat label.
function StatIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const common = "h-7 w-7";
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (l.includes("univers") || l.includes("top"))
    return (<svg className={common} viewBox="0 0 24 24" {...stroke}><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M7 11v5c0 1 2.2 2 5 2s5-1 5-2v-5"/></svg>);
  if (l.includes("abroad") || l.includes("global") || l.includes("world"))
    return (<svg className={common} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>);
  if (l.includes("librar") || l.includes("book"))
    return (<svg className={common} viewBox="0 0 24 24" {...stroke}><path d="M4 5h7v14H4zM13 5h7v14h-7z"/><path d="M7 9h1M16 9h1"/></svg>);
  if (l.includes("mentor") || l.includes("educator") || l.includes("teacher"))
    return (<svg className={common} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/></svg>);
  if (l.includes("digital") || l.includes("learner") || l.includes("online"))
    return (<svg className={common} viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>);
  // default: students
  return (<svg className={common} viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6.5a3 3 0 0 1 0 5.8M21 19c0-2.4-1.6-4.2-4-4.8"/></svg>);
}

export default function ImpactCounters() {
  const { data, loading } = useApi(getImpact);
  const stats = data && data.length > 0 ? data : FALLBACK;

  return (
    <section className="mx-auto -mt-6 max-w-6xl px-4 pb-4">
      <div className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft md:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="h-7 w-7 animate-pulse rounded bg-nal-parchment" />
                  <div className="mt-3 h-7 w-16 animate-pulse rounded bg-nal-parchment" />
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-nal-parchment" />
                </div>
              ))
            : stats.map((s) => (
                <div
                  key={s.label}
                  className="group flex flex-col items-center text-center"
                >
                  <span className="text-nal-saffron transition-transform duration-300 group-hover:-translate-y-0.5">
                    <StatIcon label={s.label} />
                  </span>
                  <p className="mt-2 text-2xl font-extrabold text-nal-navy md:text-3xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-xs font-medium text-nal-slate">{s.label}</p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
