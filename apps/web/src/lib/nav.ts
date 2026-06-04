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
    { label: "Study Materials", href: "#" },
    { label: "Stories", href: "https://nalanda-academy.org/nalanda-blog/", external: true },
    { label: "Impact", href: "/#impact" },
    { label: "FAQ", href: "#" },
    { label: "Help Center", href: "#" },
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
