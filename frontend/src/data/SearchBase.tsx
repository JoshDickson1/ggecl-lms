// src/dashboards/shared/SearchBase.tsx
// Reusable search UI — used by StudentSearch, InstructorSearch, AdminSearch.
// Receives role-specific result sets and route base as props.

import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, BookOpen, Users, Layers, ArrowRight,
  Clock, GraduationCap, Shield,
} from "lucide-react";
import type { SearchResult } from "@/data/searchUtils";
import { getResultPath } from "@/data/searchUtils";

export type SearchRole = "student" | "instructor" | "admin" | "landing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ReactNode> = {
  course:     <BookOpen className="w-4 h-4" />,
  instructor: <Users className="w-4 h-4" />,
  category:   <Layers className="w-4 h-4" />,
  student:    <GraduationCap className="w-4 h-4" />,
  admin:      <Shield className="w-4 h-4" />,
};

const TYPE_COLOR: Record<string, string> = {
  course:     "text-blue-500 dark:text-blue-400",
  instructor: "text-violet-500 dark:text-violet-400",
  category:   "text-emerald-500 dark:text-emerald-400",
  student:    "text-amber-500 dark:text-amber-400",
  admin:      "text-rose-500 dark:text-rose-400",
};

const TYPE_LABEL: Record<string, string> = {
  course: "Course", instructor: "Instructor", category: "Category",
  student: "Student", admin: "Admin",
};

const RECENT_KEY = (role: string) => `ggecl_search_recent_${role}`;

