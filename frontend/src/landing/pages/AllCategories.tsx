// src/landing/pages/AllCategories.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
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

// ─── Tag meta ─────────────────────────────────────────────────────────────────

const TAG_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  gcp:           { label: "Google Cloud",   icon: Cloud,      color: "from-blue-500 to-cyan-400"     },
  cloud:         { label: "Cloud",          icon: Cloud,      color: "from-sky-500 to-blue-400"      },
  certification: { label: "Certification",  icon: Layers,     color: "from-violet-500 to-purple-400" },
  devops:        { label: "DevOps",         icon: Workflow,   color: "from-orange-500 to-amber-400"  },
  docker:        { label: "Docker",         icon: Container,  color: "from-cyan-500 to-teal-400"     },
  kubernetes:    { label: "Kubernetes",     icon: Box,        color: "from-indigo-500 to-blue-400"   },
  react:         { label: "React",          icon: Braces,     color: "from-cyan-400 to-blue-500"     },
  javascript:    { label: "JavaScript",     icon: Code2,      color: "from-yellow-400 to-amber-500"  },
  frontend:      { label: "Frontend",       icon: Globe,      color: "from-pink-500 to-rose-400"     },
  aws:           { label: "AWS",            icon: Cloud,      color: "from-amber-500 to-orange-400"  },
  nestjs:        { label: "NestJS",         icon: Server,     color: "from-red-500 to-rose-400"      },
  typescript:    { label: "TypeScript",     icon: Code2,      color: "from-blue-600 to-blue-400"     },
  backend:       { label: "Backend",        icon: Database,   color: "from-emerald-500 to-teal-400"  },
};

const FALLBACK_META = { icon: Terminal, color: "from-gray-500 to-slate-400" };
const AVATAR_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500","bg-amber-500"];

interface DerivedCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  courseCount: number;
  totalEnrollments: number;
  relatedTags: string[];
  avgRating: number;
}

