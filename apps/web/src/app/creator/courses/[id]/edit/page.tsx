"use client";

import { useParams } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import CourseBuilder from "@/components/CourseBuilder";
import { isCreator } from "@/lib/roles";

export default function CreatorEditCoursePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireRole allow={isCreator}>
      <CourseBuilder courseId={Number(id)} />
    </RequireRole>
  );
}
