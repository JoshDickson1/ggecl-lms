// src/dashboards/student-dashboard/pages/StudentProfile.tsx
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Star, BookOpen, Award, Globe, Mail, MapPin, Calendar,
  CheckCircle2, Edit3, Play, TrendingUp, ShoppingBag, Loader2, Camera,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import UserService from "@/services/user.service";
import StorageService from "@/services/storage.service";
import { authClient } from "@/lib/auth-client";
import ProgressService from "@/services/progress.service";
import EnrollmentService from "@/services/enrollment.service";
import ReviewService from "@/services/review.service";
import { useAuth } from "@/context/AuthProvider";

// ─── API Types ────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;
  matricNumber: string;
  enrollmentDate: string;
  learningGoals: string[];
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  role: string;
  location: string | null;
  gender: string | null;
  studentProfile: StudentProfile | null;
}

interface DashboardStats {
  totalTimeSpentThisMonth: number;
  streak: { currentStreak: number };
  completedCourses: number;
  avgCompletionPercent: number;
}

interface DashboardCourse {
  courseId: string;
  title: string;
  img?: string;
  instructor: { name: string };
  progressPercent: number;
  completed: boolean;
}

interface DashboardResponse {
  stats: DashboardStats;
  courses: DashboardCourse[];
}

interface EnrollmentCourse {
  id: string;
  title: string;
  img: string;
  price: number;
  level: string;
  instructorId: string;
}

