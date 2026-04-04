// src/landing/pages/Search.tsx
// Landing page search — courses, categories, instructors from real seed data.
// Replaces the mock MOCK_RESULTS array with live data from searchUtils.

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon, X, BookOpen, Users, Layers,
  ArrowRight, Clock,
} from "lucide-react";
import { searchCourses, searchCategories, searchInstructors, getResultPath, type SearchResult } from "@/data/searchUtils";

const RECENT_KEY = "ggecl_search_recent_landing";
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function saveRecent(q: string) {
  const prev = getRecent().filter(s => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 6)));
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  course:     <BookOpen size={15} />,
  instructor: <Users size={15} />,
  category:   <Layers size={15} />,
};
const TYPE_LABEL: Record<string, string> = {
  course: "Course", instructor: "Instructor", category: "Category",
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]   = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent]   = useState<string[]>(getRecent);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Live results from real data
  const courseResults     = query.trim() ? searchCourses(query).slice(0, 5)     : [];
  const categoryResults   = query.trim() ? searchCategories(query).slice(0, 3)  : [];
  const instructorResults = query.trim() ? searchInstructors(query).slice(0, 3) : [];
  const allResults: SearchResult[] = [...courseResults, ...categoryResults, ...instructorResults];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSearchParams(e.target.value ? { q: e.target.value } : {});
  };

  const clearQuery = () => { setQuery(""); setSearchParams({}); inputRef.current?.focus(); };

  const pickRecent = (s: string) => { setQuery(s); setSearchParams({ q: s }); };

  const handleResultClick = () => {
    if (query.trim()) { saveRecent(query.trim()); setRecent(getRecent()); }
  };

  const clearRecent = () => { localStorage.removeItem(RECENT_KEY); setRecent([]); };

  return (
    <div className="relative min-h-screen pt-28 overflow-hidden bg-none">
      <div className="relative z-10 px-5 py-12 max-w-[760px] mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[2rem] font-black tracking-tight mb-1 text-gray-900 dark:text-white">
            What are you looking for?
          </h1>
          <p className="text-[15px] text-gray-500 dark:text-gray-400">
            Search across courses, instructors, and categories
          </p>
        </div>

        {/* Search Input */}
        <div className={[
          "flex items-center gap-3 border rounded-2xl px-5 py-3.5 mb-6 transition-all duration-300",
          "bg-white/80 backdrop-blur-xl border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
          "dark:bg-white/[0.07] dark:border-white/10",
          focused ? "border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.12),0_8px_32px_rgba(0,0,0,0.08)] dark:border-blue-400" : "",
        ].join(" ")}>
          <SearchIcon size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search courses, instructors…"
            className="flex-1 bg-transparent outline-none text-[16px] font-medium text-gray-900 dark:text-white placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {query && (
            <button onClick={clearQuery}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-white/[0.1] text-gray-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Recent searches */}
        {!query.trim() && recent.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="border rounded-[22px] p-5 mb-5 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.07)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold uppercase text-gray-400">
                <Clock size={13} /> Recent searches
              </div>
              <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-rose-500 transition-colors">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map(s => (
                <button key={s} onClick={() => pickRecent(s)}
                  className="px-4 py-1.5 rounded-full text-[13.5px] font-medium border border-white/80 dark:border-white/10 bg-gray-100/75 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all">
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
              className="border rounded-[22px] overflow-hidden bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.07)] mb-5">
              {allResults.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-2">
                  <SearchIcon size={32} className="text-gray-400 opacity-25" />
                  <p className="text-[15px] text-gray-500 dark:text-gray-400">
                    No results for <span className="font-semibold text-gray-800 dark:text-white">"{query}"</span>
                  </p>
                  <p className="text-[13px] text-gray-400">Try different keywords</p>
                </div>
              ) : (
                <>
                  <div className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider border-b border-white/80 dark:border-white/10 text-gray-400">
                    {allResults.length} result{allResults.length !== 1 && "s"} for "{query}"
                  </div>
                  <ul>
                    {allResults.map(item => (
                      <li key={`${item.type}-${item.id}`} className="border-b last:border-b-0 border-white/80 dark:border-white/10">
                        <Link to={getResultPath(item, "landing")} onClick={handleResultClick}
                          className="flex items-center gap-4 px-5 py-4 no-underline group transition-colors duration-150 hover:bg-blue-500/[0.07] dark:hover:bg-blue-400/[0.08]">
                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border bg-gray-100/75 dark:bg-white/[0.06] border-white/80 dark:border-white/10 text-blue-500 dark:text-blue-400 group-hover:scale-[1.08] transition-transform">
                            {item.avatar ? (
                              <span className="text-xs font-black">{item.avatar}</span>
                            ) : (
                              TYPE_ICON[item.type]
                            )}
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-semibold truncate text-gray-900 dark:text-white">{item.title}</span>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white tracking-wider flex-shrink-0">{item.badge}</span>
                              )}
                            </div>
                            <p className="text-[13px] truncate mt-0.5 text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                          </div>
                          {/* Badge + arrow */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="hidden sm:block text-[11px] font-medium capitalize px-2 py-0.5 rounded-full border border-white/80 dark:border-white/10 bg-gray-100/75 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400">
                              {TYPE_LABEL[item.type]}
                            </span>
                            <ArrowRight size={15} className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browse cards */}
        {!query.trim() && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <BookOpen size={20} />, label: "Browse Courses",  path: "/courses",      desc: "Explore all courses"              },
              { icon: <Users    size={20} />, label: "Instructors",     path: "/instructors",  desc: "Meet our teachers"                },
              { icon: <Layers   size={20} />, label: "Categories",      path: "/categories",   desc: "Discover different subjects"      },
            ].map(cat => (
              <Link key={cat.path} to={cat.path}
                className="border rounded-[22px] p-5 no-underline flex flex-col gap-2 group transition-all duration-300
                  bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border-white/80 dark:border-white/10
                  shadow-[0_8px_32px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(59,130,246,0.1)]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/80 dark:border-white/10 bg-gray-100/75 dark:bg-white/[0.06] text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div>
                  <div className="text-[14.5px] font-bold text-gray-900 dark:text-white">{cat.label}</div>
                  <div className="text-[12.5px] text-gray-500 dark:text-gray-400">{cat.desc}</div>
                </div>
                <ArrowRight size={14} className="text-blue-500 dark:text-blue-400 mt-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}