function deriveCategories(courses: PublicCourse[]): DerivedCategory[] {
  const tagMap = new Map<string, PublicCourse[]>();
  courses.forEach(c => c.tags.forEach(tag => {
    if (!tagMap.has(tag)) tagMap.set(tag, []);
    tagMap.get(tag)!.push(c);
  }));

  return Array.from(tagMap.entries()).map(([tag, tagCourses]) => {
    const meta = TAG_META[tag] ?? { label: tag.charAt(0).toUpperCase() + tag.slice(1), ...FALLBACK_META };
    const rated = tagCourses.filter(c => c.averageRating > 0);
    return {
      id:               tag,
      label:            meta.label,
      icon:             meta.icon,
      color:            meta.color,
      courseCount:      tagCourses.length,
      totalEnrollments: tagCourses.reduce((s, c) => s + c._count.enrollments, 0),
      relatedTags:      [...new Set(tagCourses.flatMap(c => c.tags))].filter(t => t !== tag).slice(0, 3),
      avgRating:        rated.length ? rated.reduce((s, c) => s + c.averageRating, 0) / rated.length : 0,
    };
  }).sort((a, b) => b.courseCount - a.courseCount);
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ category, index }: { category: DerivedCategory; index: number }) {
  const Icon    = category.icon;
  const [hovered, setHovered] = useState(false);
  const avatars = AVATAR_COLORS.slice(0, 3).map((bg, i) => ({
    bg, initials: String.fromCharCode(65 + ((index * 3 + i) % 26)),
  }));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col gap-4 rounded-[22px] p-6 cursor-pointer
        bg-white/70 dark:bg-[#020618] backdrop-blur-xl
        border border-white/80 dark:border-white/[0.08] transition-shadow duration-300"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)"
          : "0 8px 30px rgba(15,23,42,0.08)",
      }}
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-[22px] z-0"
        animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 70%)" }}
      />

      {/* Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
        <motion.div animate={hovered ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.55, ease: "easeInOut" }}>
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.label}</h3>
        <p className="text-sm mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{category.courseCount}</span>
          <span className="text-gray-400 dark:text-gray-500"> courses available</span>
        </p>
      </div>

      {/* Related tags */}
      {category.relatedTags.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-2">
          {category.relatedTags.map(tag => (
            <span key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold
                border border-gray-200 dark:border-white/[0.10]
                text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-white/[0.04]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="relative z-10 h-px bg-gray-100 dark:bg-white/[0.06]" />

      {/* Bottom */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl
          bg-gray-50/80 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
          <div className="flex -space-x-2">
            {avatars.map((av, i) => (
              <span key={i}
                className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-[#0b0f1a] ${av.bg}`}>
                {av.initials}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {fmt(category.totalEnrollments)} students
          </span>
        </div>
        <Link to={`/categories/${category.id}`} onClick={e => e.stopPropagation()}>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500
              transition-colors flex items-center justify-center flex-shrink-0
              shadow-[0_4px_14px_rgba(59,130,246,0.38)]">
            <ArrowRight className="w-4 h-4 text-white" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[22px] p-6 flex flex-col gap-4
          bg-white/70 dark:bg-[#020618] border border-white/80 dark:border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl animate-pulse bg-gray-100 dark:bg-white/[0.06]" />
          <div className="space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
          </div>
          <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-10 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

function FilterSidebar({
  search, setSearch, sortBy, setSortBy, onClear, hasFilters,
}: {
  search: string; setSearch: (v: string) => void;
  sortBy: string; setSortBy: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  const panelClass = "rounded-2xl p-5 bg-white/70 dark:bg-[#020618] backdrop-blur-xl border border-white/80 dark:border-white/[0.08] shadow-[0_2px_20px_rgba(0,0,0,0.05)]";
  const labelClass = "text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3";
  const btn = (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
        : "bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-5">
      <div className={panelClass}>
        <p className={labelClass}>Search</p>
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm
              bg-gray-50/80 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className={panelClass}>
        <p className={`${labelClass} flex items-center gap-1.5`}><SlidersHorizontal className="w-3 h-3" /> Sort by</p>
        <div className="flex flex-col gap-2">
          {[
            { value: "courses",    label: "Most Courses"  },
            { value: "students",   label: "Most Students" },
            { value: "az",         label: "A → Z"         },
          ].map(opt => (
            <button key={opt.value} onClick={() => setSortBy(opt.value)} className={btn(sortBy === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onClick={onClear}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400
              bg-red-50/80 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors">
            <X className="w-4 h-4" /> Clear all filters
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AllCategories() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("courses");

  const { data, isLoading } = useQuery<PublicCoursesResponse>({
    queryKey: ["courses-public-all"],
    queryFn:  () => CoursesService.findAllPublic() as Promise<PublicCoursesResponse>,
    staleTime: 1000 * 60 * 10,
  });

  const allCategories = deriveCategories(data?.items ?? []);
  const hasFilters = search.trim() !== "" || sortBy !== "courses";

  const filtered = useMemo(() => {
    let r = [...allCategories];
    if (search.trim()) r = r.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
    switch (sortBy) {
      case "courses":  r.sort((a, b) => b.courseCount - a.courseCount); break;
      case "students": r.sort((a, b) => b.totalEnrollments - a.totalEnrollments); break;
      case "az":       r.sort((a, b) => a.label.localeCompare(b.label)); break;
    }
    return r;
  }, [allCategories, search, sortBy]);

  const clearAll = () => { setSearch(""); setSortBy("courses"); };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-50/60 dark:bg-[#020618]">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
          radial-gradient(circle 600px at 0% 10%, rgba(59,130,246,0.08), transparent 60%),
          radial-gradient(circle 500px at 100% 0%, rgba(96,165,250,0.07), transparent 55%)
        `,
        backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
      }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-[1380px] mx-auto px-6 pt-40 pb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Browse by field</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
            All <span className="text-blue-600 dark:text-blue-400">Categories</span>
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
            {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "category" : "categories"} found`}
          </p>
        </div>

        {/* Layout */}
        <div className="max-w-[1380px] mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar
            search={search} setSearch={setSearch}
            sortBy={sortBy} setSortBy={setSortBy}
            onClear={clearAll} hasFilters={hasFilters}
          />

          <div className="flex-1 w-full">
            {isLoading ? (
              <GridSkeleton />
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                      <Search className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No categories found</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Try adjusting your search</p>
                    <button onClick={clearAll}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}