interface Enrollment {
  id: string;
  enrolledAt: string;
  course: EnrollmentCourse;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

const THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-blue-400",
  "from-green-500 to-emerald-400",
  "from-violet-500 to-purple-400",
  "from-sky-500 to-blue-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

function gradientFor(i: number) {
  return THUMBNAIL_GRADIENTS[i % THUMBNAIL_GRADIENTS.length];
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function StatTile({ icon: Icon, value, label, sub, color = "blue" }: {
  icon: React.ElementType; value: string; label: string; sub?: string;
  color?: "blue" | "emerald" | "amber";
}) {
  const palette: Record<string, string> = {
    blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_div]:bg-blue-100 dark:[&_div]:bg-blue-900/40 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
    emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_div]:bg-emerald-100 dark:[&_div]:bg-emerald-900/40 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
    amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_div]:bg-amber-100 dark:[&_div]:bg-amber-900/40 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
  };
  return (
    <div className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${palette[color]}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[9px] font-bold mt-0.5 text-current opacity-70">{sub}</p>}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

// function Stars({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map(i => (
//         <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(rating)
//           ? "text-amber-400 fill-amber-400"
//           : "text-gray-200 dark:text-gray-700"}`} />
//       ))}
//     </div>
//   );
// }

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

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "from-emerald-500 to-emerald-400" : "from-blue-500 to-blue-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

// ─── Review tab ───────────────────────────────────────────────────────────────

function ReviewTab({ enrollments }: { enrollments: Enrollment[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Check for existing review when course is selected
  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setExistingReview(null);
    setRating(0);
    setComment("");
    
    if (courseId) {
      try {
        const review = await ReviewService.getMyReview(courseId) as any;
        if (review && review.rating && review.comment) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment);
        }
      } catch (error) {
        // No existing review or error fetching
        console.log('No existing review found');
      }
    }
  };

  const handleSubmit = async () => {
    // Validation: course, rating, and comment (min 10 chars) are required
    if (!selectedCourseId || !rating || comment.trim().length < 10) return;
    setSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        await ReviewService.update(existingReview.id, { rating, comment: comment.trim() });
      } else {
        // Create new review
        await ReviewService.create({ courseId: selectedCourseId, rating, comment: comment.trim() });
      }
      setSuccess(true);
      setRating(0);
      setComment("");
      setSelectedCourseId("");
      setExistingReview(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Context panel */}
      <div className="xl:col-span-1">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-5">Review Context</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Select Course</label>
              <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                <SelectTrigger className="h-12 rounded-2xl border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03]">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {enrollments.map(e => (
                    <SelectItem key={e.course.id} value={e.course.id}>
                      {e.course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <p className={`text-sm font-semibold ${selectedCourseId ? "text-emerald-600" : "text-gray-400"}`}>
                {selectedCourseId ? "Eligible to review" : "Select a course first"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Review form */}
      <div className="xl:col-span-2">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-5">
            {existingReview ? "Edit Your Review" : "Leave a Review"}
          </p>

          {success ? (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {existingReview ? "Review updated!" : "Review submitted!"}
              </p>
              <p className="text-sm text-gray-400">Thank you for your feedback.</p>
              <button onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-bold text-blue-500 hover:underline">
                {existingReview ? "Edit again" : "Leave another review"}
              </button>
            </div>
          ) : (
            <>
              {/* Star rating */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-3">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="w-11 h-11 rounded-2xl border border-amber-200 dark:border-amber-500/20
                        bg-amber-50 dark:bg-amber-500/10
                        hover:bg-amber-100 dark:hover:bg-amber-500/20
                        active:scale-95 hover:scale-105
                        flex items-center justify-center transition-all duration-200">
                      <Star className={`w-5 h-5 ${star <= (hovered || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 dark:text-gray-700"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Your Review</label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell others what made this course great (minimum 10 characters)..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/[0.06]
                    bg-gray-50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none resize-none
                    focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {comment.length > 0 && comment.length < 10 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Review must be at least 10 characters long ({comment.length}/10)
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedCourseId || !rating || comment.trim().length < 10}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700
                  hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed
                  text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all
                  flex items-center justify-center gap-2">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{existingReview ? "Updating…" : "Submitting…"}</>
                  : existingReview ? "Update Review" : "Submit Review"}
              </button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentProfile() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "review">("about");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["user-mine"],
    queryFn:  () => UserService.getMe() as Promise<UserResponse>,
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;
    setAvatarUploading(true);
    try {
      const publicUrl = await StorageService.upload("avatars", file);
      await UserService.update(authUser.id, { image: publicUrl });
      await authClient.updateUser({ image: publicUrl });
      queryClient.invalidateQueries({ queryKey: ["user-mine"] });
    } catch {
      // silent fail — user stays on profile
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const { data: dashboard, isLoading: dashLoading } = useQuery<DashboardResponse>({
    queryKey: ["progress-dashboard"],
    queryFn:  () => ProgressService.getDashboard() as Promise<DashboardResponse>,
  });

  const { data: enrollments, isLoading: enrollLoading } = useQuery<Enrollment[]>({
    queryKey: ["enrollments-mine"],
    queryFn:  () => EnrollmentService.getMine() as Promise<Enrollment[]>,
  });

  const isLoading = userLoading || dashLoading || enrollLoading;

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        <Sk className="h-52 rounded-[22px]" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Sk key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Sk className="h-10 w-64 rounded-2xl" />
        <Sk className="h-48 rounded-[22px]" />
      </div>
    );
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const nameParts  = (userData?.name ?? authUser?.name ?? "").split(" ");
  // const firstName  = nameParts[0] ?? "";
  const initials   = nameParts.map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const stats      = dashboard?.stats;
  const courses    = dashboard?.courses ?? [];
  const myEnrollments = enrollments ?? [];
  const joined     = userData?.createdAt ? fmtDate(userData.createdAt) : "—";
  const location   = userData?.location ?? "—";
  const email      = userData?.email ?? authUser?.email ?? "—";
  const goals      = userData?.studentProfile?.learningGoals ?? [];
  const completed  = stats?.completedCourses ?? 0;
  const totalSpent = myEnrollments.reduce((sum, e) => sum + e.course.price, 0);

  const TABS = [
    { id: "about",   label: "About"          },
    { id: "courses", label: "My Courses"     },
    { id: "review",  label: "Drop a Review"  },
  ] as const;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Fade>
        <Card>
          <div className="h-32 rounded-t-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <Link to="/student/settings"
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
                  {userData?.image
                    ? <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700
                        flex items-center justify-center text-3xl font-black text-white">
                        {initials}
                      </div>
                  }
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                    bg-blue-600 hover:bg-blue-500 flex items-center justify-center
                    shadow-[0_3px_10px_rgba(59,130,246,0.45)] transition-all disabled:opacity-70">
                  {avatarUploading
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Camera className="w-3.5 h-3.5 text-white" />
                  }
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div className="flex-1 mt-0 md:mt-20 sm:pb-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{userData?.name ?? authUser?.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                  {userData?.role?.toLowerCase() ?? "Student"}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
              {[
                { icon: MapPin,   text: location },
                { icon: Mail,     text: email    },
                { icon: Calendar, text: `Joined ${joined}` },
              ].map(({ icon: Ic, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Ic className="w-3.5 h-3.5 text-blue-500" />{text}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatTile icon={BookOpen}      color="blue"    value={String(myEnrollments.length)} label="Enrolled Courses" />
          <StatTile icon={CheckCircle2}  color="emerald" value={String(completed)}            label="Completed" sub="courses finished" />
          <StatTile icon={ShoppingBag}   color="amber"   value={`$${totalSpent.toFixed(0)}`} label="Total Invested"   sub="in your education" />
        </div>
      </Fade>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <Fade delay={0.1}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200
                ${activeTab === tab.id
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Fade>

      {/* ── ABOUT tab ────────────────────────────────────────────── */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="flex flex-col gap-5">
            <Fade delay={0.12}>
              <Card className="p-7">
                <SectionHead icon={Globe} title="About Me" />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {userData?.gender ? `${userData.gender} · ` : ""}
                  {location !== "—" ? `Based in ${location}. ` : ""}
                  {`Enrolled ${fmtDate(userData?.studentProfile?.enrollmentDate ?? userData?.createdAt ?? new Date().toISOString())}.`}
                </p>
                {userData?.studentProfile?.matricNumber && (
                  <p className="text-xs text-gray-400 mt-3">
                    Matric No: <span className="font-bold text-gray-700 dark:text-gray-300">{userData.studentProfile.matricNumber}</span>
                  </p>
                )}
              </Card>
            </Fade>

            {/* Learning goals */}
            <Fade delay={0.16}>
              <Card className="p-7">
                <SectionHead icon={TrendingUp} title="Learning Goals" />
                {goals.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {goals.map((goal, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 + i * 0.04 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                          bg-gray-50/60 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{goal}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No learning goals set yet. Update your profile to add some.</p>
                )}
              </Card>
            </Fade>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <Fade delay={0.14}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Learning Stats</p>
                <div className="space-y-3">
                  {[
                    { label: "Current streak",   value: `${stats?.streak.currentStreak ?? 0} days`    },
                    { label: "Avg completion",    value: `${Math.round(stats?.avgCompletionPercent ?? 0)}%` },
                    { label: "Time this month",   value: `${stats?.totalTimeSpentThisMonth ?? 0} min`  },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Fade>

            <Fade delay={0.18}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">Achievements</p>
                <div className="flex flex-col items-center gap-2 py-4 text-center text-gray-400">
                  <Award className="w-8 h-8 opacity-30" />
                  <p className="text-xs">No achievements yet. Keep learning!</p>
                </div>
              </Card>
            </Fade>
          </div>
        </div>
      )}

      {/* ── COURSES tab ──────────────────────────────────────────── */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-4">
          {myEnrollments.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-3 text-center">
              <BookOpen className="w-8 h-8 text-blue-400 opacity-40" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">No courses enrolled yet.</p>
              <Link to="/student/explore" className="text-xs font-bold text-blue-500 hover:underline">Browse courses →</Link>
            </Card>
          ) : (
            myEnrollments.map((enr, i) => {
              const prog = courses.find(c => c.courseId === enr.course.id);
              const pct  = Math.round(prog?.progressPercent ?? 0);
              return (
                <Fade key={enr.id} delay={i * 0.05}>
                  <Card className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-full sm:w-28 h-16 rounded-xl flex-shrink-0
                        bg-gradient-to-br ${gradientFor(i)}
                        flex items-center justify-center overflow-hidden`}>
                        {enr.course.img
                          ? <img src={enr.course.img} alt={enr.course.title} className="w-full h-full object-cover" />
                          : pct === 100
                            ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            : <Play className="w-6 h-6 text-white" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/student/courses/${enr.course.id}`}>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1
                            hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {enr.course.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{enr.course.level.toLowerCase()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <ProgressBar pct={pct} />
                          <span className={`text-[11px] font-bold flex-shrink-0 ${pct === 100 ? "text-emerald-500" : "text-blue-500"}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {pct === 100 ? (
                          <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                            bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400
                            border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <Link to={`/student/courses/${enr.course.id}`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                              bg-blue-600 hover:bg-blue-500 text-white
                              shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
                            <Play className="w-3 h-3" /> Continue
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </Fade>
              );
            })
          )}
        </div>
      )}

      {/* ── REVIEW tab ───────────────────────────────────────────── */}
      {activeTab === "review" && <ReviewTab enrollments={myEnrollments} />}
    </div>
  );
}