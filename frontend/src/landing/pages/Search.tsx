import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search as SearchIcon,
  X,
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  Clock,
} from "lucide-react";

const MOCK_RESULTS = [
  { id: 1, type: "course", title: "Advanced React Patterns", subtitle: "by Jane Doe · 4.9 ★ · 2.3k students", tag: "Hot" },
  { id: 2, type: "course", title: "TypeScript Mastery", subtitle: "by John Smith · 4.7 ★ · 1.1k students", tag: null },
  { id: 3, type: "instructor", title: "Jane Doe", subtitle: "Senior Frontend Engineer · 12 courses", tag: null },
  { id: 4, type: "program", title: "Full-Stack Bootcamp", subtitle: "16 weeks · Beginner to Pro", tag: "New" },
  { id: 5, type: "course", title: "Node.js & REST APIs", subtitle: "by Alex Kim · 4.8 ★ · 890 students", tag: null },
  { id: 6, type: "instructor", title: "Alex Kim", subtitle: "Backend Architect · 8 courses", tag: null },
];

const RECENT_SEARCHES = ["React hooks", "UI design", "Node.js REST", "TypeScript"];

const TYPE_ICON: Record<string, React.ReactNode> = {
  course: <BookOpen size={15} />,
  instructor: <Users size={15} />,
  program: <Layers size={15} />,
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  const filtered = query.trim()
    ? MOCK_RESULTS.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSearchParams(e.target.value ? { q: e.target.value } : {});
  };

  const clearQuery = () => {
    setQuery("");
    setSearchParams({});
    inputRef.current?.focus();
  };

  return (
    <div
      className="relative top-0 min-h-screen pt-30 overflow-hidden transition-colors duration-300 bg-none"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      <div className="relative z-10 px-5 py-12 max-w-[720px] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[2rem] font-bold tracking-tight mb-1 text-gray-900 dark:text-slate-100">
            What are you looking for?
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400">
            Search across courses, instructors, and programs
          </p>
        </div>

        {/* Search Input */}
        <div
          className={[
            "flex items-center gap-3 border rounded-full px-5 py-3 mb-8 transition-all duration-300",
            "bg-white/72 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1.5px_0_rgba(255,255,255,0.9)_inset]",
            "backdrop-blur-[28px]",
            "dark:bg-white/[0.07] dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.55),0_1.5px_0_rgba(255,255,255,0.05)_inset]",
            focused
              ? "border-blue-500 shadow-[0_0_0_3px_rgba(26,110,247,0.12),0_8px_32px_rgba(0,0,0,0.08)] dark:border-blue-400 dark:shadow-[0_0_0_3px_rgba(77,155,255,0.13),0_8px_32px_rgba(0,0,0,0.55)]"
              : "",
          ].join(" ")}
        >
          <SearchIcon size={18} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search courses, instructors…"
            className="flex-1 bg-transparent outline-none text-[16px] font-medium
                       text-gray-900 dark:text-slate-100
                       placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {query && (
            <button
              onClick={clearQuery}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200
                         bg-slate-100/75 border-white/80 text-slate-500
                         dark:bg-white/[0.06] dark:border-white/10 dark:text-slate-400
                         hover:bg-red-50 hover:border-red-300 hover:text-red-400
                         dark:hover:bg-red-500/10 dark:hover:border-red-500/30 dark:hover:text-red-400"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {!query.trim() && (
          <div
            className="border rounded-[22px] p-5 mb-6 transition-colors duration-300
                       bg-white/72 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                       backdrop-blur-[28px]
                       dark:bg-white/[0.04] dark:border-white/10"
          >
            <div className="flex items-center gap-2 mb-3 text-[13px] font-semibold uppercase text-slate-400 dark:text-slate-500">
              <Clock size={13} /> Recent searches
            </div>
            <div className="flex flex-wrap gap-2">
              {RECENT_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); setSearchParams({ q: s }); }}
                  className="px-4 py-1.5 rounded-full text-[13.5px] font-medium border transition-all duration-200
                             bg-slate-100/75 border-white/80 text-slate-500
                             dark:bg-white/[0.06] dark:border-white/10 dark:text-slate-400
                             hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500
                             dark:hover:bg-blue-500/13 dark:hover:border-blue-400 dark:hover:text-blue-400"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query.trim() && (
          <div
            className="border rounded-[22px] overflow-hidden transition-colors duration-300
                       bg-white/72 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                       backdrop-blur-[28px]
                       dark:bg-white/[0.04] dark:border-white/10"
          >
            {filtered.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-2">
                <SearchIcon size={32} className="text-slate-400 dark:text-slate-500 opacity-25" />
                <p className="text-[15px] text-slate-500 dark:text-slate-400">
                  No results for{" "}
                  <span className="font-semibold text-gray-800 dark:text-slate-200">"{query}"</span>
                </p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500">Try different keywords</p>
              </div>
            ) : (
              <>
                {/* Result count header */}
                <div
                  className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wider border-b
                             text-slate-400 dark:text-slate-500
                             border-white/80 dark:border-white/10"
                >
                  {filtered.length} result{filtered.length !== 1 && "s"} for "{query}"
                </div>

                <ul>
                  {filtered.map((item) => (
                    <li
                      key={item.id}
                      className="border-b last:border-b-0 border-white/80 dark:border-white/10"
                    >
                      <Link
                        to={`/${item.type}s/${item.id}`}
                        className="flex items-center gap-4 px-5 py-4 no-underline group transition-colors duration-150
                                   hover:bg-blue-500/[0.07] dark:hover:bg-blue-400/[0.08]"
                      >
                        {/* Icon pill */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-200
                                     bg-slate-100/75 border-white/80 text-blue-500
                                     dark:bg-white/[0.06] dark:border-white/10 dark:text-blue-400
                                     group-hover:scale-[1.08] group-hover:shadow-[0_3px_10px_rgba(26,110,247,0.18)]"
                        >
                          {TYPE_ICON[item.type]}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold truncate text-gray-900 dark:text-slate-100">
                              {item.title}
                            </span>
                            {item.tag && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white tracking-wider flex-shrink-0">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] truncate mt-0.5 text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </p>
                        </div>

                        {/* Type badge + arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="hidden sm:block text-[11px] font-medium capitalize px-2 py-0.5 rounded-full border
                                       bg-slate-100/75 border-white/80 text-slate-500
                                       dark:bg-white/[0.06] dark:border-white/10 dark:text-slate-400"
                          >
                            {item.type}
                          </span>
                          <ArrowRight
                            size={15}
                            className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Browse cards */}
        {!query.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <BookOpen size={20} />, label: "Browse Courses", path: "/courses", desc: "Explore all courses" },
              { icon: <Users size={20} />, label: "Instructors", path: "/instructors", desc: "Meet our teachers" },
              { icon: <Layers size={20} />, label: "Categories", path: "/categories", desc: "Discover different categories" },
            ].map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="border rounded-[22px] p-5 no-underline flex flex-col gap-2 group transition-all duration-300
                           bg-white/72 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1.5px_0_rgba(255,255,255,0.9)_inset]
                           backdrop-blur-[28px]
                           dark:bg-white/[0.04] dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.55),0_1.5px_0_rgba(255,255,255,0.05)_inset]
                           hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(26,110,247,0.1)]"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200
                             bg-slate-100/75 border-white/80 text-blue-500
                             dark:bg-white/[0.06] dark:border-white/10 dark:text-blue-400
                             group-hover:scale-[1.1]"
                >
                  {cat.icon}
                </div>
                <div>
                  <div className="text-[14.5px] font-semibold text-gray-900 dark:text-slate-100">{cat.label}</div>
                  <div className="text-[12.5px] text-slate-500 dark:text-slate-400">{cat.desc}</div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-blue-500 dark:text-blue-400 mt-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;