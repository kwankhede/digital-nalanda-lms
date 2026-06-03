import { notFound } from "next/navigation";
import { getCourse } from "@/lib/api";
import CourseDetail from "@/components/CourseDetail";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourse(params.slug);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
