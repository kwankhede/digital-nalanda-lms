"use client";

import RequireRole from "@/components/RequireRole";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Profile } from "@/lib/auth";

const allow = (u?: Profile | null) =>
  !!u && (!!u.is_staff || ["event_manager", "admin", "super_admin"].includes(u.role));

export default function EventsDashboard() {
  return (
    <RequireRole allow={allow}>
      <DashboardShell />
    </RequireRole>
  );
}
