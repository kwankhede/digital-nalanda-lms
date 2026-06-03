"use client";

import { useParams } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import CourseBuilder from "@/components/CourseBuilder";
import { isAdmin } from "@/lib/roles";

export default function AdminEditCoursePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireRole allow={isAdmin}>
      <CourseBuilder courseId={Number(id)} isAdmin />
    </RequireRole>
  );
}
