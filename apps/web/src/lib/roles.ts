import type { Profile } from "@/lib/auth";

export type Role =
  | "student" | "teacher_applicant" | "course_creator" | "mentor"
  | "event_manager" | "library_coordinator" | "volunteer"
  | "content_manager" | "admin" | "super_admin";

// Highest role wins for redirect purposes.
const RANK: Record<string, number> = {
  super_admin: 100, admin: 90, content_manager: 80, event_manager: 70,
  course_creator: 60, mentor: 50, library_coordinator: 40,
  volunteer: 30, teacher_applicant: 20, student: 10,
};

export const ADMIN_ROLES = ["admin", "content_manager", "super_admin"];
export const CREATOR_ROLES = ["course_creator", ...ADMIN_ROLES];

export function isAdmin(user?: Profile | null): boolean {
  if (!user) return false;
  return !!user.is_staff || ADMIN_ROLES.includes(user.role) || user.role === "event_manager";
}

export function isCreator(user?: Profile | null): boolean {
  if (!user) return false;
  return !!user.is_staff || CREATOR_ROLES.includes(user.role);
}

export function getDefaultDashboardForRole(user?: Profile | null): string {
  if (!user) return "/login";
  const r = user.is_superuser ? "super_admin" : user.role;
  switch (r) {
    case "super_admin":
    case "admin":
    case "content_manager":
    case "event_manager":
      return "/admin";
    case "course_creator":
      return "/creator/dashboard";
    case "mentor":
      return "/mentor/dashboard";
    case "volunteer":
      return "/volunteer/dashboard";
    default:
      return "/dashboard";
  }
}

export { RANK };
