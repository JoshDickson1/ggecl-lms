// src/dashboards/commons/PreviewStudent.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Mail, Calendar, BookOpen,
  CheckCircle2, Award, TrendingUp, Play, Star, ClipboardList,
  BarChart3, Flame, Clock,
  Users, Target, Loader2, Phone, Hash, Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService, { type FullStudentProfile } from "@/services/user.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/20",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/15 dark:text-amber-400 dark:border-amber-800/30",
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PreviewStudent() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "submissions" | "quizzes">("about");

  const { data: apiUser, isLoading, isError } = useQuery<FullStudentProfile>({
    queryKey: ["student-profile", id],
    queryFn: () => UserService.findOneStudent(id!),
    enabled: !!id,
  });

  const profile   = apiUser;
  const userInfo  = apiUser?.user;

  const joinedDate = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  const studentInitials = initials(userInfo?.name ?? "S");

  const student = {
    name:           userInfo?.name ?? "Student",
    avatar:         studentInitials,
    avatarBg:       AVATAR_BG_LIST[0],
    title:          "Student",
    bio:            profile?.bio ?? userInfo?.studentProfile?.bio ?? "No bio provided.",
    location:       userInfo?.location ?? "-",
    email:          userInfo?.email ?? "",
    joined:         joinedDate,
    status:         (userInfo?.status === "ACTIVE" ? "Active" : userInfo?.status === "BANNED" ? "Suspended" : "Active") as "Active" | "Inactive" | "Suspended",
    matricNumber:   profile?.matricNumber ?? userInfo?.studentProfile?.matricNumber ?? null,
    phoneNumber:    profile?.phoneNumber ?? userInfo?.studentProfile?.phoneNumber ?? null,
    enrollmentDate: profile?.enrollmentDate ?? userInfo?.studentProfile?.enrollmentDate ?? null,
    learningGoals:  (profile?.learningGoals ?? userInfo?.studentProfile?.learningGoals ?? []).map(g => ({ label: g })),
    // streak / xp
    streak:         profile?.learningStreak?.currentStreak ?? 0,
    longestStreak:  profile?.learningStreak?.longestStreak ?? 0,
    totalActiveDays: profile?.learningStreak?.totalActiveDays ?? 0,
    xpTotal:        profile?.xp?.totalXp ?? 0,
    xpLevel:        profile?.xp?.currentLevel ?? 0,
    xpToNext:       profile?.xp?.xpToNextLevel ?? 0,
    // courses
    enrolled:       profile?.enrollments?.length ?? 0,
    enrolledCourses: (profile?.enrollments ?? []).map(e => {
      const prog = profile?.courseProgress?.find(p => p.courseId === e.course.id);
      return {
        id:             e.course.id,
        title:          e.course.title,
        thumbnailImage: e.course.img ?? null,
        thumbnail:      e.course.img ? "" : "from-blue-500 to-indigo-600",
        level:          e.course.level,
        price:          e.course.price,
        progress:       prog?.percentComplete ?? 0,
        isCompleted:    prog?.isCompleted ?? false,
        totalLessons:   prog?.totalLessons ?? 0,
        completedLessons: prog?.completedLessons ?? 0,
        enrolledAt:     e.enrolledAt,
      };
    }),
    // certificates
    certificates:   profile?.certificates ?? [],
    // submissions / grades
    submissions: (profile?.submissions ?? []).map(s => ({
      id:         s.id,
      title:      s.assignment.title,
      courseName: s.assignment.course.title,
      maxScore:   s.assignment.maxScore,
      dueDate:    s.assignment.dueDate,
      isLate:     s.isLate,
      submittedAt: s.submittedAt,
      score:      s.grade?.score ?? null,
      resolvedGrade: s.grade?.resolvedGrade ?? null,
      feedback:   s.grade?.feedback ?? null,
      gradedAt:   s.grade?.gradedAt ?? null,
    })),
    // quiz attempts
    quizAttempts: (profile?.quizAttempts ?? []).map(a => ({
      id:             a.id,
      quizTitle:      a.quiz.title,
      sectionTitle:   a.quiz.section.title,
      courseTitle:    a.quiz.section.course.title,
      score:          a.score,
      totalQuestions: a.totalQuestions,
      resolvedGrade:  a.resolvedGrade,
      passed:         a.passed,
      passMark:       a.quiz.passMark,
      submittedAt:    a.submittedAt,
    })),
    // reviews given
    reviews: (profile?.reviews ?? []).map(r => ({
      id:        r.id,
      rating:    r.rating,
      comment:   r.comment,
      createdAt: r.createdAt,
      courseTitle: r.course.title,
      courseImg:   r.course.img,
    })),
  };

  const completedCount = student.enrolledCourses.filter(c => c.isCompleted).length;

  const TABS = [
    { id: "about",       label: "About" },
    { id: "courses",     label: `Courses (${student.enrolled})` },
    { id: "submissions", label: `Submissions (${student.submissions.length})` },
    { id: "quizzes",     label: `Quizzes (${student.quizAttempts.length})` },
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
                  {userInfo?.image
                    ? <img src={userInfo.image} alt={student.name} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${student.avatarBg}`}>{student.avatar}</div>
                  }
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-[3px] border-white dark:border-[#0f1623] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${STATUS_STYLES[student.status]}`}>{student.status}</span>
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
              {student.matricNumber && <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-500" />{student.matricNumber}</span>}
              {student.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-500" />{student.phoneNumber}</span>}
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── Stats ── */}
      <Fade delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen,     value: student.enrolled,      label: "Enrolled",     color: "from-blue-500 to-blue-600"    },
            { icon: CheckCircle2, value: completedCount,         label: "Completed",    color: "from-emerald-500 to-teal-600" },
            { icon: Award,        value: student.certificates.length, label: "Certificates", color: "from-amber-400 to-orange-500" },
            { icon: Zap,          value: `Lv ${student.xpLevel}`, label: `${student.xpTotal} XP`, color: "from-violet-500 to-purple-600" },
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
              {student.learningGoals.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-blue-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Learning Goals</h2></div>
                  <div className="space-y-2">
                    {student.learningGoals.map(goal => (
                      <div key={goal.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-gray-50/60 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06]">
                        <Target className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{goal.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {student.reviews.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-amber-400" /><h2 className="font-black text-base text-gray-900 dark:text-white">Reviews Given</h2></div>
                  <div className="space-y-3">
                    {student.reviews.map(r => (
                      <div key={r.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{r.courseTitle}</p>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{r.comment}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            <div className="space-y-4">
              {student.streak > 0 && (
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Learning Streak</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{student.streak} <span className="text-sm font-semibold text-gray-400">days</span></p>
                      <p className="text-xs text-gray-400">Current streak</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                      <p className="font-black text-gray-900 dark:text-white">{student.longestStreak}</p>
                      <p className="text-gray-400">Longest streak</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                      <p className="font-black text-gray-900 dark:text-white">{student.totalActiveDays}</p>
                      <p className="text-gray-400">Active days</p>
                    </div>
                  </div>
                </Card>
              )}
              {student.xpTotal > 0 && (
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">XP & Level</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">Level {student.xpLevel}</p>
                      <p className="text-xs text-gray-400">{student.xpTotal} XP total</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Progress to next level</span>
                      <span>{student.xpToNext} XP to go</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                        style={{ width: `${Math.max(5, 100 - (student.xpToNext / Math.max(student.xpToNext + 100, 1)) * 100)}%` }} />
                    </div>
                  </div>
                </Card>
              )}
              {student.certificates.length > 0 && (
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Certificates</p>
                  <div className="space-y-2">
                    {student.certificates.map(cert => (
                      <a key={cert.id} href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                          <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{cert.course.title}</p>
                          <p className="text-[10px] text-gray-400">{new Date(cert.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </a>
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
                        <div className={`w-full sm:w-24 h-14 rounded-xl flex-shrink-0 overflow-hidden ${!c.thumbnailImage ? `bg-gradient-to-br ${c.thumbnail}` : ""} flex items-center justify-center`}>
                          {c.thumbnailImage
                            ? <img src={c.thumbnailImage} alt={c.title} className="w-full h-full object-cover" />
                            : <Play className="w-5 h-5 text-white" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{c.level}</span>
                            <span>•</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">${c.price}</span>
                            <span>•</span>
                            <span>{c.completedLessons}/{c.totalLessons} lessons</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <ProgressBar pct={c.progress} />
                            <span className={`text-[11px] font-bold flex-shrink-0 ${c.isCompleted ? "text-emerald-500" : "text-blue-500"}`}>{c.progress}%</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {c.isCompleted
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

        {/* SUBMISSIONS */}
        {activeTab === "submissions" && (
          <motion.div key="submissions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {student.submissions.length === 0
              ? <Card className="p-10 text-center text-gray-400 text-sm">No assignment submissions yet.</Card>
              : student.submissions.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{s.title}</p>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{s.courseName}</p>
                          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Submitted {new Date(s.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            {s.isLate && <span className="text-amber-500 font-semibold">Late</span>}
                            <span>Max: {s.maxScore} pts</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {s.score !== null ? (
                            <>
                              <p className="text-lg font-black text-gray-900 dark:text-white">{s.resolvedGrade}<span className="text-xs text-gray-400">/{s.maxScore}</span></p>
                              <p className="text-[10px] text-emerald-500 font-semibold">Graded</p>
                            </>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">Pending</span>
                          )}
                        </div>
                      </div>
                      {s.feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">"{s.feedback}"</p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))
            }
          </motion.div>
        )}

        {/* QUIZZES */}
        {activeTab === "quizzes" && (
          <motion.div key="quizzes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {student.quizAttempts.length === 0
              ? <Card className="p-10 text-center text-gray-400 text-sm">No quiz attempts yet.</Card>
              : student.quizAttempts.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.quizTitle}</p>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{a.sectionTitle} · {a.courseTitle}</p>
                          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            <span>{a.score}/{a.totalQuestions} correct</span>
                            <span>Pass mark: {a.passMark}%</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(a.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-lg font-black text-gray-900 dark:text-white">{a.resolvedGrade}%</p>
                          <span className={`text-[11px] font-bold ${a.passed ? "text-emerald-500" : "text-rose-500"}`}>{a.passed ? "Passed" : "Failed"}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
