import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Tag, SlidersHorizontal, X } from "lucide-react";
import { categories, type Category } from "@/data/categories";
import { Link } from "react-router-dom";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}
const ALL_TAGS = Array.from(new Set(categories.flatMap((c) => c.tags)));

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ category, index }: { category: Category; index: number }) {
  const Icon = category.icon;
  const [hovered, setHovered] = useState(false);

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
        bg-white/70 dark:bg-[#020618]
        backdrop-blur-xl
        border border-white/80 dark:border-white/[0.08]
        transition-shadow duration-300"
      style={{
  boxShadow: hovered
    ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)"
    : "0 8px 30px rgba(15,23,42,0.08)",
}}
    >
      {/* Hover glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[22px] z-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 70%)",
        }}
      />

      {/* Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
        <motion.div
          animate={hovered ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>

      {/* Title + courses */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.title}</h3>
        <p className="text-sm mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{category.courses}</span>
          <span className="text-gray-400 dark:text-gray-500"> courses available</span>
        </p>
      </div>

      {/* Popularity bar */}
      <div className="relative z-10">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
          <span>Popularity</span>
          <span>{category.popularity}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${category.popularity}%` }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="relative z-10 flex flex-wrap gap-2">
        {category.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs font-semibold
              border border-gray-200 dark:border-white/[0.10]
              text-gray-600 dark:text-gray-300
              bg-gray-50/80 dark:bg-white/[0.04]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="relative z-10 h-px bg-gray-100 dark:bg-white/[0.06]" />

      {/* Bottom: students + arrow */}
      <div className="relative z-10 flex items-center gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl
            bg-gray-50/80 dark:bg-white/[0.04]
            border border-gray-100 dark:border-white/[0.07]"
        >
          <div className="flex -space-x-2">
            {category.students_avatars.map((av, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full text-[10px] font-bold text-white
                  flex items-center justify-center
                  border-2 border-white dark:border-[#0b0f1a]
                  ${av.bg}`}
              >
                {av.initials}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatStudents(category.students)} students
          </span>
        </div>

        <Link to={`/categories/${category.id}`} onClick={(e) => e.stopPropagation()}>
        <motion.a
          href={`/categories/${category.id}`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500
            transition-colors flex items-center justify-center flex-shrink-0
            shadow-[0_4px_14px_rgba(59,130,246,0.38)]"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </motion.a>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Sidebar filter panel ─────────────────────────────────────────────────────
function FilterSidebar({
  search,
  setSearch,
  activeTag,
  setActiveTag,
  sortBy,
  setSortBy,
  onClear,
  hasFilters,
}: {
  search: string;
  setSearch: (v: string) => void;
  activeTag: string | null;
  setActiveTag: (v: string | null) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-5">

      {/* Search */}
      <div
        className="rounded-2xl p-5
          bg-white/70 dark:bg-[#020618]
          backdrop-blur-xl
          border border-white/80 dark:border-white/[0.08]
          shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
      >
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
          Search
        </p>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm
              bg-gray-50/80 dark:bg-white/[0.05]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-600
              outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
              transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Tag filters */}
      <div
        className="rounded-2xl p-5
          bg-white/70 dark:bg-[#020618]
          backdrop-blur-xl
          border border-white/80 dark:border-white/[0.08]
          shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
      >
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3 flex items-center gap-1.5">
          <Tag className="w-3 h-3" /> Tags
        </p>
        <div className="flex flex-col gap-2">
          {/* All option */}
          <button
            onClick={() => setActiveTag(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200
              ${activeTag === null
                ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
                : "bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs
                ${activeTag === null ? "bg-white/20" : "bg-blue-50 dark:bg-blue-950/40 text-blue-500"}`}
            >
              ↗
            </span>
            All
          </button>

          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200
                ${activeTag === tag
                  ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
                  : "bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs
                  ${activeTag === tag ? "bg-white/20" : "bg-blue-50 dark:bg-blue-950/40 text-blue-500"}`}
              >
                ↗
              </span>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div
        className="rounded-2xl p-5
          bg-white/70 dark:bg-[#020618]
          backdrop-blur-xl
          border border-white/80 dark:border-white/[0.08]
          shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
      >
        <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3 h-3" /> Sort by
        </p>
        <div className="flex flex-col gap-2">
          {[
            { value: "popularity", label: "Most Popular" },
            { value: "courses", label: "Most Courses" },
            { value: "students", label: "Most Students" },
            { value: "az", label: "A → Z" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-200
                ${sortBy === opt.value
                  ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
                  : "bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all filters */}
      <AnimatePresence>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={onClear}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              border border-red-200 dark:border-red-900/50
              text-red-500 dark:text-red-400
              bg-red-50/80 dark:bg-red-950/20
              hover:bg-red-100 dark:hover:bg-red-950/40
              transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllCategories() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("popularity");

  const hasFilters = search.trim() !== "" || activeTag !== null || sortBy !== "popularity";

  const filtered = useMemo(() => {
    let result: Category[] = [...categories];

    // Search
    if (search.trim()) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((c) => c.tags.includes(activeTag));
    }

    // Sort
    switch (sortBy) {
      case "popularity":
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case "courses":
        result.sort((a, b) => b.courses - a.courses);
        break;
      case "students":
        result.sort((a, b) => b.students - a.students);
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [search, activeTag, sortBy]);

  const clearAll = () => {
    setSearch("");
    setActiveTag(null);
    setSortBy("popularity");
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-50/60 dark:bg-[#020618]">
  {/* subtle blue grid + glow background */}
  <div
    className="absolute inset-0 z-0 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
        radial-gradient(circle 600px at 0% 10%, rgba(59,130,246,0.08), transparent 60%),
        radial-gradient(circle 500px at 100% 0%, rgba(96,165,250,0.07), transparent 55%)
      `,
      backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
    }}
  />

  {/* page content */}
  <div className="relative z-10">
      {/* Page header */}
      <div className="max-w-[1380px] mx-auto px-6 pt-40 pb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
          border border-blue-200 dark:border-blue-900/60
          bg-blue-50 dark:bg-blue-950/30 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
            Browse by field
          </span>
        </div>
            <h2 className="text-4xl ja-heading md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
          All{" "}
          <span className="text-blue-600 dark:text-blue-400">Categories</span>
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
          {filtered.length} {filtered.length === 1 ? "category" : "categories"} found
        </p>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="max-w-[1380px] mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar
          search={search}
          setSearch={setSearch}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClear={clearAll}
          hasFilters={hasFilters}
        />

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((cat, i) => (
                    <CategoryCard key={cat.id} category={cat} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-background flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">
                  No categories found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
  );
}