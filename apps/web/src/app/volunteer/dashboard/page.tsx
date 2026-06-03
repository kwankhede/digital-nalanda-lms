"use client";

import RequireRole from "@/components/RequireRole";

export default function VolunteerDashboard() {
  return (
    <RequireRole allow={(u) => ["volunteer", "admin", "super_admin"].includes(u.role) || !!u.is_staff}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-brand-navy">Volunteer Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Your assigned tasks and events will appear here. Thank you for
          supporting Digital Nalanda!
        </p>
      </div>
    </RequireRole>
  );
}
