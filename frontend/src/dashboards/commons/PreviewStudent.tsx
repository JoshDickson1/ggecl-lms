// src/dashboards/commons/PreviewStudent.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Mail, Calendar, BookOpen,
  CheckCircle2, Award, TrendingUp, Play, Star, ClipboardList,
  BarChart3, Flame, ShoppingBag, Clock,
  Users, Zap, Target, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";
import { GRADE_META, type LetterGrade } from "@/data/academicData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  phone?: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/20",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/15 dark:text-amber-400 dark:border-amber-800/30",
};

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/15 dark:text-blue-400 dark:border-blue-900/20",
  Graded:    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/20",
  Late:      "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/15 dark:text-amber-400 dark:border-amber-800/30",
  Missing:   "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/15 dark:text-rose-400 dark:border-rose-900/20",
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_BG_LIST = [
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-rose-500 to-pink-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-indigo-500";
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`} />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
      ))}
    </div>
  );
}

const ACTIVITY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  lesson:      { icon: Play,          color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/40"    },
  quiz:        { icon: Target,        color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-100 dark:bg-violet-900/40"},
  assignment:  { icon: ClipboardList, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/40"  },
  review:      { icon: Star,          color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-100 dark:bg-rose-900/40"    },
  certificate: { icon: Award,         color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  enroll:      { icon: BookOpen,      color: "text-cyan-600 dark:text-cyan-400",    bg: "bg-cyan-100 dark:bg-cyan-900/40"    },
  message:     { icon: Zap,           color: "text-gray-600 dark:text-gray-400",    bg: "bg-gray-100 dark:bg-gray-700/30"    },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PreviewStudent() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "grades" | "activity">("about");

  const { data: apiUser, isLoading, isError } = useQuery<ApiUser>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await UserService.findOne(id!) as ApiUser;
      return res;
    },
    enabled: !!id,
  });

  const joinedDate = apiUser?.createdAt
    ? new Date(apiUser.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  const studentInitials = initials(apiUser?.name ?? "S");

  const student = {
    name:           apiUser?.name ?? "Student",
    avatar:         studentInitials,
    avatarBg:       AVATAR_BG_LIST[0],
    title:          "Student",
    bio:            apiUser?.bio ?? "No bio provided.",
    location:       "-",
    email:          apiUser?.email ?? "",
    website:        undefined as string | undefined,
    joined:         joinedDate,
    status:         "Active" as const,
    badges:         [] as string[],
    streak:         0,
    enrolled:       0,
    completed:      0,
    certificates:   0,
    totalSpent:     0,
    avgRatingGiven: 0,
    reviewsGiven:   0,
    learningGoals:  [] as { label: string; done: boolean }[],
    enrolledCourses: [] as {
      id: string; title: string; instructor: string; progress: number;
      thumbnail: string; grade?: string;
    }[],
    grades:      [] as { courseName: string; percentage: number; letterGrade: string; gradedAt: string }[],
    assignments: [] as { id: string; title: string; courseName: string; status: string; score?: number; maxScore?: number }[],
    recentActivity: [] as { type: string; action: string; target: string; time: string }[],
  };

  const TABS = [
    { id: "about",    label: "About" },
    { id: "courses",  label: `Courses (${student.enrolled})` },
    { id: "grades",   label: "Grades & Assignments" },
    { id: "activity", label: "Activity" },
  ] as const;

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center py-20 text-gray-400 gap-2">
      <p className="text-sm font-semibold">Failed to load student profile</p>
      <Link to="/admin/students" className="text-xs text-blue-500 hover:underline">← Back to Students</Link>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pb-12">

      {/* Back */}
      <Fade>
        <Link to="/admin/students" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </Fade>

      {/* ── Hero ── */}
      <Fade delay={0.02}>
        <Card>
          <div className="h-32 rounded-t-2xl bg-gradient-to-br mb-20 from-blue-600 via-blue-500 to-indigo-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle 400px at 20% 50%, rgba(103,232,249,0.2), transparent 70%)" }} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#0f1623] shadow-xl">
                  {apiUser?.image
                    ? <img src={apiUser.image} alt={student.name} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${student.avatarBg}`}>{student.avatar}</div>
                  }
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-[3px] border-white dark:border-[#0f1623] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${STATUS_STYLES[student.status]}`}>{student.status}</span>
                  {student.badges.map(b => (
                    <span key={b} className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">{b}</span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{student.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{student.title}</p>
              </div>
              {student.streak > 0 && (
                <div className="sm:self-end flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{student.streak}</span>
                  <span className="text-xs text-gray-400">day streak</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              {student.location !== "-" && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" />{student.location}</span>}
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" />{student.email}</span>
              {student.joined && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-500" />Joined {student.joined}</span>}
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── Stats ── */}
      <Fade delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen,     value: student.enrolled,              label: "Enrolled",      color: "from-blue-500 to-blue-600"    },
            { icon: CheckCircle2, value: student.completed,             label: "Completed",     color: "from-emerald-500 to-teal-600" },
            { icon: Award,        value: student.certificates,          label: "Certificates",  color: "from-amber-400 to-orange-500" },
            { icon: ShoppingBag,  value: `$${student.totalSpent.toFixed(0)}`, label: "Spent",  color: "from-violet-500 to-purple-600"},
          ].map(({ icon: Ic, value, label, color }) => (
            <Card key={label} className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Ic className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* ── Tabs ── */}
      <Fade delay={0.08}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Fade>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">

        {/* ABOUT */}
        {activeTab === "about" && (
          <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-blue-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Bio</h2></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{student.bio}</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-blue-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Learning Goals</h2></div>
                {student.learningGoals.length === 0
                  ? <p className="text-sm text-gray-400 italic">No goals set.</p>
                  : <div className="space-y-2">
                      {student.learningGoals.map(goal => (
                        <div key={goal.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${goal.done ? "bg-emerald-50/60 dark:bg-emerald-950/15 border-emerald-100/60 dark:border-emerald-900/20" : "bg-gray-50/60 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06]"}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${goal.done ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"}`} />
                          <span className={`text-xs font-medium ${goal.done ? "text-emerald-700 dark:text-emerald-400 line-through opacity-60" : "text-gray-700 dark:text-gray-300"}`}>{goal.label}</span>
                        </div>
                      ))}
                    </div>
                }
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Reviews Given</p>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{student.avgRatingGiven.toFixed(1)}</span>
                  <div><Stars rating={student.avgRatingGiven} /><p className="text-xs text-gray-400 mt-1">{student.reviewsGiven} courses reviewed</p></div>
                </div>
              </Card>
              {student.badges.length > 0 && (
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Achievements</p>
                  <div className="space-y-2">
                    {student.badges.map(b => (
                      <div key={b} className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/50 dark:border-blue-900/20">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-800 dark:text-white">{b}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* COURSES */}
        {activeTab === "courses" && (
          <motion.div key="courses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {student.enrolledCourses.length === 0
              ? <Card className="p-10 text-center text-gray-400 text-sm">No courses enrolled yet.</Card>
              : student.enrolledCourses.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className={`w-full sm:w-24 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br ${c.thumbnail} flex items-center justify-center`}>
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">by {c.instructor}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <ProgressBar pct={c.progress} />
                            <span className={`text-[11px] font-bold flex-shrink-0 ${c.progress === 100 ? "text-emerald-500" : "text-blue-500"}`}>{c.progress}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {c.grade && (
                            <span className={`px-2.5 py-1 rounded-xl text-sm font-black border ${GRADE_META[c.grade as LetterGrade]?.color ?? ""} ${GRADE_META[c.grade as LetterGrade]?.bg ?? ""} ${GRADE_META[c.grade as LetterGrade]?.border ?? ""}`}>
                              {c.grade}
                            </span>
                          )}
                          {c.progress === 100
                            ? <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"><CheckCircle2 className="w-3.5 h-3.5" />Done</span>
                            : <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">In Progress</span>
                          }
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
            }
          </motion.div>
        )}

        {/* GRADES & ASSIGNMENTS */}
        {activeTab === "grades" && (
          <motion.div key="grades" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-blue-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Grades</h2></div>
              {student.grades.length === 0
                ? <p className="text-sm text-gray-400 italic">No grades yet.</p>
                : <div className="space-y-3">
                    {student.grades.map((g, i) => {
                      const meta = GRADE_META[g.letterGrade as LetterGrade];
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{g.courseName}</p>
                            <p className="text-[10px] text-gray-400">{new Date(g.gradedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-500">{g.percentage}%</span>
                            <span className={`px-2.5 py-1 rounded-xl text-sm font-black border ${meta?.color ?? ""} ${meta?.bg ?? ""} ${meta?.border ?? ""}`}>{g.letterGrade}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-blue-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Assignments</h2></div>
              {student.assignments.length === 0
                ? <p className="text-sm text-gray-400 italic">No assignments yet.</p>
                : <div className="space-y-3">
                    {student.assignments.map(a => (
                      <div key={a.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white leading-snug">{a.title}</p>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0 ${ASSIGNMENT_STATUS_STYLES[a.status] ?? ""}`}>{a.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{a.courseName}</p>
                        {a.score !== undefined && (
                          <p className="text-[10px] text-emerald-500 font-bold mt-1">Score: {a.score}/{a.maxScore}</p>
                        )}
                      </div>
                    ))}
                  </div>
              }
            </Card>
          </motion.div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5"><BarChart3 className="w-4 h-4 text-blue-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Recent Activity</h2></div>
              {student.recentActivity.length === 0
                ? <p className="text-sm text-gray-400 italic text-center py-6">No recent activity.</p>
                : <div className="space-y-3">
                    {student.recentActivity.map((a, i) => {
                      const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.lesson;
                      const Icon = meta.icon;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-white">{a.action}</p>
                            <p className="text-[10px] text-gray-400 truncate">{a.target}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />{a.time}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
              }
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
