"use client";

import { authFetch } from "@/lib/auth";

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let d = "Request failed";
    try {
      d = (await r.json()).detail ?? d;
    } catch {}
    throw new Error(d);
  }
  return r.json();
}

export interface CourseVersion {
  id: number;
  version_number: number;
  label: string;
  change_summary: string;
  is_published_snapshot: boolean;
  created_by_name: string;
  created_at: string;
  module_count: number;
  lesson_count: number;
}

export interface FieldChange {
  old: unknown;
  new: unknown;
}
export interface LessonChange {
  id: number;
  title: string;
  fields?: string[];
}
export interface ModuleChange {
  id: number;
  title: string;
  lesson_count?: number;
  fields?: Record<string, FieldChange>;
  lessons?: {
    added: LessonChange[];
    removed: LessonChange[];
    modified: LessonChange[];
  };
}
export interface Diff {
  course: Record<string, FieldChange>;
  modules: {
    added: ModuleChange[];
    removed: ModuleChange[];
    modified: ModuleChange[];
  };
}
export interface WorkingDiff {
  base_version: number | null;
  base_is_published: boolean;
  has_changes: boolean;
  diff: Diff;
}
export interface CompareResult {
  from_version: number;
  to_version: number;
  has_changes: boolean;
  diff: Diff;
}

export const getVersions = (courseId: number) =>
  authFetch(`/api/creator/courses/${courseId}/versions/`).then((r) => j<CourseVersion[]>(r));

export const createCheckpoint = (courseId: number, body: { label?: string; change_summary?: string }) =>
  authFetch(`/api/creator/courses/${courseId}/versions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => j<CourseVersion>(r));

export const getWorkingDiff = (courseId: number) =>
  authFetch(`/api/creator/courses/${courseId}/diff/`).then((r) => j<WorkingDiff>(r));

export const compareVersions = (courseId: number, a: number, b: number) =>
  authFetch(`/api/creator/courses/${courseId}/versions/${a}/compare/${b}/`).then((r) => j<CompareResult>(r));

export const restoreVersion = (courseId: number, number: number) =>
  authFetch(`/api/creator/courses/${courseId}/versions/${number}/restore/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((r) => j<{ detail: string; versions: CourseVersion[] }>(r));

/** Count total changes in a diff for a quick summary badge. */
export function diffCounts(diff: Diff) {
  const m = diff.modules;
  let lessons = 0;
  for (const mod of m.modified) {
    const l = mod.lessons;
    if (l) lessons += l.added.length + l.removed.length + l.modified.length;
  }
  return {
    courseFields: Object.keys(diff.course || {}).length,
    modulesAdded: m.added.length,
    modulesRemoved: m.removed.length,
    modulesModified: m.modified.length,
    lessons,
  };
}
