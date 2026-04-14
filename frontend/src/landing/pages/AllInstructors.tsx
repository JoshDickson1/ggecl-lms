// src/landing/pages/AllInstructors.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { InstructorCard } from "@/landing/_components/InstructorCard";
import { type Instructor } from "@/data/Instructors";
import { PageHeroBg } from "@/landing/pages/SingleCategory";
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

// ─── Map API → Instructor shape ───────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500",  "bg-amber-500",  "bg-cyan-500",
  "bg-pink-500",  "bg-teal-500",
];

function mapToInstructor(u: PublicInstructor, i: number): Instructor {
  const p        = u.instructorProfile;
  const parts    = u.name.trim().split(" ");
  const initials = parts.map(x => x[0]).join("").slice(0, 2).toUpperCase();

  return {
    id:          u.id,
    name:        u.name,
    avatar:      initials,
    avatarBg:    AVATAR_COLORS[i % AVATAR_COLORS.length],
    photo:       u.image ?? undefined,
    title:       p?.specialization ?? p?.teachingCategories?.[0] ?? "Instructor",
    bio:         p?.bio ?? p?.description ?? "",
    bio2:        undefined,
    experience:  "",
    experience2: undefined,
    expertise:   p?.areasOfExpertise ?? [],
    categoryIds: p?.teachingCategories ?? [],
    rating:      0,
    reviews:     0,
    students:    0,
    courses:     0,
    badges:      [],
    socials:     p?.website ? [{ platform: "website", url: p.website }] : [],
    courseSnippets:  [],
    ratingBreakdown: [
      { star: 5, pct: 0 }, { star: 4, pct: 0 }, { star: 3, pct: 0 },
      { star: 2, pct: 0 }, { star: 1, pct: 0 },
    ],
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[24px] overflow-hidden bg-white dark:bg-[#0f1420]
          border border-gray-100 dark:border-white/[0.07]">
          <div className="h-52 animate-pulse bg-gray-100 dark:bg-white/[0.06]" />
          <div className="px-4 py-4 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-8 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "az",   label: "A → Z"      },
  { value: "za",   label: "Z → A"      },
  { value: "new",  label: "Newest"     },
];

function FilterSidebar({
  search, setSearch, sortBy, setSortBy, onClear, hasFilters,
}: {
  search: string; setSearch: (v: string) => void;
  sortBy: string; setSortBy: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  const panel = "rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)]";
  const label = "text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3";

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-5">
      <div className={panel}>
        <p className={label}>Search</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search instructors..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm
              bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className={panel}>
        <p className={`${label} flex items-center gap-1.5`}><SlidersHorizontal className="w-3 h-3" /> Sort by</p>
        <div className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map(opt => (
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
              bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors">
            <X className="w-4 h-4" /> Clear filters
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AllInstructors() {
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState("az");

  const { data, isLoading } = useQuery<PublicInstructor[]>({
    queryKey: ["instructors-public-all"],
    queryFn:  () => UserService.findAllPublic() as Promise<PublicInstructor[]>,
    staleTime: 1000 * 60 * 10,
  });

  const allInstructors = (data ?? []).map(mapToInstructor);
  const hasFilters = search.trim() !== "" || sortBy !== "az";

  const filtered = useMemo(() => {
    let r = [...allInstructors];
    if (search.trim()) r = r.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.title.toLowerCase().includes(search.toLowerCase())
    );
    switch (sortBy) {
      case "az":  r.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "za":  r.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "new": break; // API already returns newest first
    }
    return r;
  }, [allInstructors, search, sortBy]);

  const clearAll = () => { setSearch(""); setSortBy("az"); };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c17]">

      {/* Hero */}
      <div className="relative overflow-hidden pt-16 md:pt-30 bg-white dark:bg-[#0a0c1c]">
        <PageHeroBg />
        <div className="relative max-w-[1280px] mx-auto px-6 pt-14 pb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Learn from the best</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            All <span className="text-blue-600 dark:text-blue-400">Instructors</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-lg">
            {isLoading ? "Loading…" : `${filtered.length} instructor${filtered.length !== 1 ? "s" : ""} ready to teach you something extraordinary.`}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-6 py-10 pb-24 flex flex-col lg:flex-row gap-8 items-start">
        <FilterSidebar
          search={search} setSearch={setSearch}
          sortBy={sortBy} setSortBy={setSortBy}
          onClear={clearAll} hasFilters={hasFilters}
        />

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <GridSkeleton />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((inst, i) => <InstructorCard key={inst.id} instructor={inst} index={i} />)}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No instructors found</h3>
                  <p className="text-sm text-gray-400 mb-5">Try adjusting your search</p>
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