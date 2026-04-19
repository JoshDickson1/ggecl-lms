// src/pages/instructor/InstructorProfile.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star, Users, BookOpen, Award, Globe, Mail,
  Calendar, TrendingUp, CheckCircle2,
  Edit3, BarChart3, ExternalLink, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";
import InstructorDashboardService from "@/services/instructor-dashboard.service";

// ─── API Types ────────────────────────────────────────────────────────────────

interface MeResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Backend note ─────────────────────────────────────────────────────────────

function BackendPlaceholder({ label }: { label?: string }) {
  return (
    <span className="text-xs text-amber-600 dark:text-amber-400 italic">
      {label ?? "Backend should provide data for this"}
    </span>
  );
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

// ─── Section card ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ icon: Icon, value, label, sub }: {
  icon: React.ElementType; value: string; label: string; sub?: string;
}) {
  return (
    <div className="flex flex-col items-center py-5 px-3 rounded-2xl
      bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20
      hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[9px] text-blue-500 font-bold mt-0.5">{sub}</p>}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${
          i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"
        }`} />
      ))}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHead({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
        flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-base font-black text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorProfile() {
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "reviews">("about");

  const { data: me, isLoading: meLoading } = useQuery<MeResponse>({
    queryKey: ["user-mine"],
    queryFn:  () => UserService.getMe() as Promise<MeResponse>,
  });

  const { data: summary, isLoading: statsLoading } = useQuery({
    queryKey: ["instructor-dashboard-summary"],
    queryFn:  () => InstructorDashboardService.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentReviews = [] } = useQuery({
    queryKey: ["instructor-recent-reviews"],
    queryFn:  () => InstructorDashboardService.getRecentReviews(10),
    staleTime: 1000 * 60 * 5,
  });

  const TABS = [
    { id: "about",   label: "About"   },
    { id: "courses", label: "Courses" },
    { id: "reviews", label: "Reviews" },
  ] as const;

  if (meLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  const profile  = me?.instructorProfile;
  const name     = me?.name ?? "Instructor";
  const bio      = profile?.bio ?? profile?.description ?? "";
  const expertise = profile?.areasOfExpertise ?? [];
  const categories = profile?.teachingCategories ?? [];
  const website  = profile?.website;
  const title    = profile?.specialization ?? categories[0] ?? "Instructor";

  const totalStudents = summary?.totalStudents?.totalUniqueStudents ?? 0;
  const avgRating     = summary?.avgReviews?.overallAverage ?? 0;
  const totalReviews  = summary?.avgReviews?.totalReviews ?? 0;
  const totalCourses  = summary?.studentsPerCourse?.length ?? 0;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <Fade>
        <Card>
          <div className="h-32 rounded-t-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(circle 400px at 80% 50%, rgba(96,165,250,0.3), transparent 70%)" }} />
            <Link to="/instructor/settings"
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold
                hover:bg-white/30 transition-all">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </Link>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[20px] overflow-hidden
                  ring-4 ring-white dark:ring-[#0f1623]
                  shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
                  {me?.image ? (
                    <img src={me.image} alt={name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black text-white">
                      {initials(name)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400
                  border-[3px] border-white dark:border-[#0f1623]
                  shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              {/* Name + title */}
              <div className="flex-1 mt-0 md:mt-20 sm:pb-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
              </div>

              {/* Rating pill */}
              {!statsLoading && avgRating > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                  bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-black text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({fmt(totalReviews)})</span>
                </div>
              )}
            </div>

            {/* Quick meta row */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                {me?.email ?? "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {me?.createdAt ? `Joined ${fmtDate(me.createdAt)}` : "—"}
              </span>
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  {website.replace(/^https?:\/\//, "")}
                </a>
              )}
              <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 italic text-[11px]">
                Location — Backend should provide data for this
              </span>
            </div>

            {/* Socials */}
            {website && (
              <div className="flex flex-wrap gap-2">
                <a href={website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-600 dark:text-gray-400
                    hover:border-blue-300 dark:hover:border-blue-700
                    hover:text-blue-600 dark:hover:text-blue-400
                    transition-all group">
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            )}
          </div>
        </Card>
      </Fade>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile icon={Users}     value={statsLoading ? "…" : fmt(totalStudents)} label="Total Students" />
          <StatTile icon={BookOpen}  value={statsLoading ? "…" : String(totalCourses)} label="Published Courses" />
          <StatTile icon={Star}      value={statsLoading ? "…" : avgRating > 0 ? avgRating.toFixed(1) : "—"} label="Avg. Rating" sub={avgRating > 0 ? "★ Score" : undefined} />
          <StatTile icon={BarChart3} value={statsLoading ? "…" : fmt(totalReviews)} label="Total Reviews" />
        </div>
      </Fade>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Fade delay={0.1}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Fade>

      {/* ABOUT */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="flex flex-col gap-5">

            {/* Bio */}
            <Fade delay={0.12}>
              <Card className="p-7">
                <SectionHead icon={Users} title={`About ${name.split(" ")[0]}`} />
                {bio ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{bio}</p>
                ) : (
                  <BackendPlaceholder label="No bio provided yet. Add one in Settings → Instructor Details." />
                )}
              </Card>
            </Fade>

            {/* Expertise */}
            <Fade delay={0.16}>
              <Card className="p-7">
                <SectionHead icon={CheckCircle2} title="Areas of Expertise" />
                {expertise.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {expertise.map((item, i) => (
                      <motion.div key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 + i * 0.04 }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                          bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/20
                          hover:bg-blue-50 dark:hover:bg-blue-950/25 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <BackendPlaceholder label="No expertise listed yet. Add them in Settings → Instructor Details." />
                )}
              </Card>
            </Fade>

            {/* Experience */}
            <Fade delay={0.2}>
              <Card className="p-7">
                <SectionHead icon={TrendingUp} title="Professional Experience" />
                {profile?.description ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{profile.description}</p>
                ) : (
                  <BackendPlaceholder label="No experience added yet. Add it in Settings → Instructor Details." />
                )}
              </Card>
            </Fade>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">

            {/* Rating breakdown */}
            <Fade delay={0.14}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
                  Rating Breakdown
                </p>
                {statsLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
                ) : avgRating > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <span className="text-5xl font-black text-gray-900 dark:text-white leading-none">
                        {avgRating.toFixed(1)}
                      </span>
                      <div>
                        <Stars rating={avgRating} />
                        <p className="text-[11px] text-gray-400 mt-1">{totalReviews.toLocaleString()} reviews</p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-500 dark:text-amber-400 italic">
                      Backend should provide star breakdown percentages
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">No ratings yet</p>
                )}
              </Card>
            </Fade>

            {/* Recognition */}
            <Fade delay={0.18}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
                  Recognition
                </p>
                <BackendPlaceholder label="Backend should provide badges/recognition data" />
              </Card>
            </Fade>

            {/* Teaching Categories */}
            {categories.length > 0 && (
              <Fade delay={0.22}>
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">
                    Teaching Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize
                        border border-gray-200 dark:border-white/[0.08]
                        text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03]">
                        {c}
                      </span>
                    ))}
                  </div>
                </Card>
              </Fade>
            )}
          </div>
        </div>
      )}

      {/* COURSES */}
      {activeTab === "courses" && (
        <Fade delay={0.06}>
          {summary?.studentsPerCourse && summary.studentsPerCourse.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {summary.studentsPerCourse.map((c, i) => (
                <Fade key={c.courseId} delay={i * 0.06}>
                  <Link to={`/instructor/courses/${c.courseId}`}>
                    <div className="rounded-[22px] overflow-hidden bg-white dark:bg-[#0f1623]
                      border border-gray-100 dark:border-white/[0.07]
                      shadow-[0_4px_24px_rgba(0,0,0,0.05)]
                      hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.4),0_8px_32px_rgba(59,130,246,0.12)]
                      transition-all duration-300 group">
                      <div className="h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
                        {c.img ? (
                          <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-12 h-12 text-white/60" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug
                          group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {c.title}
                        </h3>
                        <p className="text-xs text-gray-400">{fmt(c.studentCount)} students</p>
                      </div>
                    </div>
                  </Link>
                </Fade>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No courses published yet.</p>
            </Card>
          )}
        </Fade>
      )}

      {/* REVIEWS */}
      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Summary */}
          <Fade delay={0.06}>
            <Card className="p-5 h-fit">
              <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
                Overall Rating
              </p>
              {avgRating > 0 ? (
                <div className="text-center mb-5">
                  <p className="text-6xl font-black text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
                  <Stars rating={avgRating} />
                  <p className="text-xs text-gray-400 mt-2">{totalReviews.toLocaleString()} reviews</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">No ratings yet</p>
              )}
              <p className="text-[11px] text-amber-500 dark:text-amber-400 italic text-center">
                Backend should provide star breakdown percentages
              </p>
            </Card>
          </Fade>

          {/* Real reviews */}
          <div className="flex flex-col gap-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((r, i) => (
                <Fade key={r.id} delay={i * 0.07}>
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 bg-blue-500">
                        {r.student.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{r.student.name}</span>
                            <Stars rating={r.rating} />
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">{r.course.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  </Card>
                </Fade>
              ))
            ) : (
              <Card className="p-10 text-center">
                <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No reviews yet.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
