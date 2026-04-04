// src/dashboards/student/pages/StudentExploreCourses.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, SlidersHorizontal, X, Star, Clock, BookOpen,
  Users, Tag, ShoppingCartIcon, CheckCircle2, Heart,
} from "lucide-react";
import { courses, type Course } from "@/data/courses";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

const ALL_LEVELS = Array.from(new Set(courses.map(c => c.level)));
const ALL_CATEGORIES = Array.from(new Set(courses.map(c => c.categoryId)));
const ALL_BADGES = ["Bestseller", "Hot & New", "New"] as const;

// IDs of courses the student is already carted in
const CARTED_IDS = new Set(["dev-001", "dev-002", "mkt-001", "biz-001", "ds-001", "design-001"]);

// ─── Badge chip ───────────────────────────────────────────────────────────────
function CourseBadge({ badge }: { badge: Course["badge"] }) {
  if (!badge) return null;
  const styles: Record<string, string> = {
    Bestseller: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60",
    "Hot & New": "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60",
    New: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60",
  };
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${styles[badge]}`}>{badge}</span>;
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: Course; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [carted, setCarted] = useState(CARTED_IDS.has(course.id));
  const [enrollAnim, setCartAnim] = useState(false);
  const Icon = course.icon;
  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  const handleCart = () => {
    if (carted) return;
    setCarted(true);
    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex flex-col"
    >
      <motion.div
        className="relative flex flex-col rounded-2xl overflow-hidden bg-white/70 dark:bg-[#0f1623] backdrop-blur-xl border border-white/80 dark:border-white/[0.08] transition-shadow duration-300"
        style={{
          boxShadow: hovered
            ? "0 0 0 1.5px rgba(59,130,246,0.4), 0 8px 36px rgba(59,130,246,0.14)"
            : "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Hover glow */}
        <motion.div className="pointer-events-none absolute inset-0 z-0 rounded-2xl" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 65%)" }} />

        {/* Thumbnail */}
        <div className={`relative w-full h-40 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center overflow-hidden flex-shrink-0`}>
          <motion.div animate={hovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }} transition={{ duration: 0.4 }}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-7 h-7 text-white drop-shadow-lg" />
          </motion.div>
          {course.badge && <div className="absolute top-3 left-3"><CourseBadge badge={course.badge} /></div>}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-[11px] font-bold">-{discount}%</div>
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm text-white text-[11px] font-semibold">{course.level}</div>
          {carted && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold">Carted</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col gap-2.5 p-5">
          {/* Instructor */}
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ${course.instructor.avatarBg}`}>
              {course.instructor.avatar}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.instructor.name}</span>
          </div>

          <Link to={`/student/courses/${course.id}`}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-blue-500 transition-colors">{course.title}</h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-white">{course.rating}</span>
            <span className="text-xs text-gray-400">({fmt(course.reviews)})</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lectures}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmt(course.students)}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-gray-200 dark:border-white/[0.10] text-gray-500 dark:text-gray-400 bg-gray-50/80 dark:bg-white/[0.03]">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Price + Cart — outside card */}
      <div className="flex items-center justify-between px-1 pt-3 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-gray-900 dark:text-white">${course.price.toFixed(2)}</span>
          <span className="text-sm text-gray-400 line-through">${course.originalPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWishlisted(p => !p)}
            className={`p-2 rounded-xl border transition-all ${wishlisted ? "border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30 text-rose-500" : "border-gray-200 dark:border-white/[0.07] text-gray-400 hover:border-rose-300 hover:text-rose-400"}`}>
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500" : ""}`} />
          </button>
          <motion.button
            whileHover={{ scale: carted ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCart}
            disabled={carted}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              carted
                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 cursor-default"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
            }`}
          >
            <AnimatePresence mode="wait">
              {enrollAnim ? (
                <motion.span key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />Carted!
                </motion.span>
              ) : carted ? (
                <motion.span key="carted" className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />Carted
                </motion.span>
              ) : (
                <motion.span key="enroll" className="flex items-center gap-1.5">
                  <ShoppingCartIcon className="w-4 h-4" />Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
function FilterSidebar({
  search, setSearch,
  activeLevel, setActiveLevel,
  activeCategory, setActiveCategory,
  activeBadge, setActiveBadge,
  sortBy, setSortBy,
  showCarted, setShowCarted,
  onClear, hasFilters,
}: {
  search: string; setSearch: (v: string) => void;
  activeLevel: string | null; setActiveLevel: (v: string | null) => void;
  activeCategory: string | null; setActiveCategory: (v: string | null) => void;
  activeBadge: string | null; setActiveBadge: (v: string | null) => void;
  sortBy: string; setSortBy: (v: string) => void;
  showCarted: boolean; setShowCarted: (v: boolean) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  const panel = "rounded-2xl p-5 bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.04)]";
  const lbl = "text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3";
  const btn = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${active
      ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
      : "bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"}`;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
      {/* Search */}
      <div className={panel}>
        <p className={lbl}>Search</p>
        <div className="relative">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
            className="w-full pl-4 pr-9 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Carted filter */}
      <div className={panel}>
        <p className={lbl}>Show</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowCarted(false)} className={btn(!showCarted)}>All courses</button>
          <button onClick={() => setShowCarted(true)} className={btn(showCarted)}>Not carted</button>
        </div>
      </div>

      {/* Level */}
      <div className={panel}>
        <p className={`${lbl} flex items-center gap-1.5`}><Tag className="w-3 h-3" />Level</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveLevel(null)} className={btn(activeLevel === null)}>All levels</button>
          {ALL_LEVELS.map(l => <button key={l} onClick={() => setActiveLevel(activeLevel === l ? null : l)} className={btn(activeLevel === l)}>{l}</button>)}
        </div>
      </div>

      {/* Category */}
      <div className={panel}>
        <p className={`${lbl} flex items-center gap-1.5`}><Tag className="w-3 h-3" />Category</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveCategory(null)} className={btn(activeCategory === null)}>All</button>
          {ALL_CATEGORIES.map(c => <button key={c} onClick={() => setActiveCategory(activeCategory === c ? null : c)} className={btn(activeCategory === c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>)}
        </div>
      </div>

      {/* Badge */}
      <div className={panel}>
        <p className={`${lbl} flex items-center gap-1.5`}><Tag className="w-3 h-3" />Badge</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveBadge(null)} className={btn(activeBadge === null)}>All</button>
          {ALL_BADGES.map(b => <button key={b} onClick={() => setActiveBadge(activeBadge === b ? null : b)} className={btn(activeBadge === b)}>{b}</button>)}
        </div>
      </div>

      {/* Sort */}
      <div className={panel}>
        <p className={`${lbl} flex items-center gap-1.5`}><SlidersHorizontal className="w-3 h-3" />Sort</p>
        <div className="flex flex-col gap-2">
          {[
            { value: "rating", label: "Top Rated" },
            { value: "popular", label: "Most Popular" },
            { value: "price-asc", label: "Price: Low → High" },
            { value: "price-desc", label: "Price: High → Low" },
            { value: "az", label: "A → Z" },
          ].map(opt => <button key={opt.value} onClick={() => setSortBy(opt.value)} className={btn(sortBy === opt.value)}>{opt.label}</button>)}
        </div>
      </div>

      <AnimatePresence>
        {hasFilters && (
          <motion.button initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onClick={onClear} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-200 dark:border-rose-900/50 text-rose-500 bg-rose-50/80 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors">
            <X className="w-4 h-4" />Clear all
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentExploreCourses() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("rating");
  const [showCarted, setShowCarted] = useState(false);

  const hasFilters = search.trim() !== "" || activeLevel !== null || activeCategory !== null || activeBadge !== null || sortBy !== "rating" || showCarted;

  const filtered = useMemo(() => {
    let list = [...courses];
    if (search.trim()) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.name.toLowerCase().includes(search.toLowerCase()));
    if (activeLevel) list = list.filter(c => c.level === activeLevel);
    if (activeCategory) list = list.filter(c => c.categoryId === activeCategory);
    if (activeBadge) list = list.filter(c => c.badge === activeBadge);
    if (showCarted) list = list.filter(c => !CARTED_IDS.has(c.id));
    switch (sortBy) {
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "popular": list.sort((a, b) => b.students - a.students); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "az": list.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return list;
  }, [search, activeLevel, activeCategory, activeBadge, sortBy, showCarted]);

  const clearAll = () => { setSearch(""); setActiveLevel(null); setActiveCategory(null); setActiveBadge(null); setSortBy("rating"); setShowCarted(false); };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50/60 dark:bg-[#080d18]">


      {/* Page header */}
      <div className="max-w-[1380px] mx-auto px-6 pt-10 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Explore</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">
          Browse <span className="text-blue-600 dark:text-blue-400">Courses</span>
        </h1>
        <p className="mt-1.5 text-gray-500 dark:text-gray-400 text-sm">
          {filtered.length} {filtered.length === 1 ? "course" : "courses"} available · {CARTED_IDS.size} carted
        </p>
      </div>

      {/* Layout */}
      <div className="max-w-[1380px] mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar
          search={search} setSearch={setSearch}
          activeLevel={activeLevel} setActiveLevel={setActiveLevel}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          activeBadge={activeBadge} setActiveBadge={setActiveBadge}
          sortBy={sortBy} setSortBy={setSortBy}
          showCarted={showCarted} setShowCarted={setShowCarted}
          onClear={clearAll} hasFilters={hasFilters}
        />

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-x-5 gap-y-2">
                <AnimatePresence mode="popLayout">
                  {filtered.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No courses found</h3>
                <p className="text-sm text-gray-400 mb-5">Try adjusting your filters</p>
                <button onClick={clearAll} className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">Clear filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}