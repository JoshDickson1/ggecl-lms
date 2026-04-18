// src/data/searchUtils.ts
// Shared search result types and aggregation helpers for all search pages.
  
import {
  instructors,
  type Instructor,
} from "./Instructors";
import { categories, type Category } from "./categories";
import { students, type Student } from "./Student";
import { admins, type Admin } from "./Admins";
import { courses, type Course } from "./courses";

export type SearchBase = "student" | "instructor" | "admin" | "landing";

export type SearchResultType =
  | "course"
  | "instructor"
  | "category"
  | "student"
  | "admin"
  | "assignment"
  | "group";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  thumbnail?: string;
  badge?: string;
  icon?: string;
  avatarBg?: string;
  avatar?: string;
  tag?: string;
  raw: Course | Instructor | Category | Student | Admin | unknown;
};

// ─── Adapters ─────────────────────────────────────────────────────────────────

function courseToResult(c: Course): SearchResult {
  return {
    id: c.id,
    type: "course",
    title: c.title,
    subtitle: `by ${c.instructor.name} · ${c.rating}★ · ${(c.students / 1000).toFixed(1)}k students`,
    thumbnail: c.thumbnail,
    badge: c.badge,
    tag: c.level,
    raw: c,
  };
}

function instructorToResult(i: Instructor): SearchResult {
  return {
    id: i.id,
    type: "instructor",
    title: i.name,
    subtitle: `${i.title} · ${i.courses} courses · ${(i.students / 1000).toFixed(1)}k students`,
    avatar: i.avatar,
    avatarBg: i.avatarBg,
    raw: i,
  };
}

function categoryToResult(c: Category): SearchResult {
  return {
    id: c.id,
    type: "category",
    title: c.title,
    subtitle: `${c.courses} courses · ${(c.students / 1000).toFixed(1)}k students`,
    icon: "📚",
    thumbnail: c.color,
    raw: c,
  };
}

function studentToResult(s: Student): SearchResult {
  return {
    id: s.id,
    type: "student",
    title: s.name,
    subtitle: `${s.title} · ${s.enrolled} courses enrolled · ${s.location}`,
    avatar: s.avatar,
    avatarBg: s.avatarBg,
    tag: s.status,
    raw: s,
  };
}

function adminToResult(a: Admin): SearchResult {
  return {
    id: a.id,
    type: "admin",
    title: a.name,
    subtitle: `${a.department} · ${a.permissionLevel} · ${a.location}`,
    avatar: a.avatar,
    avatarBg: a.avatarBg,
    tag: a.permissionLevel,
    raw: a,
  };
}

// ─── Search functions ─────────────────────────────────────────────────────────

export function searchCourses(q: string): SearchResult[] {
  if (!q.trim()) return courses.slice(0, 6).map(courseToResult);

  const lq = q.toLowerCase();

  return courses
    .filter(
      (c) =>
        c.title.toLowerCase().includes(lq) ||
        c.instructor.name.toLowerCase().includes(lq) ||
        c.categoryId.toLowerCase().includes(lq) ||
        c.tags.some((t) => t.toLowerCase().includes(lq))
    )
    .slice(0, 8)
    .map(courseToResult);
}

export function searchInstructors(q: string): SearchResult[] {
  if (!q.trim()) return instructors.slice(0, 4).map(instructorToResult);

  const lq = q.toLowerCase();

  return instructors
    .filter(
      (i) =>
        i.name.toLowerCase().includes(lq) ||
        i.title.toLowerCase().includes(lq)
    )
    .slice(0, 6)
    .map(instructorToResult);
}

export function searchCategories(q: string): SearchResult[] {
  if (!q.trim()) return categories.slice(0, 4).map(categoryToResult);

  const lq = q.toLowerCase();

  return categories
    .filter(
      (c) =>
        c.title.toLowerCase().includes(lq) ||
        c.tags.some((t) => t.toLowerCase().includes(lq))
    )
    .slice(0, 6)
    .map(categoryToResult);
}

export function searchStudents(q: string): SearchResult[] {
  if (!q.trim()) return students.slice(0, 4).map(studentToResult);

  const lq = q.toLowerCase();

  return students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(lq) ||
        s.email.toLowerCase().includes(lq) ||
        s.location.toLowerCase().includes(lq)
    )
    .slice(0, 6)
    .map(studentToResult);
}

export function searchAdmins(q: string): SearchResult[] {
  if (!q.trim()) return admins.slice(0, 3).map(adminToResult);

  const lq = q.toLowerCase();

  return admins
    .filter(
      (a) =>
        a.name.toLowerCase().includes(lq) ||
        a.department.toLowerCase().includes(lq) ||
        a.email.toLowerCase().includes(lq)
    )
    .slice(0, 4)
    .map(adminToResult);
}

// ─── Role-based Search Access ────────────────────────────────────────────────

export function getSearchResultsByRole(
  query: string,
  role: SearchBase
): SearchResult[] {
  switch (role) {
    case "student":
      return [
        ...searchCourses(query),
        ...searchInstructors(query),
        ...searchCategories(query),
      ];

    case "instructor":
      return [
        ...searchStudents(query),
        ...searchCourses(query),
      ];

    case "admin":
      return [
        ...searchCourses(query),
        ...searchInstructors(query),
        ...searchStudents(query),
        ...searchAdmins(query),
        ...searchCategories(query),
      ];

    case "landing":
    default:
      return [
        ...searchCourses(query),
        ...searchInstructors(query),
        ...searchCategories(query),
      ];
  }
}

// ─── Route helpers ────────────────────────────────────────────────────────────

export function getResultPath(
  result: SearchResult,
  base: SearchBase
): string {
  const prefix = base === "landing" ? "" : `/${base}`;

  switch (result.type) {
    case "course":
      return `${prefix}/courses/${result.id}`;

    case "instructor":
      return `${prefix}/instructors/${result.id}`;

    case "category":
      return `${prefix}/categories/${result.id}`;

    case "student":
      return `${prefix}/students/${result.id}`;

    case "admin":
      return `${prefix}/admins/${result.id}`;

    case "assignment":
      return `${prefix}/assignments/${result.id}`;

    case "group":
      return `${prefix}/groups/${result.id}`;

    default:
      return "/";
  }
}