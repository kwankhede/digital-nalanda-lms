"use client";

import RequireRole from "@/components/RequireRole";

export default function MentorDashboard() {
  return (
    <RequireRole allow={(u) => ["mentor", "admin", "super_admin"].includes(u.role) || !!u.is_staff}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-extrabold text-brand-navy md:text-3xl">Mentor Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Manage your assigned live classes, answer student questions, and review
          assignment feedback. (Live classes appear on your main dashboard.)
        </p>
      </div>
    </RequireRole>
  );
}
