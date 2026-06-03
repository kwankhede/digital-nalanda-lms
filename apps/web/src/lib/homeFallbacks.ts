import type { HomeUpcomingItem } from "@/lib/api";
import type { Announcement } from "@/lib/notifications";

// Sample upcoming sessions — shown only when the API returns none, so the
// /events page and homepage card are never empty. Dates are always in the
// near future so they read as "upcoming". Real data takes over automatically.
export function sampleUpcoming(): HomeUpcomingItem[] {
  const mk = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const base = {
    type: "live_session" as const,
    description: "",
    end_time: null,
    thumbnail_url: "",
    join_or_register_url: "",
    status: "scheduled",
  };
  return [
    { ...base, id: "s1", title: "Understanding the Buddha's Teachings", speaker_or_mentor: "Ven. Tenzin Dorje", start_time: mk(3, 10) },
    { ...base, id: "s2", title: "The Indian Constitution: A People's Document", speaker_or_mentor: "Adv. Meera Krishnan", start_time: mk(5, 16) },
    { ...base, id: "s3", title: "Leadership for Social Change", speaker_or_mentor: "Prof. Anant Kumar", start_time: mk(7, 11) },
    { ...base, id: "s4", title: "Editorial Analysis & Current Affairs", speaker_or_mentor: "Fatima Ansari", start_time: mk(9, 18) },
    { ...base, id: "s5", title: "Foundations of Data Science", speaker_or_mentor: "Meera Joshi", start_time: mk(12, 17) },
    { ...base, id: "e1", type: "event", title: "Digital Nalanda Annual Educators Meet", speaker_or_mentor: "Nalanda Team", start_time: mk(20, 10) },
    { ...base, id: "e2", type: "event", title: "Open Day: Tour the Nalanda Ecosystem", speaker_or_mentor: "Nalanda Team", start_time: mk(14, 11) },
    { ...base, id: "e3", type: "event", title: "Alumni Meet & Mentorship Mixer", speaker_or_mentor: "Nalanda Alumni", start_time: mk(26, 17) },
  ];
}

// Sample announcements — shown only when the API returns none.
export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: -1, title: "New course on 'Ethics & Leadership' is now live!", content: "Enrol now from the Courses page — free, like everything at Digital Nalanda.", audience: "all", start_date: "2025-05-20" },
  { id: -2, title: "Digital Nalanda Annual Educators Meet on June 5, 2025.", content: "Educators and mentors gather to plan the year ahead.", audience: "all", start_date: "2025-05-18" },
  { id: -3, title: "Community Library Grant applications are now open.", content: "Apply to host a community library in your area.", audience: "all", start_date: "2025-05-15" },
];
