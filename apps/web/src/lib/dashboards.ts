// Static per-role dashboard configuration (the parts that never change:
// responsibilities, quick actions, which metric cards to show, shortcuts).
// Dynamic numbers come from /api/dashboard/summary/ (see lib/dashboard.ts).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface QuickAction {
  label: string;
  href: string;
  primary?: boolean;
  external?: boolean;
}
export interface MetricCard {
  key: string; // matches a key in summary.metrics
  label: string;
}
export interface RoleDashboardConfig {
  title: string;
  intro: string;
  responsibilities: string[];
  metricCards: MetricCard[];
  quickActions: QuickAction[];
  shortcuts: QuickAction[];
}

const djangoAdmin = (path: string) => `${API_URL}/admin/${path}`;

export const DASHBOARDS: Record<string, RoleDashboardConfig> = {
  super_admin: {
    title: "Super Admin",
    intro: "Platform governance, people, and final approvals.",
    responsibilities: [
      "Platform governance & security",
      "User roles & admin management",
      "Final approvals — teachers & courses",
      "Schools, homepage & content oversight",
      "Certificates & system settings",
    ],
    metricCards: [
      { key: "users", label: "Total Users" },
      { key: "students", label: "Students" },
      { key: "teachers", label: "Teachers" },
      { key: "courses", label: "Courses" },
      { key: "schools", label: "Schools" },
      { key: "live_classes", label: "Live Classes" },
      { key: "certificates", label: "Certificates" },
    ],
    quickActions: [
      { label: "Manage Users & Roles", href: "/admin/users", primary: true },
      { label: "Review Teachers", href: "/admin/applications" },
      { label: "Review Courses", href: "/admin/course-reviews" },
      { label: "Counselling Queue", href: "/admin/counselling" },
      { label: "Notice Ticker", href: "/admin/ticker" },
      { label: "Study Materials", href: "/admin/study-materials" },
    ],
    shortcuts: [
      { label: "Operations & metrics", href: "/admin" },
      { label: "Manage Schools", href: djangoAdmin("content/school/"), external: true },
      { label: "Audit Logs", href: "/admin/audit-logs" },
      { label: "Manage Homepage", href: djangoAdmin("content/impactmetric/"), external: true },
      { label: "Full Django admin", href: djangoAdmin(""), external: true },
    ],
  },

  admin: {
    title: "Admin",
    intro: "Approvals, content and day-to-day operations.",
    responsibilities: [
      "Course approvals & publishing",
      "Teacher application reviews",
      "Schools, homepage & stories",
      "Events & certificates",
      "Counselling oversight",
    ],
    metricCards: [
      { key: "students", label: "Students" },
      { key: "teachers", label: "Teachers" },
      { key: "courses", label: "Courses" },
      { key: "schools", label: "Schools" },
      { key: "live_classes", label: "Live Classes" },
      { key: "certificates", label: "Certificates" },
    ],
    quickActions: [
      { label: "Review Courses", href: "/admin/course-reviews", primary: true },
      { label: "Review Teachers", href: "/admin/applications" },
      { label: "Counselling Queue", href: "/admin/counselling" },
      { label: "New Course", href: "/admin/courses/new" },
      { label: "Study Materials", href: "/admin/study-materials" },
      { label: "Notice Ticker", href: "/admin/ticker" },
    ],
    shortcuts: [
      { label: "Operations & metrics", href: "/admin" },
      { label: "Manage Schools", href: djangoAdmin("content/school/"), external: true },
      { label: "Manage Events", href: djangoAdmin("live_sessions/event/"), external: true },
    ],
  },

  content_manager: {
    title: "Content Manager",
    intro: "Keep the public site rich, current and inspiring.",
    responsibilities: [
      "Homepage content & impact metrics",
      "Schools — create, edit, archive",
      "Stories & educator profiles",
      "Learning paths & community libraries",
      "Study materials & notices",
    ],
    metricCards: [
      { key: "schools", label: "Schools" },
      { key: "educators", label: "Educators" },
      { key: "stories", label: "Stories" },
      { key: "study_materials", label: "Study Materials" },
    ],
    quickActions: [
      { label: "Manage Schools", href: "/admin/schools", primary: true },
      { label: "Educator Profiles", href: "/creator/educators" },
      { label: "Study Materials", href: "/admin/study-materials" },
      { label: "Notice Ticker", href: "/admin/ticker" },
      { label: "Stories", href: djangoAdmin("content/story/"), external: true },
      { label: "Homepage / Impact", href: djangoAdmin("content/impactmetric/"), external: true },
    ],
    shortcuts: [
      { label: "Learning Paths", href: djangoAdmin("content/learningpath/"), external: true },
      { label: "Community Libraries", href: djangoAdmin("content/communitylibrary/"), external: true },
    ],
  },

  course_creator: {
    title: "Course Creator",
    intro: "Build great courses and guide your learners.",
    responsibilities: [
      "Create & edit your courses",
      "Add modules, lessons & content blocks",
      "Submit courses for review",
      "Respond to review feedback",
      "Grade assignments & support students",
    ],
    metricCards: [
      { key: "draft", label: "Drafts" },
      { key: "submitted", label: "Under Review" },
      { key: "published", label: "Published" },
      { key: "rejected", label: "Rejected" },
      { key: "students", label: "Your Students" },
    ],
    quickActions: [
      { label: "Create New Course", href: "/creator/courses/new", primary: true },
      { label: "My Courses", href: "/creator/courses" },
      { label: "Assignments", href: "/creator/assignments" },
      { label: "Mentor Profiles", href: "/creator/educators" },
    ],
    shortcuts: [
      { label: "Browse all courses", href: "/courses" },
      { label: "Live classes & events", href: "/events" },
    ],
  },

  mentor: {
    title: "Mentor",
    intro: "Support learners through guidance and feedback.",
    responsibilities: [
      "Reply to assigned counselling requests",
      "Review & give feedback on assignments",
      "Support students in their journey",
    ],
    metricCards: [
      { key: "counselling_open", label: "Open Counselling" },
      { key: "submissions_to_grade", label: "To Grade" },
    ],
    quickActions: [
      { label: "Counselling Queue", href: "/admin/counselling", primary: true },
      { label: "My Mentor Profile", href: "/creator/educators" },
    ],
    shortcuts: [
      { label: "Live classes & events", href: "/events" },
      { label: "Browse courses", href: "/courses" },
    ],
  },

  event_manager: {
    title: "Event Manager",
    intro: "Run live classes, events and recordings.",
    responsibilities: [
      "Create & schedule live classes",
      "Create & manage events",
      "Track attendance",
      "Publish recordings",
    ],
    metricCards: [
      { key: "upcoming_sessions", label: "Upcoming Classes" },
      { key: "upcoming_events", label: "Upcoming Events" },
    ],
    quickActions: [
      { label: "Manage Live Sessions", href: djangoAdmin("live_sessions/livesession/"), primary: true, external: true },
      { label: "Manage Events", href: djangoAdmin("live_sessions/event/"), external: true },
    ],
    shortcuts: [
      { label: "Public events page", href: "/events" },
    ],
  },

  student: {
    title: "Student",
    intro: "Keep learning — your next step is one click away.",
    responsibilities: [
      "Continue your enrolled courses",
      "Attend live classes",
      "Submit assignments on time",
      "Earn & verify certificates",
    ],
    metricCards: [
      { key: "enrolled", label: "Enrolled" },
      { key: "in_progress", label: "In Progress" },
      { key: "certificates", label: "Certificates" },
      { key: "assignments_due", label: "Assignments Due" },
    ],
    quickActions: [
      { label: "Browse Courses", href: "/courses", primary: true },
      { label: "Live Classes", href: "/events" },
      { label: "Ask for Counselling", href: "/dashboard/counselling" },
      { label: "My Certificates", href: "/dashboard" },
    ],
    shortcuts: [
      { label: "Study materials", href: "/study-materials" },
      { label: "Notifications", href: "/notifications" },
    ],
  },
};

/** Resolve which config to use for a user (superuser → super_admin). */
export function configForRole(role: string, isSuperuser?: boolean): RoleDashboardConfig {
  const key = isSuperuser ? "super_admin" : role;
  return DASHBOARDS[key] ?? DASHBOARDS.student;
}
