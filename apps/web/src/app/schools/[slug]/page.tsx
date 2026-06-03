import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSchool,
  getEducators,
  getFeaturedCourses,
  getLearningPaths,
  getHomeUpcoming,
  getFeaturedStories,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const school = await getSchool(params.slug).catch(() => null);
  if (!school) return { title: "School | Digital Nalanda" };
  return {
    title: `${school.name} | Digital Nalanda`,
    description: school.description,
  };
}

export default async function SchoolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = await getSchool(params.slug).catch(() => null);
  if (!school) notFound();

  // Aggregate related content from existing public APIs (best-effort links).
  const [educatorsAll, courses, paths, upcoming, stories] = await Promise.all([
    getEducators().catch(() => []),
    getFeaturedCourses().catch(() => []),
    getLearningPaths().catch(() => []),
    getHomeUpcoming().catch(() => []),
    getFeaturedStories().catch(() => []),
  ]);

  const educators = educatorsAll.filter(
    (e) => e.school?.toLowerCase() === school.name.toLowerCase(),
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <Link href="/schools" className="text-sm text-white/70 hover:text-white">
            ← All schools
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
              {school.icon}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold">{school.name}</h1>
              {school.tagline && <p className="text-nal-gold">{school.tagline}</p>}
              <p className="text-white/70">{school.course_count} courses</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-white/85">{school.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12">
        {school.long_description && (
          <section>
            <h2 className="text-2xl font-extrabold text-brand-navy">About this school</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">
              {school.long_description}
            </p>
          </section>
        )}
        {/* Educators */}
        {educators.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-brand-navy">Educators</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {educators.map((e) => (
                <div key={e.id ?? e.name} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy font-bold text-white">
                    {e.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">{e.name}</p>
                    <p className="text-xs text-gray-500">{e.expertise}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Courses */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-brand-navy">Courses</h2>
            <Link href="/courses" className="text-sm font-semibold text-brand-blue hover:underline">
              All courses →
            </Link>
          </div>
          {courses.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">Courses for this school are coming soon.</p>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {courses.slice(0, 4).map((c) => (
                <Link key={c.id} href={`/courses/${c.slug}`} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
                  {c.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail_url} alt={c.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="h-32 w-full bg-brand-navy/10" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-brand-navy">{c.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{c.short_description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Learning paths */}
        {paths.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-brand-navy">Learning Paths</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paths.slice(0, 3).map((p) => (
                <div key={p.slug} className="rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="text-2xl">{p.icon}</div>
                  <h3 className="mt-2 font-bold text-brand-navy">{p.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-brand-navy">Upcoming Classes &amp; Events</h2>
            <div className="mt-5 space-y-3">
              {upcoming.slice(0, 5).map((it) => (
                <div key={it.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-brand-navy">{it.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(it.start_time).toLocaleString()}
                      {it.speaker_or_mentor ? ` · ${it.speaker_or_mentor}` : ""}
                    </p>
                  </div>
                  {it.join_or_register_url && (
                    <a href={it.join_or_register_url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-brand-orange px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                      {it.type === "live_session" ? "Join" : "Register"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured stories */}
        {stories.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-brand-navy">Featured Stories</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.slice(0, 3).map((s) => (
                <Link key={s.id} href={`/stories/${s.slug}`} className="rounded-xl border border-gray-100 p-5 shadow-sm transition hover:shadow-md">
                  <p className="text-sm italic text-gray-600">“{s.summary || s.quote}”</p>
                  <p className="mt-3 font-bold text-brand-navy">{s.student_name}</p>
                  <p className="text-xs text-brand-blue">{s.institution}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
