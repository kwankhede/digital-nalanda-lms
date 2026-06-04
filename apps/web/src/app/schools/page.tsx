import Link from "next/link";
import type { Metadata } from "next";
import { getSchools } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schools | Digital Nalanda",
  description:
    "Explore Digital Nalanda's schools — arts, sciences, law, design, data science, and more. A full university, free for every learner.",
};

export default async function SchoolsPage() {
  const schools = await getSchools().catch(() => []);

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-nal-saffron">
          Schools of Digital Nalanda
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">
          Our Schools
        </h1>
        <p className="mt-3 max-w-2xl text-nal-slate">
          Schools spanning the arts, sciences, law, and social thought — a full
          university, free for every learner.
        </p>

        {schools.length === 0 ? (
          <p className="mt-10 text-nal-slate">Schools will appear here soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((s) => (
              <Link
                key={s.slug}
                href={`/schools/${s.slug}`}
                className="group flex flex-col rounded-2xl border border-nal-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/60 hover:shadow-lift"
              >
                {s.image_url ? (
                  <div className="relative mb-4 aspect-[5/4] w-full overflow-hidden rounded-xl bg-nal-cream isolate">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-nal-parchment text-3xl transition-colors group-hover:bg-nal-saffron/15">
                    {s.icon || "🎓"}
                  </div>
                )}
                <h2 className="mt-4 font-display text-xl font-bold text-nal-navy">
                  {s.name}
                </h2>
                <p className="mt-1 flex-1 text-sm text-nal-slate">{s.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  {s.course_count > 0 ? (
                    <span className="text-xs font-semibold text-nal-saffron">
                      {s.course_count} courses
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-nal-navy transition group-hover:text-nal-saffron">
                    Explore
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
