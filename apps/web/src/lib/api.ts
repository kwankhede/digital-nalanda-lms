// Tiny API helper for the Django backend.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CourseListItem {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  category: Category | null;
  level: string;
  language: string;
  thumbnail_url: string;
  is_free: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  slug: string;
  lesson_type: string;
  youtube_video_id: string;
  content: string;
  blocks?: import("@/lib/blocks").Block[];
  order: number;
  duration_minutes: number;
  is_preview: boolean;
}

export interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseDetail extends CourseListItem {
  description: string;
  created_at: string;
  updated_at: string;
  modules: Module[];
}

interface Paginated<T> {
  count: number;
  results: T[];
}

// Server components fetch fresh data on each request.
export async function getCourses(): Promise<CourseListItem[]> {
  // Degrade gracefully: if the API is unreachable or errors, return [] so the
  // page renders its empty state instead of crashing.
  try {
    const res = await fetch(`${API_URL}/api/courses/`, { cache: "no-store" });
    if (!res.ok) return [];
    const data: Paginated<CourseListItem> = await res.json();
    return data.results;
  } catch {
    return [];
  }
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/courses/${slug}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- Public certificate verification ---
export interface CertificateVerification {
  student_name: string;
  course_name: string;
  certificate_number: string;
  issue_date: string;
  status: "valid" | "invalid";
}

export async function verifyCertificate(
  code: string,
): Promise<CertificateVerification | null> {
  const res = await fetch(`${API_URL}/api/certificates/verify/${code}/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// --- Homepage: recordings + upcoming (public) ---
export interface HomeRecording {
  id: number;
  title: string;
  slug: string;
  recording_title: string;
  recording_url: string;
  recording_thumbnail_url: string;
  recording_duration_minutes: number | null;
  start_time: string;
  mentor_name: string | null;
  course_title: string | null;
}

export interface HomeUpcomingItem {
  id: string;
  type: "live_session" | "event";
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  thumbnail_url: string;
  join_or_register_url: string;
  status: string;
  speaker_or_mentor: string | null;
}

export async function getHomeRecordings(): Promise<HomeRecording[]> {
  try {
    const res = await fetch(`${API_URL}/api/home/recordings/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getHomeUpcoming(
  opts?: { limit?: number; days?: number },
): Promise<HomeUpcomingItem[]> {
  try {
    const qs = new URLSearchParams();
    if (opts?.limit) qs.set("limit", String(opts.limit));
    if (opts?.days) qs.set("days", String(opts.days));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetch(`${API_URL}/api/home/upcoming/${suffix}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// --- Homepage content (schools, paths, educators, libraries, impact) ---

export interface SchoolDTO {
  id?: number;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  icon: string;
  image_url?: string;
  course_count: number;
  is_featured?: boolean;
}
export interface SchoolDetailDTO extends SchoolDTO {
  long_description?: string;
  hero_image_url?: string;
}
export interface PathDTO {
  id?: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  course_count: number;
}
export interface PathCourseDTO {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  thumbnail_url: string;
  level: string;
  order: number;
}
export interface PathDetailDTO extends PathDTO {
  image_url?: string;
  courses: PathCourseDTO[];
}
export interface EducatorDTO {
  id?: number;
  name: string;
  slug?: string;
  title?: string;
  expertise: string;
  school: string;
  bio?: string;
  photo_url?: string;
  is_featured?: boolean;
}
export interface EducatorDetailDTO extends EducatorDTO {
  long_bio?: string;
  linkedin_url?: string;
  website_url?: string;
}
export interface LibraryDTO {
  id?: number;
  name: string;
  location: string;
  description: string;
}
export interface ImpactStat {
  value: number;
  suffix: string;
  label: string;
}

async function getList<T>(path: string): Promise<T[]> {
  // List endpoints degrade to [] on failure; callers render empty/fallback UI.
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// DB-driven (no static fallback). Components handle loading/error/empty.
export const getSchools = () => getList<SchoolDTO>("/api/schools/");
export async function getSchool(slug: string): Promise<SchoolDetailDTO | null> {
  const res = await fetch(`${API_URL}/api/schools/${slug}/`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load school");
  return res.json();
}
export const getLearningPaths = () => getList<PathDTO>("/api/learning-paths/");
export async function getLearningPath(slug: string): Promise<PathDetailDTO | null> {
  try {
    const res = await fetch(`${API_URL}/api/learning-paths/${slug}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
export const getEducators = () => getList<EducatorDTO>("/api/educators/featured/");
export const getAllEducators = () => getList<EducatorDTO>("/api/educators/");
export async function getEducator(slug: string): Promise<EducatorDetailDTO | null> {
  try {
    const res = await fetch(`${API_URL}/api/educators/${slug}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
export const getCommunityLibraries = () => getList<LibraryDTO>("/api/community-libraries/");

export interface StudyMaterialDTO {
  id: number;
  title: string;
  description: string;
  category: string;
  resource_type: string;
  url: string;
}
export const getStudyMaterials = () => getList<StudyMaterialDTO>("/api/study-materials/");

export interface TickerDTO {
  id: number;
  text: string;
  link: string;
}
export const getTicker = () => getList<TickerDTO>("/api/ticker/");
export const getImpact = () => getList<ImpactStat>("/api/home/impact/");
export const getFeaturedCourses = () => getList<CourseListItem>("/api/courses/featured/");

// --- Stories ---
export interface StoryListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featured_image: string;
  student_name: string;
  institution: string;
  city: string;
  graduation_year: string;
  quote: string;
  is_featured: boolean;
  category: string | null;
  published_at: string | null;
}

export interface StoryMediaItem {
  id: number;
  media_type: string;
  url: string;
  caption: string;
  order: number;
}

export interface StoryDetail extends StoryListItem {
  content: string;
  media: StoryMediaItem[];
}

export const getStories = () => getList<StoryListItem>("/api/stories/");
export const getFeaturedStories = () => getList<StoryListItem>("/api/stories/featured/");

export async function getStory(slug: string): Promise<StoryDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/stories/${slug}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
