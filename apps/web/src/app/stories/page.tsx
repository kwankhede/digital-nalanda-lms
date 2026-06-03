import Link from "next/link";
import type { Metadata } from "next";
import { getStories } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Success Stories | Digital Nalanda",
  description:
    "Real stories from Digital Nalanda learners — from villages and small towns to top universities in India and abroad.",
};

export default async function StoriesPage() {
  const stories = await getStories().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Success Stories</h1>
      <p className="mt-2 text-gray-500">
        Real journeys from our learners across India.
      </p>

      {stories.length === 0 ? (
        <p className="mt-8 text-gray-500">Stories will be published here soon.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.slug}`}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-blue/20 to-brand-orange/20 text-5xl">
                {s.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.featured_image} alt={s.student_name} className="h-full w-full object-cover" />
                ) : (
                  "🎓"
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-bold text-brand-navy">{s.title}</h2>
                <p className="mt-1 flex-1 text-sm text-gray-500">{s.summary}</p>
                <p className="mt-3 text-sm font-semibold text-brand-navy">
                  {s.student_name}
                </p>
                <p className="text-xs text-brand-blue">{s.institution}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
