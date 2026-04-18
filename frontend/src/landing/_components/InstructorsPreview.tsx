// src/landing/_components/InstructorsPreview.tsx
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InstructorCard } from "@/landing/_components/InstructorCard";
import { type Instructor } from "@/data/Instructors";
import UserService from "@/services/user.service";

// ─── API Types ────────────────────────────────────────────────────────────────

interface PublicInstructor {
  id: string;
  name: string;
  image: string | null;
  role: string;
  createdAt: string;
  instructorProfile: {
    bio: string | null;
    description: string | null;
    tags: string[];
    areasOfExpertise: string[];
    teachingCategories: string[];
    specialization: string | null;
    website: string | null;
  } | null;
}

// ─── Map API → Instructor shape expected by InstructorCard ───────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500",  "bg-amber-500",  "bg-cyan-500",
];

function mapToInstructor(u: PublicInstructor, i: number): Instructor {
  const profile   = u.instructorProfile;
  const nameParts = u.name.trim().split(" ");
  const initials  = nameParts.map(p => p[0]).join("").slice(0, 2).toUpperCase();

  return {
    id:          u.id,
    name:        u.name,
    avatar:      initials,
    avatarBg:    AVATAR_COLORS[i % AVATAR_COLORS.length],
    photo:       u.image ?? undefined,
    title:       profile?.specialization ?? profile?.teachingCategories?.[0] ?? "Instructor",
    bio:         profile?.bio ?? profile?.description ?? "Instructor at GGECL LMS.",
    bio2:        undefined,
    experience:  "",
    experience2: undefined,
    expertise:   profile?.areasOfExpertise ?? [],
    categoryIds: profile?.teachingCategories ?? [],
    rating:      0,
    reviews:     0,
    students:    0,
    courses:     0,
    badges:      [],
    socials:     profile?.website ? [{ platform: "website", url: profile.website }] : [],
    courseSnippets:  [],
    ratingBreakdown: [
      { star: 5, pct: 0 },
      { star: 4, pct: 0 },
      { star: 3, pct: 0 },
      { star: 2, pct: 0 },
      { star: 1, pct: 0 },
    ],
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-[24px] overflow-hidden bg-white/70 dark:bg-[#020618]
        border border-white/80 dark:border-white/[0.08]
        shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      <div className="h-48 animate-pulse bg-gray-100 dark:bg-white/[0.05]" />
      <div className="px-5 py-4 space-y-2">
        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-8 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] mt-3" />
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorsPreview() {
  const { data, isLoading } = useQuery<PublicInstructor[]>({
    queryKey: ["instructors-public-preview"],
    queryFn:  () => UserService.findAllPublic({ limit: 4 }) as Promise<PublicInstructor[]>,
    staleTime: 1000 * 60 * 10,
  });

  const preview = (data ?? []).slice(0, 4).map(mapToInstructor);

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-[#080c17]">

      {/* subtle blue grid + glow background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
            radial-gradient(circle 600px at 100% 10%, rgba(59,130,246,0.07), transparent 60%),
            radial-gradient(circle 500px at 0% 80%, rgba(96,165,250,0.06), transparent 55%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              border border-blue-200 dark:border-blue-900/60
              bg-blue-50 dark:bg-blue-950/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                Learn from the best
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Top{" "}
              <span className="text-blue-600 dark:text-blue-400">Instructors</span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-sm">
              World-class educators with real industry experience, teaching what actually matters.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/instructors"
              className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-full
                bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold
                shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors"
            >
              Meet all instructors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* 4-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} index={i} />)
            : preview.map((inst, i) => (
                <InstructorCard key={inst.id} instructor={inst} index={i} />
              ))
          }
        </div>
      </div>
    </section>
  );
} 