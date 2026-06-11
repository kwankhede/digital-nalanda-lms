import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLearningPath } from "@/lib/api";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = await getLearningPath(params.slug);
  return {
    title: path ? `${path.name} | Digital Nalanda` : "Learning Path | Digital Nalanda",
    description: path?.description ?? "A guided learning path at Digital Nalanda.",
  };
}

export default async function LearningPathPage({ params }: Props) {
  const path = await getLearningPath(params.slug);
  if (!path) notFound();

  const courses = path.courses ?? [];

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">
          Learning path
        </p>
        <div className="mt-2 flex items-center gap-3">
          {path.icon && <span className="text-4xl">{path.icon}</span>}
          <h1 className="font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">
            {path.name}
          </h1>
        </div>
        {path.description && (
          <p className="mt-3 max-w-2xl text-nal-slate">{path.description}</p>
        )}

        {courses.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-nal-border bg-white/60 p-10 text-center">
            <p className="text-4xl">🧭</p>
            <h2 className="mt-3 font-display text-xl font-bold text-nal-navy">
              This path is being prepared
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-nal-slate">
              Courses for this path are being curated. Browse all courses in the
              meantime.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-block rounded-md bg-nal-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink"
            >
              Browse all courses
            </Link>
          </div>
        ) : (
          <ol className="mt-10 space-y-4">
            {courses.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/courses/${c.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-nal-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-nal-saffron/50 hover:shadow-lift"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nal-navy font-display text-lg font-bold text-white transition-colors group-hover:bg-nal-saffron">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold text-nal-navy">
                      {c.title}
                    </span>
                    {c.short_description && (
                      <span className="mt-1 block text-sm text-nal-slate">
                        {c.short_description}
                      </span>
                    )}
                    <span className="mt-2 inline-block rounded-full border border-nal-border bg-nal-parchment px-2.5 py-0.5 text-xs font-semibold capitalize text-nal-slate">
                      {c.level}
                    </span>
                  </span>
                  <span className="mt-1 text-nal-saffron transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
