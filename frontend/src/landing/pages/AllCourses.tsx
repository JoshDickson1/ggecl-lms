// src/landing/pages/AllCourses.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, Star,
  Clock, BookOpen, ShoppingCart, Users, Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Code } from "lucide-react";
import CoursesService from "@/services/course.service";

// ─── API Types ────────────────────────────────────────────────────────────────

interface PublicCourse {
  id: string;
  title: string;
  description: string;
  img: string | null;
  price: number;
  level: string;
  tags: string[];
  badge: string | null;
  totalDuration: number;
  instructorId: string;
  _count: { enrollments: number };
  averageRating: number;
  reviewCount: number;
  totalLectures: number;
}

interface PublicCoursesResponse {
  items: PublicCourse[];
  nextCursor: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

function fmtDuration(s: number) {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const GRADIENTS = [
  "from-blue-500 to-blue-700", "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700", "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600", "from-cyan-500 to-blue-600",
  "from-indigo-500 to-blue-700", "from-fuchsia-500 to-purple-700",
];

const BADGE_STYLES: Record<string, string> = {
  Bestseller: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60",
  "Hot & New": "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60",
  Hot:        "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60",
  New:        "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60",
  Popular:    "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60",
};

function CourseBadge({ badge }: { badge: string | null }) {
  if (!badge) return null;
  const style = BADGE_STYLES[badge] ?? "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200";
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${style}`}>{badge}</span>;
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: PublicCourse; index: number }) {
  const [hovered, setHovered] = useState(false);
  const gradient  = GRADIENTS[index % GRADIENTS.length];
  const duration  = fmtDuration(course.totalDuration);
  const origPrice = Math.round(course.price * 1.4 * 100) / 100;
  const discount  = Math.round(((origPrice - course.price) / origPrice) * 100);

  return (
    <div className="flex flex-col">
      <motion.div
        layout
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="relative flex flex-col rounded-[22px] overflow-hidden cursor-pointer
          bg-white/70 dark:bg-[#020618] backdrop-blur-xl
          border border-white/80 dark:border-white/[0.08] transition-shadow duration-300"
        style={{
          boxShadow: hovered
            ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 8px 40px rgba(59,130,246,0.16)"
            : "0 2px 20px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 rounded-[22px]"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 65%)" }}
        />

        {/* Thumbnail */}
        <div className={`relative w-full h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {course.img ? (
            <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <motion.div
              animate={hovered ? { scale: 1.12, rotate: 6 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Code className="w-7 h-7 text-white drop-shadow-lg" />
            </motion.div>
          )}
          {course.badge && (
            <div className="absolute top-3 left-3"><CourseBadge badge={course.badge} /></div>
          )}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-[11px] font-bold">
            -{discount}%
          </div>
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm text-white text-[11px] font-semibold capitalize">
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col gap-3 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-white">
              {course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}
            </span>
            {course.reviewCount > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">({fmt(course.reviewCount)})</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            {duration && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
            )}
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.totalLectures}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmt(course._count.enrollments)}</span>
          </div>
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 2).map(tag => (
                <span key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                    border border-gray-200 dark:border-white/[0.10]
                    text-gray-500 dark:text-gray-400 bg-gray-50/80 dark:bg-white/[0.03]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Price + Add */}
      <div className="flex items-center justify-between px-1 pt-3 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-gray-900 dark:text-white">${course.price.toFixed(2)}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500 line-through">${origPrice.toFixed(2)}</span>
        </div>
        <Link to={`/courses/${course.id}`}>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-colors duration-200">
            <ShoppingCart className="w-3.5 h-3.5" /> Add
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="rounded-[22px] overflow-hidden bg-white dark:bg-[#020618] border border-white/80 dark:border-white/[0.08]">
            <div className="h-40 animate-pulse bg-gray-100 dark:bg-white/[0.06]" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-4/5 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
              <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
              <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
            </div>
          </div>
          <div className="flex justify-between px-1">
            <div className="h-5 w-16 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-8 w-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

function FilterSidebar({
  search, setSearch, activeLevel, setActiveLevel,
  activeBadge, setActiveBadge, sortBy, setSortBy, onClear, hasFilters,
  levels, badges,
}: {
  search: string; setSearch: (v: string) => void;
  activeLevel: string | null; setActiveLevel: (v: string | null) => void;
  activeBadge: string | null; setActiveBadge: (v: string | null) => void;
  sortBy: string; setSortBy: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
  levels: string[]; badges: string[];
}) {
  const panelClass = "rounded-2xl p-5 bg-white/70 dark:bg-[#020618] backdrop-blur-xl border border-white/80 dark:border-white/[0.08] shadow-[0_2px_20px_rgba(0,0,0,0.05)]";
  const labelClass = "text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3";
  const btn = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
        : "bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-5">
      {/* Search */}
      <div className={panelClass}>
        <p className={labelClass}>Search</p>
        <div className="relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm
              bg-gray-50/80 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Level */}
      {levels.length > 0 && (
        <div className={panelClass}>
          <p className={`${labelClass} flex items-center gap-1.5`}><Tag className="w-3 h-3" /> Level</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setActiveLevel(null)} className={btn(activeLevel === null)}>All levels</button>
            {levels.map(lvl => (
              <button key={lvl} onClick={() => setActiveLevel(activeLevel === lvl ? null : lvl)} className={btn(activeLevel === lvl)}>
                {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badge */}
      {badges.length > 0 && (
        <div className={panelClass}>
          <p className={`${labelClass} flex items-center gap-1.5`}><Tag className="w-3 h-3" /> Badge</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setActiveBadge(null)} className={btn(activeBadge === null)}>All</button>
            {badges.map(b => (
              <button key={b} onClick={() => setActiveBadge(activeBadge === b ? null : b)} className={btn(activeBadge === b)}>{b}</button>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div className={panelClass}>
        <p className={`${labelClass} flex items-center gap-1.5`}><SlidersHorizontal className="w-3 h-3" /> Sort by</p>
        <div className="flex flex-col gap-2">
          {[
            { value: "rating",     label: "Top Rated"          },
            { value: "popular",    label: "Most Popular"        },
            { value: "price-asc",  label: "Price: Low → High"  },
            { value: "price-desc", label: "Price: High → Low"  },
            { value: "az",         label: "A → Z"              },
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

export default function AllCourses() {
  const [search,      setSearch]      = useState("");
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [sortBy,      setSortBy]      = useState("rating");

  const { data, isLoading } = useQuery<PublicCoursesResponse>({
    queryKey: ["courses-public-all"],
    queryFn:  () => CoursesService.findAllPublic() as Promise<PublicCoursesResponse>,
    staleTime: 1000 * 60 * 10,
  });

  const allCourses = data?.items ?? [];

  // Derive filter options from real data
  const levels = Array.from(new Set(allCourses.map(c => c.level)));
  const badges = Array.from(new Set(allCourses.map(c => c.badge).filter(Boolean))) as string[];

  const hasFilters = search.trim() !== "" || activeLevel !== null || activeBadge !== null || sortBy !== "rating";

  const filtered = useMemo(() => {
    let r = [...allCourses];
    if (search.trim()) r = r.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (activeLevel) r = r.filter(c => c.level === activeLevel);
    if (activeBadge) r = r.filter(c => c.badge === activeBadge);
    switch (sortBy) {
      case "rating":     r.sort((a, b) => b.averageRating - a.averageRating); break;
      case "popular":    r.sort((a, b) => b._count.enrollments - a._count.enrollments); break;
      case "price-asc":  r.sort((a, b) => a.price - b.price); break;
      case "price-desc": r.sort((a, b) => b.price - a.price); break;
      case "az":         r.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return r;
  }, [allCourses, search, activeLevel, activeBadge, sortBy]);

  const clearAll = () => { setSearch(""); setActiveLevel(null); setActiveBadge(null); setSortBy("rating"); };

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

      {/* Header */}
      <div className="max-w-[1380px] mx-auto px-6 pt-40 pb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
          border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">All courses</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
          Browse <span className="text-blue-600 dark:text-blue-400">Courses</span>
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
          {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "course" : "courses"} found`}
        </p>
      </div>

      {/* Layout */}
      <div className="max-w-[1380px] mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar
          search={search} setSearch={setSearch}
          activeLevel={activeLevel} setActiveLevel={setActiveLevel}
          activeBadge={activeBadge} setActiveBadge={setActiveBadge}
          sortBy={sortBy} setSortBy={setSortBy}
          onClear={clearAll} hasFilters={hasFilters}
          levels={levels} badges={badges}
        />

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <GridSkeleton />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-2">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No courses found</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Try adjusting your search or filters</p>
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
  );
}