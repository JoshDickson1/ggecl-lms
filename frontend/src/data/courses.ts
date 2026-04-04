import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Megaphone,
  Atom,
  Telescope,
  PenLine,
  ListOrdered,
  HeartPulse,
  Music4,
  Briefcase,
  Camera,
  FlaskConical,
  Globe,
} from "lucide-react";

export type Instructor = {
  id: string;
  name: string;
  avatar: string; // initials fallback
  avatarBg: string; // tailwind bg class
  title: string;
  rating: number;
  students: number;
  courses: number;
};

export type Course = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  instructor: Instructor;
  thumbnail: string; // gradient classes used as bg fallback
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  students: number;
  duration: string; // e.g. "12h 30m"
  lectures: number;
  level: "Beginner" | "Intermediate" | "Advanced" | "All levels";
  tags: string[];
  badge?: "Bestseller" | "Hot & New" | "New";
  lastUpdated: string;
  icon: LucideIcon;
};

// ─── Instructors pool ────────────────────────────────────────────────────────
export const instructors: Instructor[] = [
  {
    id: "inst-1",
    name: "Sarah Mitchell",
    avatar: "SM",
    avatarBg: "bg-blue-500",
    title: "Senior Software Engineer",
    rating: 4.9,
    students: 24300,
    courses: 8,
  },
  {
    id: "inst-2",
    name: "James Okafor",
    avatar: "JO",
    avatarBg: "bg-emerald-500",
    title: "Full Stack Developer & Educator",
    rating: 4.8,
    students: 18700,
    courses: 6,
  },
  {
    id: "inst-3",
    name: "Amara Nwosu",
    avatar: "AN",
    avatarBg: "bg-pink-500",
    title: "Marketing Strategist",
    rating: 4.7,
    students: 12400,
    courses: 5,
  },
  {
    id: "inst-4",
    name: "David Chen",
    avatar: "DC",
    avatarBg: "bg-violet-500",
    title: "Physics Professor, MIT",
    rating: 4.9,
    students: 9800,
    courses: 4,
  },
  {
    id: "inst-5",
    name: "Fatima Al-Hassan",
    avatar: "FA",
    avatarBg: "bg-amber-500",
    title: "Astrophysicist & Researcher",
    rating: 4.8,
    students: 7600,
    courses: 3,
  },
  {
    id: "inst-6",
    name: "Luca Romano",
    avatar: "LR",
    avatarBg: "bg-cyan-500",
    title: "Creative Director & Writer",
    rating: 4.6,
    students: 5400,
    courses: 5,
  },
  {
    id: "inst-7",
    name: "Priya Sharma",
    avatar: "PS",
    avatarBg: "bg-rose-500",
    title: "Business Coach & MBA",
    rating: 4.8,
    students: 16200,
    courses: 7,
  },
  {
    id: "inst-8",
    name: "Marcus Thompson",
    avatar: "MT",
    avatarBg: "bg-teal-500",
    title: "Health & Wellness Expert",
    rating: 4.7,
    students: 8900,
    courses: 4,
  },
];

