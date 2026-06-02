import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourse(params.slug);
  if (!course) notFound();

  // Use the first lesson that has a YouTube video as the page's preview player.
  const firstVideo = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.youtube_video_id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/courses" className="text-sm text-brand-blue hover:underline">
        ← Back to courses
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {course.category && (
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
            {course.category.name}
          </span>
        )}
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-600">
          {course.level}
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
          {course.language}
        </span>
        {course.is_free && (
          <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
            Free
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-extrabold text-brand-navy">
        {course.title}
      </h1>
      <p className="mt-2 text-gray-600">{course.short_description}</p>

      {firstVideo && (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${firstVideo.youtube_video_id}`}
            title={firstVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {course.description && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand-navy">About this course</h2>
          <p className="mt-2 whitespace-pre-line text-gray-600">
            {course.description}
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-brand-navy">Course Content</h2>
        <div className="mt-4 space-y-4">
          {course.modules.map((m) => (
            <div key={m.id} className="rounded-lg border border-gray-100">
              <div className="border-b border-gray-100 px-4 py-3 font-semibold text-brand-navy">
                {m.title}
              </div>
              <ul className="divide-y divide-gray-50">
                {m.lessons.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-gray-400">▶</span>
                      {l.title}
                      {l.is_preview && (
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">
                          Preview
                        </span>
                      )}
                    </span>
                    <span className="text-gray-400">
                      {l.duration_minutes > 0 ? `${l.duration_minutes} min` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
