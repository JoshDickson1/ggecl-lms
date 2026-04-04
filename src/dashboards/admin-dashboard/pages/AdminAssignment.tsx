// src/pages/admin/AdminAssignment.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, Eye, FileText, Edit3, Trash2,
  BookOpen, Shield, Users, CheckCircle2,
  Clock,
} from "lucide-react";
import {
  MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS,
//   type AssignmentStatus,
} from "@/data/academicData";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

export default function AdminAssignment() {
  const [search, setSearch]     = useState("");
  const [creatorFilter, setCF]  = useState<"all" | "instructor" | "admin">("all");
  const [courseFilter, setCoF]  = useState("all");

  const allCourses = Array.from(new Set(MOCK_ASSIGNMENTS.map(a => a.courseName)));

  const filtered = MOCK_ASSIGNMENTS.filter(a => {
    const ms = !search.trim() || a.title.toLowerCase().includes(search.toLowerCase()) || a.courseName.toLowerCase().includes(search.toLowerCase());
    const mc = creatorFilter === "all" || a.createdBy === creatorFilter;
    const mk = courseFilter === "all" || a.courseName === courseFilter;
    return ms && mc && mk;
  });

  const totalSubs    = MOCK_SUBMISSIONS.length;
  const gradedSubs   = MOCK_SUBMISSIONS.filter(s => s.status === "graded").length;
  const pendingSubs  = MOCK_SUBMISSIONS.filter(s => s.status === "submitted").length;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Assignments <span className="text-blue-600 dark:text-blue-400">Admin</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">All assignments across all courses · Full admin control</p>
          </div>
          <Link to="/admin/assignments/create">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> New Assignment
            </motion.div>
          </Link>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FileText,     label: "Total",         value: MOCK_ASSIGNMENTS.length, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"     },
            { icon: Users,        label: "Submissions",   value: totalSubs,              color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40" },
            { icon: Clock,        label: "Needs Grading", value: pendingSubs,            color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"   },
            { icon: CheckCircle2, label: "Graded",        value: gradedSubs,             color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40"},
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Filters */}
      <Fade delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all" />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
              {(["all","instructor","admin"] as const).map(f => (
                <button key={f} onClick={() => setCF(f)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    creatorFilter === f ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}>{f}</button>
              ))}
            </div>
            <select value={courseFilter} onChange={e => setCoF(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
              <option value="all">All Courses</option>
              {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Fade>

      {/* Table */}
      <Fade delay={0.14}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              All Assignments <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {["Title","Course","Created By","Due","Submissions","Status",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const subs = MOCK_SUBMISSIONS.filter(s => s.assignmentId === a.id);
                  const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                  const isPast = daysLeft < 0;

                  return (
                    <motion.tr key={a.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white max-w-[200px] truncate">{a.title}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{a.courseName}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {a.createdBy === "admin"
                            ? <Shield className="w-3 h-3 text-blue-500" />
                            : <BookOpen className="w-3 h-3 text-emerald-500" />
                          }
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{a.creatorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs font-semibold", isPast ? "text-red-500" : daysLeft <= 2 ? "text-amber-500" : "text-gray-500")}>
                          {isPast ? `${Math.abs(daysLeft)}d ago` : `in ${daysLeft}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{subs.length}</span>
                          <div className="w-12 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                            <div style={{ width: `${subs.length ? (subs.filter(s=>s.status==="graded").length/subs.length)*100 : 0}%` }}
                              className="h-full rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border capitalize",
                          isPast ? "bg-gray-50 dark:bg-white/[0.03] text-gray-500 border-gray-200 dark:border-white/[0.08]"
                                 : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"
                        )}>
                          {isPast ? "Closed" : "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/admin/assignments/${a.id}/submissions`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                            <Eye className="w-3 h-3" /> View
                          </Link>
                          <button className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Fade>
    </div>
  );
}