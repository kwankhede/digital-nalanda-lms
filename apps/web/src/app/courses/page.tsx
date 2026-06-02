import Link from "next/link";
import { getCourses } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">All Courses</h1>
      <p className="mt-2 text-gray-500">Explore our wide range of free courses.</p>

      {courses.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No courses yet. Run <code>python manage.py seed_courses</code> on the backend.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-100 shadow-sm transition hover:shadow-md"
            >
              {c.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumbnail_url}
                  alt={c.title}
                  className="h-36 w-full object-cover"
                />
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
                <h2 className="mt-3 font-bold text-brand-navy">{c.title}</h2>
                <p className="mt-1 flex-1 text-sm text-gray-500">
                  {c.short_description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-400">{c.language}</span>
                  {c.is_free && (
                    <span className="font-bold text-green-600">Free</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
