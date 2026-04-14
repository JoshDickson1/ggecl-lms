import {
  Code2,
  Megaphone,
  Atom,
  PenLine,
  ListOrdered,
  HeartPulse,
  Music4,
  Telescope,
  Briefcase,
  Camera,
  FlaskConical,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Category = {
  id: string;
  title: string;
  icon: LucideIcon;
  courses: number;
  popularity: number;
  tags: string[];
  students: number;
  color: string; // tailwind gradient classes
  students_avatars: { initials: string; bg: string }[];
};

export const categories: Category[] = [
  {
    id: "development",
    title: "Development",
    icon: Code2,
    courses: 13,
    popularity: 94,
    tags: ["Hot 🔥", "All levels"],
    students: 8100,
    color: "from-blue-500 to-cyan-400",
    students_avatars: [
      { initials: "B", bg: "bg-blue-500" },
      { initials: "C", bg: "bg-emerald-500" },
      { initials: "A", bg: "bg-pink-500" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    icon: Megaphone,
    courses: 12,
    popularity: 85,
    tags: ["Intermediate", "New"],
    students: 5300,
    color: "from-violet-500 to-purple-400",
    students_avatars: [
      { initials: "C", bg: "bg-cyan-500" },
      { initials: "A", bg: "bg-emerald-500" },
      { initials: "B", bg: "bg-pink-500" },
    ],
  },
  {
    id: "physics",
    title: "Physics",
    icon: Atom,
    courses: 14,
    popularity: 71,
    tags: ["Advanced", "Certified"],
    students: 3700,
    color: "from-rose-500 to-orange-400",
    students_avatars: [
      { initials: "A", bg: "bg-blue-500" },
      { initials: "B", bg: "bg-pink-500" },
      { initials: "C", bg: "bg-violet-500" },
    ],
  },
  {
    id: "astrology",
    title: "Astrology",
    icon: Telescope,
    courses: 11,
    popularity: 78,
    tags: ["Beginner", "Certified"],
    students: 2400,
    color: "from-indigo-500 to-blue-400",
    students_avatars: [
      { initials: "A", bg: "bg-pink-500" },
      { initials: "B", bg: "bg-emerald-500" },
      { initials: "C", bg: "bg-blue-500" },
    ],
  },
  {
    id: "writing",
    title: "Writing",
    icon: PenLine,
    courses: 9,
    popularity: 66,
    tags: ["Beginner", "All levels"],
    students: 1900,
    color: "from-amber-500 to-yellow-400",
    students_avatars: [
      { initials: "D", bg: "bg-violet-500" },
      { initials: "E", bg: "bg-rose-500" },
      { initials: "F", bg: "bg-cyan-500" },
    ],
  },
  {
    id: "management",
    title: "Management",
    icon: ListOrdered,
    courses: 10,
    popularity: 80,
    tags: ["Intermediate", "Certified"],
    students: 4200,
    color: "from-teal-500 to-emerald-400",
    students_avatars: [
      { initials: "G", bg: "bg-amber-500" },
      { initials: "H", bg: "bg-blue-500" },
      { initials: "I", bg: "bg-pink-500" },
    ],
  },
  {
    id: "health",
    title: "Health",
    icon: HeartPulse,
    courses: 8,
    popularity: 73,
    tags: ["All levels", "New"],
    students: 3100,
    color: "from-pink-500 to-rose-400",
    students_avatars: [
      { initials: "J", bg: "bg-emerald-500" },
      { initials: "K", bg: "bg-violet-500" },
      { initials: "L", bg: "bg-blue-500" },
    ],
  },
  {
    id: "music",
    title: "Music",
    icon: Music4,
    courses: 7,
    popularity: 69,
    tags: ["Beginner", "Hot 🔥"],
    students: 2700,
    color: "from-fuchsia-500 to-pink-400",
    students_avatars: [
      { initials: "M", bg: "bg-cyan-500" },
      { initials: "N", bg: "bg-amber-500" },
      { initials: "O", bg: "bg-rose-500" },
    ],
  },
  {
    id: "business",
    title: "Business",
    icon: Briefcase,
    courses: 15,
    popularity: 88,
    tags: ["Advanced", "Hot 🔥"],
    students: 6800,
    color: "from-sky-500 to-blue-400",
    students_avatars: [
      { initials: "P", bg: "bg-violet-500" },
      { initials: "Q", bg: "bg-pink-500" },
      { initials: "R", bg: "bg-emerald-500" },
    ],
  },
  {
    id: "photography",
    title: "Photography",
    icon: Camera,
    courses: 6,
    popularity: 62,
    tags: ["Beginner", "New"],
    students: 1500,
    color: "from-orange-500 to-amber-400",
    students_avatars: [
      { initials: "S", bg: "bg-blue-500" },
      { initials: "T", bg: "bg-cyan-500" },
      { initials: "U", bg: "bg-rose-500" },
    ],
  },
  {
    id: "science",
    title: "Science",
    icon: FlaskConical,
    courses: 11,
    popularity: 76,
    tags: ["Intermediate", "Certified"],
    students: 3400,
    color: "from-lime-500 to-green-400",
    students_avatars: [
      { initials: "V", bg: "bg-violet-500" },
      { initials: "W", bg: "bg-amber-500" },
      { initials: "X", bg: "bg-pink-500" },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    icon: Globe,
    courses: 18,
    popularity: 91,
    tags: ["All levels", "Hot 🔥"],
    students: 7200,
    color: "from-cyan-500 to-teal-400",
    students_avatars: [
      { initials: "Y", bg: "bg-blue-500" },
      { initials: "Z", bg: "bg-emerald-500" },
      { initials: "A", bg: "bg-rose-500" },
    ],
  },
]; 