function getRecent(role: string): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY(role)) ?? "[]"); } catch { return []; }
}
function saveRecent(role: string, q: string) {
  const prev = getRecent(role).filter(s => s !== q);
  localStorage.setItem(RECENT_KEY(role), JSON.stringify([q, ...prev].slice(0, 6)));
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ result, role, onClick }: { result: SearchResult; role: SearchRole; onClick: () => void }) {
  const path = getResultPath(result, role);
  return (
    <Link to={path} onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-gray-100 dark:border-white/[0.06]
        hover:bg-blue-50/60 dark:hover:bg-white/[0.03] transition-colors group">
      {/* Icon / Avatar / Thumbnail */}
      <div className="flex-shrink-0">
        {result.avatar ? (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black ${result.avatarBg}`}>
            {result.avatar}
          </div>
        ) : result.thumbnail ? (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${result.thumbnail} flex items-center justify-center`}>
            <span className={TYPE_COLOR[result.type]}>{TYPE_ICON[result.type]}</span>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
            <span className={TYPE_COLOR[result.type]}>{TYPE_ICON[result.type]}</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {result.title}
          </span>
          {result.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white tracking-wider flex-shrink-0">
              {result.badge}
            </span>
          )}
          {result.tag && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 flex-shrink-0">
              {result.tag}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.subtitle}</p>
      </div>

      {/* Type + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:block text-[11px] font-medium capitalize px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03]">
          {TYPE_LABEL[result.type]}
        </span>
        <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </Link>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count, icon }: { label: string; count: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="ml-auto text-xs text-gray-400">{count} result{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface SearchBaseProps {
  role: SearchRole;
  accentColor?: string;        // tailwind gradient e.g. "from-blue-600 to-indigo-700"
  placeholder?: string;
  getCourseResults: (q: string) => SearchResult[];
  getCategoryResults: (q: string) => SearchResult[];
  getInstructorResults: (q: string) => SearchResult[];
  getStudentResults?: (q: string) => SearchResult[];
  getAdminResults?: (q: string) => SearchResult[];
  browseLinks?: { icon: React.ReactNode; label: string; desc: string; path: string }[];
}

export default function SearchBase({
  role,
//   accentColor = "from-blue-600 to-indigo-700",
  placeholder = "Search courses, instructors, categories…",
  getCourseResults,
  getCategoryResults,
  getInstructorResults,
  getStudentResults,
  getAdminResults,
  browseLinks,
}: SearchBaseProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => getRecent(role));
  const inputRef = useRef<HTMLInputElement>(null);
//   const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Compute grouped results
  const courses     = query.trim() ? getCourseResults(query) : [];
  const categories  = query.trim() ? getCategoryResults(query) : [];
  const instructors = query.trim() ? getInstructorResults(query) : [];
  const studentRes  = query.trim() && getStudentResults ? getStudentResults(query) : [];
  const adminRes    = query.trim() && getAdminResults   ? getAdminResults(query)   : [];
  const totalCount  = courses.length + categories.length + instructors.length + studentRes.length + adminRes.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSearchParams(e.target.value ? { q: e.target.value } : {});
  };

  const clearQuery = () => {
    setQuery("");
    setSearchParams({});
    inputRef.current?.focus();
  };

  const pickRecent = (s: string) => {
    setQuery(s);
    setSearchParams({ q: s });
  };

  const handleResultClick = () => {
    if (query.trim()) {
      saveRecent(role, query.trim());
      setRecent(getRecent(role));
    }
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY(role));
    setRecent([]);
  };

  return (
    <div className="max-w-[760px] mx-auto px-5 py-10 space-y-6 pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
          What are you looking for?
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Search across courses, categories, instructors{getStudentResults ? ", and students" : ""}
        </p>
      </motion.div>

      {/* Search input */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className={`flex items-center gap-3 border rounded-2xl px-5 py-3.5 transition-all duration-300
          bg-white dark:bg-[#0f1623] shadow-[0_4px_24px_rgba(0,0,0,0.07)]
          ${focused
            ? "border-blue-400 dark:border-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.12),0_4px_24px_rgba(0,0,0,0.07)]"
            : "border-gray-200 dark:border-white/[0.08]"
          }`}>
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-base font-medium text-gray-900 dark:text-white placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {query && (
            <button onClick={clearQuery}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-white/[0.08] text-gray-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Recent searches */}
      {!query.trim() && recent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white dark:bg-[#0f1623] rounded-2xl border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <Clock className="w-3.5 h-3.5" />Recent Searches
            </div>
            <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-rose-500 transition-colors">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map(s => (
              <button key={s} onClick={() => pickRecent(s)}
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03] hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {query.trim() && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-[#0f1623] rounded-2xl border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

            {totalCount === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                  <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="font-bold text-gray-700 dark:text-white">No results for "{query}"</p>
                <p className="text-sm text-gray-400">Try different keywords</p>
              </div>
            ) : (
              <>
                {/* Total count */}
                <div className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
                  {totalCount} result{totalCount !== 1 ? "s" : ""} for "{query}"
                </div>

                {/* Courses */}
                {courses.length > 0 && (
                  <>
                    <SectionHeader label="Courses" count={courses.length} icon={<BookOpen className="w-3.5 h-3.5" />} />
                    {courses.map(r => <ResultCard key={r.id} result={r} role={role} onClick={handleResultClick} />)}
                  </>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <>
                    <SectionHeader label="Categories" count={categories.length} icon={<Layers className="w-3.5 h-3.5" />} />
                    {categories.map(r => <ResultCard key={r.id} result={r} role={role} onClick={handleResultClick} />)}
                  </>
                )}

                {/* Instructors */}
                {instructors.length > 0 && (
                  <>
                    <SectionHeader label="Instructors" count={instructors.length} icon={<Users className="w-3.5 h-3.5" />} />
                    {instructors.map(r => <ResultCard key={r.id} result={r} role={role} onClick={handleResultClick} />)}
                  </>
                )}

                {/* Students (admin/instructor only) */}
                {studentRes.length > 0 && (
                  <>
                    <SectionHeader label="Students" count={studentRes.length} icon={<GraduationCap className="w-3.5 h-3.5" />} />
                    {studentRes.map(r => <ResultCard key={r.id} result={r} role={role} onClick={handleResultClick} />)}
                  </>
                )}

                {/* Admins (admin only) */}
                {adminRes.length > 0 && (
                  <>
                    <SectionHeader label="Admins" count={adminRes.length} icon={<Shield className="w-3.5 h-3.5" />} />
                    {adminRes.map(r => <ResultCard key={r.id} result={r} role={role} onClick={handleResultClick} />)}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browse cards (shown when no query) */}
      {!query.trim() && browseLinks && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {browseLinks.map(cat => (
            <Link key={cat.path} to={cat.path}
              className="bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-blue-500 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{cat.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{cat.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500 mt-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}