"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import CourseAISummary from "@/components/CourseAISummary";
import type { CourseDetail as Course } from "@/lib/api";
import {
  completeLesson,
  downloadCertificate,
  enroll,
  getCourseProgress,
  getMyCertificates,
  getMyCourses,
  type Certificate,
  type Enrollment,
} from "@/lib/student";

export default function CourseDetail({ course }: { course: Course }) {
  const { user, loading: authLoading } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const enrolled = !!enrollment;
  const isCompleted = enrollment?.status === "completed";

  // Load enrollment + progress for this course once we know the user.
  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;
    (async () => {
      try {
        const [mine, progress, certs] = await Promise.all([
          getMyCourses(),
          getCourseProgress(course.slug),
          getMyCertificates(),
        ]);
        if (!active) return;
        setEnrollment(mine.find((e) => e.course.slug === course.slug) ?? null);
        setCompleted(
          new Set(progress.filter((p) => p.is_completed).map((p) => p.lesson)),
        );
        setCertificate(certs.find((c) => c.course_slug === course.slug) ?? null);
      } catch {
        /* ignore — treat as not enrolled */
      }
    })();
    return () => {
      active = false;
    };
  }, [authLoading, user, course.slug]);

  const firstVideo = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.youtube_video_id);

  async function handleEnroll() {
    setBusy(true);
    setError("");
    try {
      await enroll(course.slug);
      const mine = await getMyCourses();
      setEnrollment(mine.find((e) => e.course.slug === course.slug) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enroll");
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete(lessonId: number) {
    setError("");
    try {
      const res = await completeLesson(lessonId);
      setCompleted((prev) => new Set(prev).add(lessonId));
      if (res.enrollment) setEnrollment(res.enrollment);
      if (res.enrollment?.status === "completed") {
        const certs = await getMyCertificates();
        setCertificate(certs.find((c) => c.course_slug === course.slug) ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update lesson");
    }
  }

  function scrollToContent() {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  }

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

      {isCompleted && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-xl font-bold text-green-700">
            🎉 Congratulations!
          </p>
          <p className="mt-1 text-sm text-green-600">
            You have successfully completed this course.
          </p>
          {certificate && (
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() =>
                  downloadCertificate(
                    certificate.id,
                    `${certificate.certificate_number}.pdf`,
                  )
                }
                className="rounded-md bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Download Certificate
              </button>
              <Link
                href={`/verify/${certificate.verification_code}`}
                className="rounded-md border border-green-600 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                View Certificate
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Enroll / Continue action */}
      <div className="mt-6">
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {!user ? (
          <Link
            href="/login"
            className="inline-block rounded-md bg-brand-orange px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            Login to Enroll
          </Link>
        ) : enrolled ? (
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToContent}
              className="rounded-md bg-brand-blue px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Continue Learning
            </button>
            <span className="text-sm text-gray-500">
              {enrollment!.progress_percentage}% complete
            </span>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={busy}
            className="rounded-md bg-brand-orange px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Enrolling…" : "Enroll for Free"}
          </button>
        )}
      </div>

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

      {/* AI-generated course summary — available to every visitor */}
      <CourseAISummary slug={course.slug} />

      <section ref={contentRef} className="mt-10 scroll-mt-6">
        <h2 className="text-lg font-bold text-brand-navy">Course Content</h2>
        <div className="mt-4 space-y-4">
          {course.modules.map((m) => (
            <div key={m.id} className="rounded-lg border border-gray-100">
              <div className="border-b border-gray-100 px-4 py-3 font-semibold text-brand-navy">
                {m.title}
              </div>
              <ul className="divide-y divide-gray-50">
                {m.lessons.map((l) => {
                  const done = completed.has(l.id);
                  return (
                    <li key={l.id} className="px-4 py-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className={done ? "text-green-600" : "text-gray-400"}>
                          {done ? "✓" : "▶"}
                        </span>
                        <span className="break-words">{l.title}</span>
                        {l.is_preview && (
                          <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">
                            Preview
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {l.duration_minutes > 0 && (
                          <span className="text-gray-400">
                            {l.duration_minutes} min
                          </span>
                        )}
                        {enrolled &&
                          (done ? (
                            <span className="text-xs font-medium text-green-600">
                              Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleComplete(l.id)}
                              className="rounded border border-brand-blue px-2 py-1 text-xs font-medium text-brand-blue hover:bg-blue-50"
                            >
                              Mark as Complete
                            </button>
                          ))}
                      </span>
                      </div>
                      {/* Block content — visible to enrolled students or on preview lessons */}
                      {(enrolled || l.is_preview) && l.blocks && l.blocks.length > 0 && (
                        <div className="mt-3 border-t border-gray-50 pt-3">
                          <BlockRenderer blocks={l.blocks} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
