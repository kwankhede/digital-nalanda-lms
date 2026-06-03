// Static homepage content. Structured so it can move to the API / CMS later
// without changing the components that consume it.

export const IMPACT_STATS = [
  { value: 5000, suffix: "+", label: "Students Reached" },
  { value: 600, suffix: "+", label: "Successful Learners" },
  { value: 20, suffix: "+", label: "Educators" },
  { value: 14, suffix: "", label: "Community Libraries" },
  { value: 100, suffix: "%", label: "Free Education" },
];

export const HERO_STATS = [
  { value: "5000+", label: "Students" },
  { value: "600+", label: "Learners" },
  { value: "100%", label: "Free" },
];

// Replace with the real Digital Nalanda intro video id when available.
export const INTRO_VIDEO_ID = "8jPQjjsBbIc";

// All "Support / Donate" CTAs drive to the official Nalanda Academy donate page.
// Donations are handled there (80G tax-exempt, Indian citizens), so this stays
// external on purpose — keep it in one place for easy updates.
export const SUPPORT_URL = "https://nalanda-academy.org/support-us/";

export interface School {
  name: string;
  icon: string;
  description: string;
  courses: number;
}

export const SCHOOLS: School[] = [
  { name: "Arts School", icon: "🎨", description: "Literature, history & the humanities.", courses: 12 },
  { name: "Management School", icon: "📊", description: "Business, leadership & enterprise.", courses: 9 },
  { name: "Law School", icon: "⚖️", description: "Constitution, rights & justice.", courses: 7 },
  { name: "Design School", icon: "✏️", description: "Visual, product & digital design.", courses: 6 },
  { name: "Buddhist Studies", icon: "☸️", description: "Philosophy, ethics & mindful living.", courses: 5 },
  { name: "Data Science", icon: "📈", description: "Data, statistics & applied AI.", courses: 8 },
  { name: "Media & Communication", icon: "🎙️", description: "Journalism, media & storytelling.", courses: 6 },
  { name: "Civil Thought", icon: "🏛️", description: "Civic life, governance & policy.", courses: 5 },
  { name: "Social Science", icon: "🌍", description: "Society, economics & change.", courses: 10 },
  { name: "Interdisciplinary Studies", icon: "🧩", description: "Cross-field critical thinking.", courses: 4 },
];

export interface Step {
  n: number;
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  { n: 1, title: "Create Account", description: "Register free in seconds." },
  { n: 2, title: "Choose a School", description: "Pick the field you love." },
  { n: 3, title: "Learn", description: "Courses, live classes & workshops." },
  { n: 4, title: "Complete Assessments", description: "Track your progress." },
  { n: 5, title: "Earn Certificate", description: "Verified on completion." },
  { n: 6, title: "Join the Community", description: "Grow with fellow learners." },
];

export interface Story {
  name: string;
  credential: string;
  quote: string;
}

export const STORIES: Story[] = [
  {
    name: "Roopa Nagenahalli",
    credential: "MA, Azim Premji University",
    quote:
      "When I joined Nalanda in 2017, I couldn't write a paragraph in English — I studied in Kannada and was a school drop-out. Nalanda gave me my first real chance to study properly.",
  },
  {
    name: "Chetan Kant",
    credential: "MA, TISS Mumbai",
    quote:
      "I'm from a village in Odisha; my parents died when I was young. I could join Nalanda only because it taught students free of cost and provided stipends for food and accommodation.",
  },
  {
    name: "Raviraj Gajbhiye",
    credential: "MS, University of Alberta, Canada",
    quote:
      "Studying abroad never crossed my mind before Nalanda. It's the only place I derive my inspiration, motivation and confidence from — it helped me grow as a social being.",
  },
  {
    name: "Karuna Patel",
    credential: "LLM, Central University of Punjab",
    quote:
      "I met students from different states at Nalanda. I understood the reason — Nalanda is like a family that believes in equality and equal access to education.",
  },
];

export interface DonationTier {
  amount: string;
  impact: string;
}

export const DONATION_TIERS: DonationTier[] = [
  { amount: "₹1,000", impact: "Stationery, internet & learning materials for a student." },
  { amount: "₹4,000", impact: "A month of food & accommodation for a residential learner." },
  { amount: "₹10,000", impact: "Helps run a rural community library for a month." },
];

export const TRUST_POINTS = [
  { value: "20+", label: "Educators & mentors" },
  { value: "14", label: "Community libraries" },
  { value: "600+", label: "University placements" },
  { value: "100%", label: "Free, forever" },
];

// Slug helper for schools / paths (derived, no DB yet).
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface LearningPath {
  name: string;
  slug: string;
  description: string;
  courses: number;
  icon: string;
}

export const LEARNING_PATHS: LearningPath[] = [
  { name: "UPSC Foundation Path", slug: "upsc-foundation", description: "Build the base for civil services preparation.", courses: 6, icon: "🏛️" },
  { name: "Critical Thinking Path", slug: "critical-thinking", description: "Reason clearly, argue well, decide better.", courses: 4, icon: "🧠" },
  { name: "English Communication Path", slug: "english-communication", description: "Speak and write English with confidence.", courses: 5, icon: "💬" },
  { name: "Buddhist Studies Path", slug: "buddhist-studies", description: "Philosophy, ethics, and mindful living.", courses: 4, icon: "☸️" },
  { name: "Leadership Development Path", slug: "leadership-development", description: "Lead teams and communities with purpose.", courses: 5, icon: "🌟" },
];

export interface Educator {
  name: string;
  expertise: string;
  school: string;
}

export const EDUCATORS: Educator[] = [
  { name: "Anoop Kumar", expertise: "Political Science & Public Policy", school: "Civil Thought" },
  { name: "Priya Sharma", expertise: "English & Communication", school: "Media & Communication" },
  { name: "Ravikant Kisana", expertise: "History & Social Theory", school: "Social Science" },
  { name: "Samdish Chumber", expertise: "Economics", school: "Management School" },
  { name: "Meera Joshi", expertise: "Data Science & Statistics", school: "Data Science" },
  { name: "Arjun Rao", expertise: "Law & Constitution", school: "Law School" },
];

export interface CommunityLibrary {
  name: string;
  location: string;
  description: string;
}

export const COMMUNITY_LIBRARIES: CommunityLibrary[] = [
  { name: "Nalanda Library, Wardha", location: "Wardha, Maharashtra", description: "Our flagship community learning centre." },
  { name: "Nagpur Reading Hub", location: "Nagpur, Maharashtra", description: "Books, internet access, and study space." },
  { name: "Patna Knowledge Centre", location: "Patna, Bihar", description: "Free resources for competitive exam aspirants." },
  { name: "Aurangabad Library", location: "Aurangabad, Maharashtra", description: "A quiet place to learn and grow." },
];
