// Single source of truth for navigation. Drives desktop dropdowns, the mobile
// drawer, and the bottom bar. Links point to real pages or homepage anchors so
// nothing 404s; swap anchors for dedicated pages as they're built.

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavLink[];
}


// --- Flat public header (matches the reference design exactly) ---
export const PUBLIC_PRIMARY: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "Live Classes", href: "/events" },
  { label: "Schools", href: "/schools" },
  { label: "Educators", href: "/educators" },
];

export const PUBLIC_RESOURCES: NavGroup = {
  label: "Resources",
  items: [
    { label: "Blog", href: "https://nalanda-academy.org/nalanda-blog/", external: true },
    { label: "Study Materials", href: "/study-materials" },
    { label: "Stories", href: "https://nalanda-academy.org/nalanda-blog/", external: true },
    { label: "Impact", href: "/#impact" },
    { label: "FAQ", href: "/faq" },
    { label: "Help Center", href: "/#contact" },
  ],
};

// Public visitor menu
export const PUBLIC_NAV: NavGroup[] = [
  {
    label: "Learn",
    items: [
      { label: "Schools", href: "/schools" },
      { label: "All Courses", href: "/courses" },
      { label: "Learning Paths", href: "/#learning-paths" },
    ],
  },
  {
    label: "Live",
    items: [
      { label: "Live Classes", href: "/events" },
      { label: "Workshops", href: "/#events" },
      { label: "Recordings", href: "/#recordings" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Stories", href: "/stories" },
      { label: "Community Libraries", href: "/#community-libraries" },
      { label: "Educators", href: "/#educators" },
    ],
  },
  {
    label: "About",
    items: [
      { label: "About Us", href: "/#about" },
      { label: "Impact", href: "/#impact" },
      { label: "The Path Newsletter", href: "/#newsletter" },
      { label: "Teach on Digital Nalanda", href: "/become-teacher" },
    ],
  },
];

// Logged-in student menu (adds My Courses, recordings, etc.)
export const STUDENT_NAV: NavGroup[] = [
  {
    label: "Learn",
    items: [
      { label: "All Courses", href: "/courses" },
      { label: "My Courses", href: "/dashboard" },
      { label: "Learning Paths", href: "/#learning-paths" },
    ],
  },
  {
    label: "Live",
    items: [
      { label: "Upcoming Classes", href: "/dashboard" },
      { label: "Live Classes", href: "/events" },
      { label: "Recordings", href: "/#recordings" },
      { label: "Workshops", href: "/#events" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Stories", href: "/stories" },
      { label: "Community Libraries", href: "/#community-libraries" },
      { label: "Educators", href: "/#educators" },
      { label: "Teach on Digital Nalanda", href: "/become-teacher" },
    ],
  },
];

// --- Role-aware primary nav for logged-in users ---
// Surfaces a small, role-relevant set of flat links. Every href is a real
// route in the app so nothing 404s. The profile menu + notifications stay.
type RoleUser = { role?: string; is_superuser?: boolean; is_staff?: boolean };

const ROLE_NAV: Record<string, NavLink[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Courses", href: "/courses" },
    { label: "Live Classes", href: "/events" },
    { label: "Certificates", href: "/dashboard" },
    { label: "Counselling", href: "/dashboard/counselling" },
  ],
  course_creator: [
    { label: "Dashboard", href: "/creator/dashboard" },
    { label: "My Courses", href: "/creator/courses" },
    { label: "Create Course", href: "/creator/courses/new" },
    { label: "Assignments", href: "/creator/assignments" },
    { label: "Live Classes", href: "/events" },
  ],
  mentor: [
    { label: "Dashboard", href: "/mentor/dashboard" },
    { label: "Counselling", href: "/admin/counselling" },
    { label: "Courses", href: "/courses" },
    { label: "Live Classes", href: "/events" },
  ],
  content_manager: [
    { label: "Dashboard", href: "/content/dashboard" },
    { label: "Schools", href: "/admin/schools" },
    { label: "Study Materials", href: "/admin/study-materials" },
    { label: "Educators", href: "/creator/educators" },
    { label: "Courses", href: "/courses" },
  ],
  event_manager: [
    { label: "Dashboard", href: "/events/dashboard" },
    { label: "Live Classes & Events", href: "/events" },
    { label: "Courses", href: "/courses" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Courses", href: "/courses" },
    { label: "Review", href: "/admin/course-reviews" },
    { label: "Users", href: "/admin/users" },
    { label: "Live Classes", href: "/events" },
  ],
};

// volunteer shares the student set.
ROLE_NAV.volunteer = ROLE_NAV.student;

export function navForRole(user: RoleUser | null | undefined): NavLink[] {
  if (!user) return [];
  if (user.is_superuser) return ROLE_NAV.admin;
  const role = user.role ?? "";
  if (ROLE_NAV[role]) return ROLE_NAV[role];
  // Staff with no specific (mapped) role fall back to the admin set.
  if (user.is_staff) return ROLE_NAV.admin;
  // Everyone else (incl. teacher_applicant, library_coordinator) → student set.
  return ROLE_NAV.student;
}

export const PROFILE_MENU: NavLink[] = [
  { label: "My Profile", href: "/dashboard" },
  { label: "My Certificates", href: "/dashboard" },
  { label: "My Courses", href: "/dashboard" },
  { label: "Settings", href: "/dashboard" },
];

// Mobile bottom bar (5 primary destinations)
export const BOTTOM_NAV = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Learn", href: "/courses", icon: "📚" },
  { label: "Live", href: "/#events", icon: "🎥" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Profile", href: "/dashboard", icon: "👤" },
];

export const DONATE_LINK = {
  label: "Donate",
  href: "https://nalanda-academy.org/support-us/",
  external: true,
};
