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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Our Schools</h1>
      <p className="mt-2 text-gray-500">
        Ten schools spanning the arts, sciences, law, and social thought.
      </p>

      {schools.length === 0 ? (
        <p className="mt-8 text-gray-500">Schools will appear here soon.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((s) => (
            <Link
              key={s.slug}
              href={`/schools/${s.slug}`}
              className="rounded-xl border border-gray-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                {s.icon}
              </div>
              <h2 className="mt-4 font-bold text-brand-navy">{s.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{s.description}</p>
              <p className="mt-3 text-xs font-semibold text-brand-blue">
                {s.course_count} courses
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
