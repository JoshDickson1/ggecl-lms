import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, Tag } from "lucide-react";
import { instructors } from "@/data/Instructors";
import { InstructorCard } from "@/landing/_components/InstructorCard";
import { PageHeroBg } from "@/landing/pages/SingleCategory";

const ALL_CATEGORIES = Array.from(
  new Set(instructors.flatMap((i) => i.categoryIds))
).sort();

const SORT_OPTIONS = [
  { value: "students", label: "Most Students" },
  { value: "rating",   label: "Top Rated" },
  { value: "reviews",  label: "Most Reviews" },
  { value: "courses",  label: "Most Courses" },
  { value: "az",       label: "A → Z" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function FilterSidebar({
  search, setSearch,
  activeCategory, setActiveCategory,
  sortBy, setSortBy,
  onClear, hasFilters,
}: {
  search: string; setSearch: (v: string) => void;
  activeCategory: string | null; setActiveCategory: (v: string | null) => void;
  sortBy: string; setSortBy: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  const panel = "rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]";
  const label = "text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3";

  const btn = (active: boolean) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left capitalize transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-blue-600"
    }`;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-5">

      {/* Search */}
      <div className={panel}>
        <p className={label}>Search</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instructors..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className={panel}>
        <p className={`${label} flex items-center gap-1.5`}>
          <Tag className="w-3 h-3" /> Category
        </p>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => setActiveCategory(null)} className={btn(activeCategory === null)}>
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0
              ${activeCategory === null ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-blue-950/40 text-blue-500"}`}>↗</span>
            All
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={btn(activeCategory === cat)}>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0
                ${activeCategory === cat ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-blue-950/40 text-blue-500"}`}>↗</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className={panel}>
        <p className={`${label} flex items-center gap-1.5`}>
          <SlidersHorizontal className="w-3 h-3" /> Sort by
        </p>
        <div className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setSortBy(opt.value)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
                sortBy === opt.value
                  ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-blue-600"
              }`}>
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
              bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" /> Clear all filters
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AllInstructors() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("students");

  const hasFilters = search.trim() !== "" || activeCategory !== null || sortBy !== "students";

  const filtered = useMemo(() => {
    let r = [...instructors];
    if (search.trim()) r = r.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.title.toLowerCase().includes(search.toLowerCase())
    );
    if (activeCategory) r = r.filter((i) => i.categoryIds.includes(activeCategory));
    switch (sortBy) {
      case "students": r.sort((a, b) => b.students - a.students); break;
      case "rating":   r.sort((a, b) => b.rating - a.rating); break;
      case "reviews":  r.sort((a, b) => b.reviews - a.reviews); break;
      case "courses":  r.sort((a, b) => b.courses - a.courses); break;
      case "az":       r.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return r;
  }, [search, activeCategory, sortBy]);

  const clearAll = () => { setSearch(""); setActiveCategory(null); setSortBy("students"); };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">

      {/* Hero */}
      <div className="relative overflow-hidden pt-16 md:pt-30 bg-white dark:bg-[#0a0c1c]">
        <PageHeroBg />
        <div className="relative max-w-[1280px] mx-auto px-6 pt-14 pb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60
            bg-blue-50 dark:bg-blue-950/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              Learn from the best
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            All <span className="text-blue-600 dark:text-blue-400">Instructors</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-lg">
            {filtered.length} world-class instructor{filtered.length !== 1 ? "s" : ""} ready to teach you something extraordinary.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-6 py-10 pb-24 flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar
          search={search} setSearch={setSearch}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          sortBy={sortBy} setSortBy={setSortBy}
          onClear={clearAll} hasFilters={hasFilters}
        />

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((inst, i) => (
                    <InstructorCard key={inst.id} instructor={inst} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No instructors found</h3>
                <p className="text-sm text-gray-400 mb-5">Try adjusting your search or filters</p>
                <button onClick={clearAll}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}