// src/landing/_components/CategoriesPreview.tsx
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud, Code2, Container, Globe, Server, Database,
  Layers, Terminal, Braces, Box, Workflow,
} from "lucide-react";
import CoursesService from "@/services/course.service";

// ─── API Types ────────────────────────────────────────────────────────────────

interface PublicCourse {
  id: string;
  title: string;
  price: number;
  level: string;
  tags: string[];
  _count: { enrollments: number };
  averageRating: number;
}

interface PublicCoursesResponse {
  items: PublicCourse[];
}

// ─── Derive categories from tags ─────────────────────────────────────────────

const TAG_META: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}> = {
  gcp:            { label: "Google Cloud",    icon: Cloud,      color: "from-blue-500 to-cyan-400",      gradient: "from-blue-500/10 to-cyan-400/5"      },
  cloud:          { label: "Cloud",           icon: Cloud,      color: "from-sky-500 to-blue-400",       gradient: "from-sky-500/10 to-blue-400/5"       },
  certification:  { label: "Certification",  icon: Layers,     color: "from-violet-500 to-purple-400",  gradient: "from-violet-500/10 to-purple-400/5"  },
  devops:         { label: "DevOps",         icon: Workflow,   color: "from-orange-500 to-amber-400",   gradient: "from-orange-500/10 to-amber-400/5"   },
  docker:         { label: "Docker",         icon: Container,  color: "from-cyan-500 to-teal-400",      gradient: "from-cyan-500/10 to-teal-400/5"      },
  kubernetes:     { label: "Kubernetes",     icon: Box,        color: "from-indigo-500 to-blue-400",    gradient: "from-indigo-500/10 to-blue-400/5"    },
  react:          { label: "React",          icon: Braces,     color: "from-cyan-400 to-blue-500",      gradient: "from-cyan-400/10 to-blue-500/5"      },
  javascript:     { label: "JavaScript",     icon: Code2,      color: "from-yellow-400 to-amber-500",   gradient: "from-yellow-400/10 to-amber-500/5"   },
  frontend:       { label: "Frontend",       icon: Globe,      color: "from-pink-500 to-rose-400",      gradient: "from-pink-500/10 to-rose-400/5"      },
  aws:            { label: "AWS",            icon: Cloud,      color: "from-amber-500 to-orange-400",   gradient: "from-amber-500/10 to-orange-400/5"   },
  nestjs:         { label: "NestJS",         icon: Server,     color: "from-red-500 to-rose-400",       gradient: "from-red-500/10 to-rose-400/5"       },
  typescript:     { label: "TypeScript",     icon: Code2,      color: "from-blue-600 to-blue-400",      gradient: "from-blue-600/10 to-blue-400/5"      },
  backend:        { label: "Backend",        icon: Database,   color: "from-emerald-500 to-teal-400",   gradient: "from-emerald-500/10 to-teal-400/5"   },
};

const FALLBACK_META = {
  icon: Terminal,
  color: "from-gray-500 to-slate-400",
  gradient: "from-gray-500/10 to-slate-400/5",
};

const AVATAR_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500","bg-amber-500"];

interface DerivedCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  courseCount: number;
  totalEnrollments: number;
  tags: string[];
}

function deriveCategories(courses: PublicCourse[]): DerivedCategory[] {
  const tagMap = new Map<string, PublicCourse[]>();

  courses.forEach(course => {
    course.tags.forEach(tag => {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag)!.push(course);
    });
  });

  return Array.from(tagMap.entries())
    .map(([tag, tagCourses]) => {
      const meta = TAG_META[tag] ?? { label: tag.charAt(0).toUpperCase() + tag.slice(1), ...FALLBACK_META };
      return {
        id:               tag,
        label:            meta.label,
        icon:             meta.icon,
        color:            meta.color,
        gradient:         meta.gradient,
        courseCount:      tagCourses.length,
        totalEnrollments: tagCourses.reduce((s, c) => s + c._count.enrollments, 0),
        tags:             [...new Set(tagCourses.flatMap(c => c.tags))].filter(t => t !== tag).slice(0, 2),
      };
    })
    .sort((a, b) => b.courseCount - a.courseCount);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

// ─── Popularity Bar ───────────────────────────────────────────────────────────

function PopularityBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" />
          Popularity
        </span>
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  index,
  maxEnrollments,
}: {
  category: DerivedCategory;
  index: number;
  maxEnrollments: number;
}) {
  const Icon = category.icon;
  const [hovered, setHovered] = useState(false);

  const avatars = AVATAR_COLORS.slice(0, 3).map((bg, i) => ({
    bg,
    initials: String.fromCharCode(65 + ((index * 3 + i) % 26)),
  }));

  const popularityPct = maxEnrollments > 0
    ? Math.min(100, Math.round((category.totalEnrollments / maxEnrollments) * 100))
    : 0;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex-shrink-0 w-[320px] rounded-[22px] p-6 flex flex-col gap-4 cursor-pointer
        bg-white/70 dark:bg-[#020618] backdrop-blur-xl
        border border-white/80 dark:border-white/[0.08] transition-shadow duration-300"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)"
          : "0 8px 30px rgba(15,23,42,0.08)",
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* Hover glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[22px] z-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 70%)" }}
      />

      {/* Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
        <motion.div
          animate={hovered ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>

      {/* Title + count */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.label}</h3>
        <p className="text-sm mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{category.courseCount}</span>
          <span className="text-gray-400 dark:text-gray-500"> courses available</span>
        </p>
      </div>

      {/* Popularity bar */}
      <div className="relative z-10">
        <PopularityBar value={popularityPct} color={category.color} />
      </div>

      {/* Tags */}
      {category.tags.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-2">
          {category.tags.map(tag => (
            <span key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold
                border border-gray-200 dark:border-white/[0.10]
                text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.04]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="relative z-10 h-px bg-gray-100 dark:bg-white/[0.06]" />

      {/* Bottom: students + arrow */}
      <div className="relative z-10 flex items-center gap-3 mt-auto">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl
          bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
          <div className="flex -space-x-2">
            {avatars.map((av, i) => (
              <span key={i}
                className={`w-6 h-6 rounded-full text-[10px] font-bold text-white
                  flex items-center justify-center border-2 border-white dark:border-[#020618] ${av.bg}`}>
                {av.initials}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {fmt(category.totalEnrollments)} students
          </span>
        </div>

        <Link to={`/categories/${category.id}`} onClick={e => e.stopPropagation()}>
          <motion.div
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500
              transition-colors flex items-center justify-center flex-shrink-0
              shadow-[0_4px_14px_rgba(59,130,246,0.4)]">
            <ArrowRight className="w-4 h-4 text-white" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[320px] rounded-[22px] p-6 flex flex-col gap-4
      bg-white/70 dark:bg-[#020618] border border-white/80 dark:border-white/[0.08]">
      <div className="w-14 h-14 rounded-2xl animate-pulse bg-gray-100 dark:bg-white/[0.06]" />
      <div className="space-y-2">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
      </div>
      {/* Skeleton popularity bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3 w-8 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
        </div>
        <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100 dark:bg-white/[0.06]" />
      </div>
      <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />
      <div className="h-10 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.06]" />
    </div>
  );
}

// ─── Marquee Row ─────────────────────────────────────────────────────────────

function MarqueeRow({
  items,
  maxEnrollments,
  reverse = false,
  speed = 28,
  isLoading,
}: {
  items: DerivedCategory[];
  maxEnrollments: number;
  reverse?: boolean;
  speed?: number;
  isLoading: boolean;
}) {
  const x      = useRef(0);
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);
  const doubled = [...items, ...items];
  const cardW   = 320 + 20;
  const totalW  = items.length * cardW;

  useAnimationFrame((_, delta) => {
    if (paused || isLoading || items.length === 0) return;
    const dir = reverse ? 1 : -1;
    x.current += dir * (speed / 1000) * delta;
    if (x.current <= -totalW) x.current += totalW;
    if (x.current >= 0) x.current -= totalW;
    setPos(x.current);
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden w-full py-4">
        <div className="flex gap-5 px-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden w-full py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-5"
        style={{ transform: `translateX(${pos}px)`, willChange: "transform" }}
      >
        {doubled.map((cat, i) => (
          <CategoryCard
            key={`${cat.id}-${i}`}
            category={cat}
            index={i}
            maxEnrollments={maxEnrollments}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function CategoriesPreview() {
  const { data, isLoading } = useQuery<PublicCoursesResponse>({
    queryKey: ["courses-public-all"],
    queryFn:  () => CoursesService.findAllPublic() as Promise<PublicCoursesResponse>,
    staleTime: 1000 * 60 * 10,
  });

  const categories = deriveCategories(data?.items ?? []);

  // Compute max enrollments once so every card in both rows uses the same scale
  const maxEnrollments = useMemo(
    () => Math.max(1, ...categories.map(c => c.totalEnrollments)),
    [categories],
  );

  const row1 = categories.slice(0, Math.ceil(categories.length / 2));
  const row2 = categories.slice(Math.ceil(categories.length / 2));

  return (
    <section className="relative py-20 overflow-hidden bg-gray-50/50 dark:bg-[#080d18]">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
          radial-gradient(circle 600px at 0% 10%, rgba(59,130,246,0.08), transparent 60%),
          radial-gradient(circle 500px at 100% 0%, rgba(96,165,250,0.07), transparent 55%)
        `,
        backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
      }} />

      {/* Fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20"
        style={{ width: "20%", background: "linear-gradient(to right, var(--section-bg, #f9fafb) 20%, transparent 100%)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20"
        style={{ width: "20%", background: "linear-gradient(to left, var(--section-bg, #f9fafb) 20%, transparent 100%)" }} />

      {/* Header */}
      <div className="relative z-30 max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Browse by field</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Top <span className="text-blue-600 dark:text-blue-400">Categories</span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-sm">
              Find your perfect learning path across our most popular disciplines.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/categories"
              className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-full
                bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold
                shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors duration-200">
              Explore all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="relative z-10 flex flex-col gap-5">
        <MarqueeRow items={row1} maxEnrollments={maxEnrollments} reverse={false} speed={28} isLoading={isLoading} />
        {row2.length > 0 && (
          <MarqueeRow items={row2} maxEnrollments={maxEnrollments} reverse={true} speed={22} isLoading={isLoading} />
        )}
      </div>

      <style>{`:root { --section-bg: #f9fafb; } .dark { --section-bg: #080d18; }`}</style>
    </section>
  );
}