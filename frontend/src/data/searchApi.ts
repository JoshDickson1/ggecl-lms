// src/data/searchApi.ts
// Fetches search results from the backend and maps them to SearchResult[].
// Public endpoint  → /api/search/public  (landing page, no auth required)
// Auth endpoint    → /api/search          (student / instructor / admin)
//
// Requires in your .env:
//   VITE_API_URL=https://ggecl-lms-backend-production.up.railway.app

import type { SearchResult } from "@/data/searchUtils";

// Reads VITE_API_URL at build time — trailing slash stripped for safety
const BASE_URL = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/$/, "");

// ─── Raw API shapes (matches OpenAPI spec) ────────────────────────────────────

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  img?: string;
  price: number;
  level: string;
  badge?: string;
  averageRating: number;
  totalStar: number;
  tags: string[];
  instructor: {
    id: string;
    department: string;
    specialization: string;
    professionalTitle: string;
    user: { id: string; name: string; image?: string };
  };
}

interface ApiCategory {
  tag: string;
  courseCount: number;
}

interface ApiInstructor {
  id: string;
  department: string;
  specialization: string;
  professionalTitle: string;
  bio: string;
  areasOfExpertise: string[];
  courseCount: number;
  user: { id: string; name: string; image?: string };
}

interface ApiStudent {
  id: string;
  matricNumber: string;
  bio: string;
  enrollmentCount: number;
  user: { id: string; name: string; image?: string | null };
}

interface ApiSearchResponse {
  query: string;
  courses?: ApiCourse[];
  categories?: ApiCategory[];
  instructors?: ApiInstructor[];
  students?: ApiStudent[];
  counts: {
    courses: number;
    categories: number;
    instructors: number;
    students: number;
  };
}

// ─── Scope type ───────────────────────────────────────────────────────────────

type SearchScope = "courses" | "categories" | "instructors" | "students";

// ─── Adapters — API shape → SearchResult ──────────────────────────────────────

function adaptCourse(c: ApiCourse): SearchResult {
  return {
    id: c.id,
    type: "course",
    title: c.title,
    subtitle: `by ${c.instructor.user.name} · ${c.averageRating}★ · ${c.totalStar} ratings`,
    thumbnail: c.img,
    badge: c.badge,
    tag: c.level,
    raw: c,
  };
}

function adaptCategory(c: ApiCategory): SearchResult {
  return {
    id: c.tag,
    type: "category",
    title: c.tag,
    subtitle: `${c.courseCount} course${c.courseCount !== 1 ? "s" : ""}`,
    icon: "📚",
    raw: c,
  };
}

function adaptInstructor(i: ApiInstructor): SearchResult {
  const initials = i.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: i.user.id,
    type: "instructor",
    title: i.user.name,
    subtitle: `${i.professionalTitle} · ${i.courseCount} course${i.courseCount !== 1 ? "s" : ""}`,
    avatar: initials,
    avatarBg: "bg-violet-500",
    raw: i,
  };
}

function adaptStudent(s: ApiStudent): SearchResult {
  const initials = s.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: s.id,
    type: "student",
    title: s.user.name,
    subtitle: `${s.matricNumber} · ${s.enrollmentCount} course${s.enrollmentCount !== 1 ? "s" : ""} enrolled`,
    avatar: initials,
    avatarBg: "bg-amber-500",
    raw: s,
  };
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function fetchSearch(
  q: string,
  scopes: SearchScope[],
  isPublic: boolean
): Promise<ApiSearchResponse> {
  const path = isPublic ? "/api/search/public" : "/api/search";
  const url = new URL(`${BASE_URL}${path}`);

  url.searchParams.set("q", q);
  scopes.forEach((s) => url.searchParams.append("scope", s));

  const res = await fetch(url.toString(), {
    credentials: isPublic ? "omit" : "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ApiSearchResponse>;
}

// ─── Public search (landing page) ────────────────────────────────────────────

export async function publicSearchCourses(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["courses"], true);
  return (data.courses ?? []).map(adaptCourse);
}

export async function publicSearchCategories(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["categories"], true);
  return (data.categories ?? []).map(adaptCategory);
}

export async function publicSearchInstructors(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["instructors"], true);
  return (data.instructors ?? []).map(adaptInstructor);
}

// ─── Authenticated search (student / instructor / admin) ──────────────────────

export async function authSearchCourses(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["courses"], false);
  return (data.courses ?? []).map(adaptCourse);
}

export async function authSearchCategories(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["categories"], false);
  return (data.categories ?? []).map(adaptCategory);
}

export async function authSearchInstructors(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["instructors"], false);
  return (data.instructors ?? []).map(adaptInstructor);
}

export async function authSearchStudents(q: string): Promise<SearchResult[]> {
  const data = await fetchSearch(q, ["students"], false);
  return (data.students ?? []).map(adaptStudent);
}

// ─── Batched helpers (single round-trip for all scopes) ───────────────────────

export async function publicSearchAll(q: string): Promise<{
  courses: SearchResult[];
  categories: SearchResult[];
  instructors: SearchResult[];
}> {
  const data = await fetchSearch(q, ["courses", "categories", "instructors"], true);
  return {
    courses:     (data.courses     ?? []).map(adaptCourse),
    categories:  (data.categories  ?? []).map(adaptCategory),
    instructors: (data.instructors ?? []).map(adaptInstructor),
  };
}

export async function authSearchAll(
  q: string,
  includeStudents = false
): Promise<{
  courses: SearchResult[];
  categories: SearchResult[];
  instructors: SearchResult[];
  students: SearchResult[];
}> {
  const scopes: SearchScope[] = ["courses", "categories", "instructors"];
  if (includeStudents) scopes.push("students");

  const data = await fetchSearch(q, scopes, false);
  return {
    courses:     (data.courses     ?? []).map(adaptCourse),
    categories:  (data.categories  ?? []).map(adaptCategory),
    instructors: (data.instructors ?? []).map(adaptInstructor),
    students:    (data.students    ?? []).map(adaptStudent),
  };
}