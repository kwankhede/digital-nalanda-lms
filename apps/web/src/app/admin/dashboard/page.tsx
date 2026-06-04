"use client";

import RequireRole from "@/components/RequireRole";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Profile } from "@/lib/auth";

const allow = (u?: Profile | null) =>
  !!u && (!!u.is_staff || !!u.is_superuser || ["admin", "super_admin"].includes(u.role));

export default function AdminHomeDashboard() {
  return (
    <RequireRole allow={allow}>
      <DashboardShell />
    </RequireRole>
  );
}
