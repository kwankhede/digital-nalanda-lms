// Tiny API helper for the Django backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
  const res = await fetch(`${API_URL}/api/courses/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load courses");
  const data: Paginated<CourseListItem> = await res.json();
  return data.results;
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  const res = await fetch(`${API_URL}/api/courses/${slug}/`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load course");
  return res.json();
}
