import Link from "next/link";
import type { Metadata } from "next";
import { getCourses } from "@/lib/api";
import CoursesBrowser from "@/components/CoursesBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses | Digital Nalanda",
  description:
    "Explore Digital Nalanda's free courses across the arts, sciences, law, design and social thought — open to every learner.",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">Learn</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">All Courses</h1>
        <p className="mt-3 max-w-2xl text-nal-slate">
          Explore our growing library of courses — every one free, forever. Search
          or filter by category and level to find your next step.
        </p>

        {courses.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-nal-border bg-white/60 p-10 text-center">
            <p className="text-4xl">📚</p>
            <h2 className="mt-3 font-display text-xl font-bold text-nal-navy">Courses are on the way</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-nal-slate">
              New courses are being prepared. In the meantime, explore our schools
              or meet the educators who teach here.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/schools" className="rounded-md bg-nal-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink">Browse schools</Link>
              <Link href="/educators" className="rounded-md border border-nal-border bg-white px-5 py-2.5 text-sm font-semibold text-nal-navy transition hover:border-nal-saffron hover:text-nal-saffron">Meet educators</Link>
            </div>
          </div>
        ) : (
          <CoursesBrowser courses={courses} />
        )}
      </div>
    </div>
  );
}