// ─── Courses ─────────────────────────────────────────────────────────────────
export const courses: Course[] = [
  // ── Development ────────────────────────────────────────────────────────────
  {
    id: "dev-001",
    categoryId: "development",
    title: "The Complete React & TypeScript Bootcamp 2024",
    description:
      "Master React 18, TypeScript, Hooks, Context API, and build real-world projects from scratch.",
    instructor: instructors[0],
    thumbnail: "from-blue-500 to-cyan-400",
    price: 14.99,
    originalPrice: 89.99,
    rating: 4.9,
    reviews: 12400,
    students: 54200,
    duration: "42h 15m",
    lectures: 312,
    level: "All levels",
    tags: ["Hot 🔥", "All levels"],
    badge: "Bestseller",
    lastUpdated: "March 2024",
    icon: Code2,
  },
  {
    id: "dev-002",
    categoryId: "development",
    title: "Node.js, Express & MongoDB: Backend Masterclass",
    description:
      "Build scalable REST APIs, authenticate users, and deploy to production with confidence.",
    instructor: instructors[1],
    thumbnail: "from-green-500 to-emerald-400",
    price: 12.99,
    originalPrice: 79.99,
    rating: 4.8,
    reviews: 8700,
    students: 38100,
    duration: "36h 40m",
    lectures: 264,
    level: "Intermediate",
    tags: ["Intermediate", "New"],
    badge: "Hot & New",
    lastUpdated: "February 2024",
    icon: Code2,
  },
  {
    id: "dev-003",
    categoryId: "development",
    title: "Python for Data Science & Machine Learning",
    description:
      "From Python basics to ML models — pandas, numpy, scikit-learn and more.",
    instructor: instructors[0],
    thumbnail: "from-yellow-500 to-orange-400",
    price: 13.99,
    originalPrice: 94.99,
    rating: 4.7,
    reviews: 6300,
    students: 29400,
    duration: "28h 55m",
    lectures: 198,
    level: "Beginner",
    tags: ["Beginner", "Certified"],
    lastUpdated: "January 2024",
    icon: Code2,
  },

  // ── Marketing ──────────────────────────────────────────────────────────────
  {
    id: "mkt-001",
    categoryId: "marketing",
    title: "Digital Marketing Masterclass: SEO, Ads & Social",
    description:
      "A complete guide to growing any business online — from Google Ads to viral content strategy.",
    instructor: instructors[2],
    thumbnail: "from-violet-500 to-purple-400",
    price: 11.99,
    originalPrice: 84.99,
    rating: 4.8,
    reviews: 9200,
    students: 41600,
    duration: "31h 20m",
    lectures: 228,
    level: "All levels",
    tags: ["Hot 🔥", "All levels"],
    badge: "Bestseller",
    lastUpdated: "March 2024",
    icon: Megaphone,
  },
  {
    id: "mkt-002",
    categoryId: "marketing",
    title: "Content Marketing & Copywriting Secrets",
    description:
      "Write copy that converts. Learn storytelling, email marketing, and content strategy.",
    instructor: instructors[5],
    thumbnail: "from-pink-500 to-rose-400",
    price: 10.99,
    originalPrice: 69.99,
    rating: 4.6,
    reviews: 4100,
    students: 17800,
    duration: "18h 10m",
    lectures: 142,
    level: "Beginner",
    tags: ["Beginner", "New"],
    badge: "New",
    lastUpdated: "March 2024",
    icon: Megaphone,
  },

  // ── Physics ────────────────────────────────────────────────────────────────
  {
    id: "phy-001",
    categoryId: "physics",
    title: "Quantum Mechanics: From Zero to Uncertainty",
    description:
      "Understand wave functions, operators, and the Schrödinger equation with crystal-clear intuition.",
    instructor: instructors[3],
    thumbnail: "from-rose-500 to-orange-400",
    price: 15.99,
    originalPrice: 99.99,
    rating: 4.9,
    reviews: 3800,
    students: 14200,
    duration: "22h 30m",
    lectures: 176,
    level: "Advanced",
    tags: ["Advanced", "Certified"],
    badge: "Bestseller",
    lastUpdated: "January 2024",
    icon: Atom,
  },
  {
    id: "phy-002",
    categoryId: "physics",
    title: "Classical Mechanics & Thermodynamics Explained",
    description:
      "Newton's laws to entropy — a rigorous yet accessible journey through classical physics.",
    instructor: instructors[3],
    thumbnail: "from-orange-500 to-amber-400",
    price: 13.99,
    originalPrice: 84.99,
    rating: 4.7,
    reviews: 2900,
    students: 10600,
    duration: "19h 45m",
    lectures: 152,
    level: "Intermediate",
    tags: ["Intermediate", "Certified"],
    lastUpdated: "December 2023",
    icon: Atom,
  },

  // ── Astrology ──────────────────────────────────────────────────────────────
  {
    id: "ast-001",
    categoryId: "astrology",
    title: "Modern Astrology: Birth Charts & Transits",
    description:
      "Read natal charts, understand planetary transits, and predict life cycles with confidence.",
    instructor: instructors[4],
    thumbnail: "from-indigo-500 to-blue-400",
    price: 9.99,
    originalPrice: 59.99,
    rating: 4.7,
    reviews: 5600,
    students: 21300,
    duration: "16h 50m",
    lectures: 128,
    level: "Beginner",
    tags: ["Beginner", "Certified"],
    badge: "Hot & New",
    lastUpdated: "February 2024",
    icon: Telescope,
  },

  // ── Writing ────────────────────────────────────────────────────────────────
  {
    id: "wri-001",
    categoryId: "writing",
    title: "Creative Writing: From Blank Page to Published",
    description:
      "Develop your voice, craft compelling characters, and finish the story you've always wanted to write.",
    instructor: instructors[5],
    thumbnail: "from-amber-500 to-yellow-400",
    price: 10.99,
    originalPrice: 64.99,
    rating: 4.6,
    reviews: 3200,
    students: 12900,
    duration: "14h 20m",
    lectures: 112,
    level: "All levels",
    tags: ["Beginner", "All levels"],
    lastUpdated: "January 2024",
    icon: PenLine,
  },

  // ── Management ─────────────────────────────────────────────────────────────
  {
    id: "mgmt-001",
    categoryId: "management",
    title: "Project Management Professional (PMP) Prep",
    description:
      "Everything you need to pass the PMP exam and lead complex projects in any industry.",
    instructor: instructors[6],
    thumbnail: "from-teal-500 to-emerald-400",
    price: 16.99,
    originalPrice: 109.99,
    rating: 4.8,
    reviews: 7400,
    students: 32100,
    duration: "38h 00m",
    lectures: 284,
    level: "Intermediate",
    tags: ["Intermediate", "Certified"],
    badge: "Bestseller",
    lastUpdated: "March 2024",
    icon: ListOrdered,
  },

  // ── Health ─────────────────────────────────────────────────────────────────
  {
    id: "hlt-001",
    categoryId: "health",
    title: "Nutrition Science & Healthy Living Blueprint",
    description:
      "Evidence-based nutrition, meal planning, and lifestyle habits backed by the latest research.",
    instructor: instructors[7],
    thumbnail: "from-pink-500 to-rose-400",
    price: 11.99,
    originalPrice: 74.99,
    rating: 4.7,
    reviews: 4800,
    students: 19600,
    duration: "20h 15m",
    lectures: 158,
    level: "All levels",
    tags: ["All levels", "New"],
    badge: "New",
    lastUpdated: "February 2024",
    icon: HeartPulse,
  },

  // ── Music ──────────────────────────────────────────────────────────────────
  {
    id: "mus-001",
    categoryId: "music",
    title: "Music Production with Ableton Live 11",
    description:
      "Beat making, sound design, mixing and mastering — produce professional tracks from your bedroom.",
    instructor: instructors[5],
    thumbnail: "from-fuchsia-500 to-pink-400",
    price: 12.99,
    originalPrice: 79.99,
    rating: 4.8,
    reviews: 6100,
    students: 24700,
    duration: "24h 30m",
    lectures: 186,
    level: "Beginner",
    tags: ["Beginner", "Hot 🔥"],
    badge: "Hot & New",
    lastUpdated: "March 2024",
    icon: Music4,
  },

  // ── Business ──────────────────────────────────────────────────────────────
  {
    id: "biz-001",
    categoryId: "business",
    title: "The Complete Entrepreneurship & Startup Playbook",
    description:
      "Validate ideas, raise funding, build teams, and scale your startup from zero to one.",
    instructor: instructors[6],
    thumbnail: "from-sky-500 to-blue-400",
    price: 14.99,
    originalPrice: 94.99,
    rating: 4.9,
    reviews: 11200,
    students: 47800,
    duration: "44h 10m",
    lectures: 328,
    level: "All levels",
    tags: ["Advanced", "Hot 🔥"],
    badge: "Bestseller",
    lastUpdated: "March 2024",
    icon: Briefcase,
  },
  {
    id: "biz-002",
    categoryId: "business",
    title: "Financial Modelling & Valuation Analyst (FMVA)",
    description:
      "Build financial models in Excel, value companies, and prepare for investment banking roles.",
    instructor: instructors[6],
    thumbnail: "from-blue-600 to-indigo-400",
    price: 17.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 5600,
    students: 21400,
    duration: "32h 20m",
    lectures: 242,
    level: "Advanced",
    tags: ["Advanced", "Certified"],
    lastUpdated: "February 2024",
    icon: Briefcase,
  },

  // ── Photography ───────────────────────────────────────────────────────────
  {
    id: "pho-001",
    categoryId: "photography",
    title: "Photography Masterclass: From Auto to Manual",
    description:
      "Master exposure, composition, lighting and post-processing in Lightroom and Photoshop.",
    instructor: instructors[5],
    thumbnail: "from-orange-500 to-amber-400",
    price: 10.99,
    originalPrice: 69.99,
    rating: 4.7,
    reviews: 4300,
    students: 18200,
    duration: "17h 45m",
    lectures: 138,
    level: "Beginner",
    tags: ["Beginner", "New"],
    lastUpdated: "January 2024",
    icon: Camera,
  },

  // ── Science ───────────────────────────────────────────────────────────────
  {
    id: "sci-001",
    categoryId: "science",
    title: "Molecular Biology & Genetics Fundamentals",
    description:
      "DNA, RNA, protein synthesis, CRISPR and the future of gene editing explained clearly.",
    instructor: instructors[3],
    thumbnail: "from-lime-500 to-green-400",
    price: 13.99,
    originalPrice: 84.99,
    rating: 4.8,
    reviews: 3700,
    students: 15800,
    duration: "21h 00m",
    lectures: 164,
    level: "Intermediate",
    tags: ["Intermediate", "Certified"],
    badge: "Hot & New",
    lastUpdated: "February 2024",
    icon: FlaskConical,
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  {
    id: "lan-001",
    categoryId: "languages",
    title: "Spanish from Zero to Conversational in 60 Days",
    description:
      "A proven immersive method — vocabulary, grammar, and real conversation practice daily.",
    instructor: instructors[2],
    thumbnail: "from-cyan-500 to-teal-400",
    price: 9.99,
    originalPrice: 54.99,
    rating: 4.8,
    reviews: 14600,
    students: 62300,
    duration: "26h 30m",
    lectures: 204,
    level: "Beginner",
    tags: ["All levels", "Hot 🔥"],
    badge: "Bestseller",
    lastUpdated: "March 2024",
    icon: Globe,
  },
  {
    id: "lan-002",
    categoryId: "languages",
    title: "French Immersion: Intermediate to Fluent",
    description:
      "Advanced grammar, idiomatic expressions, and cultural nuance to speak like a native.",
    instructor: instructors[5],
    thumbnail: "from-blue-500 to-indigo-400",
    price: 11.99,
    originalPrice: 69.99,
    rating: 4.7,
    reviews: 6800,
    students: 28900,
    duration: "22h 10m",
    lectures: 172,
    level: "Intermediate",
    tags: ["All levels", "Certified"],
    lastUpdated: "January 2024",
    icon: Globe,
  },
];

// ─── Helper: get courses by category ────────────────────────────────────────
export function getCoursesByCategory(categoryId: string): Course[] {
  return courses.filter((c) => c.categoryId === categoryId);
}

// ─── Helper: get instructors by category ────────────────────────────────────
export function getInstructorsByCategory(categoryId: string): Instructor[] {
  const cats = getCoursesByCategory(categoryId);
  const seen = new Set<string>();
  return cats
    .map((c) => c.instructor)
    .filter((inst) => {
      if (seen.has(inst.id)) return false;
      seen.add(inst.id);
      return true;
    });
}