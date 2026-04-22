// src/dashboards/shared/PreviewInstructor.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Globe,
  Mail,
  Phone,
  Play,
  X,
  Send,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  ChevronRight,
  Link,
  Edit3,
  Loader2,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Trophy,
  Hash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  location?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER";
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  createdAt: string;
  instructorProfile?: {
    id: string;
    userId: string;
    department?: string;
    bio?: string | null;
    description?: string | null;
    specialization?: string | null;
    professionalTitle?: string | null;
    professionalExperience?: string | null;
    phoneNumber?: string | null;
    tags?: string[];
    areasOfExpertise?: string[];
    teachingCategories?: string[];
    website?: string | null;
    github?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    recognitions?: string[] | null;
  } | null;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// ─── (data loaded dynamically below) ─────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Fade = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_2px_16px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function Stars({
  rating,
  interactive = false,
  onRate,
  size = "sm",
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  const active = interactive ? hovered || rating : rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} transition-colors ${
            interactive ? "cursor-pointer" : ""
          } ${
            i <= active
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 dark:text-gray-700"
          }`}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({ onClose, name, avatar }: { onClose: () => void; name: string; avatar: string }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating || !text.trim()) return;
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {!submitted ? (
            <>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.07]">
                <div className="flex items-center gap-3">
                  {/* Instructor mini-avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Reviewing</p>
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">
                      {name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center
                    text-gray-400 hover:text-gray-700 dark:hover:text-white
                    bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1]
                    transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Star rating */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your rating
                  </p>
                  <Stars rating={rating} interactive onRate={setRating} size="lg" />
                  {rating > 0 && (
                    <p className="mt-1.5 text-xs text-blue-500 font-medium">
                      {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
                    </p>
                  )}
                </div>

                {/* Text area */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your review
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with this instructor..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/[0.04]
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-800 dark:text-gray-200
                      placeholder:text-gray-400 dark:placeholder:text-gray-600
                      focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                      resize-none transition-all"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {text.length}/500
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08]
                    text-sm font-semibold text-gray-600 dark:text-gray-400
                    hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!rating || !text.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white
                    bg-gradient-to-br from-blue-600 to-indigo-700
                    hover:from-blue-500 hover:to-indigo-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </div>
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-10 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Review submitted!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Thanks for sharing your feedback with the community.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                  bg-gradient-to-br from-blue-600 to-indigo-700
                  hover:from-blue-500 hover:to-indigo-600 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
          {typeof value === "number" && value > 9999
            ? (value / 1000).toFixed(1) + "k"
            : value}
        </p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PreviewInstructor() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "students" | "reviews">("about");
  const [showModal, setShowModal] = useState(false);

  const { data: apiUser, isLoading } = useQuery<ApiUser>({
    queryKey: ["user", id],
    queryFn: async () => UserService.findOne(id!) as Promise<ApiUser>,
    enabled: !!id,
  });

  // Fetch instructor dashboard data
  const { data: instructorStats } = useQuery({
    queryKey: ["instructor-dashboard", "summary", id],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/instructor/summary`, {
        credentials: 'include'
      });
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch instructor courses
  const { data: instructorCourses } = useQuery({
    queryKey: ["instructor-courses", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!id,
  });

  // Fetch instructor students
  const { data: instructorStudents } = useQuery({
    queryKey: ["instructor-students", id],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/instructor/students/all`, {
        credentials: 'include'
      });
      const data = await response.json();
      // Handle different response structures
      return Array.isArray(data) ? data : data?.data || data?.students || [];
    },
    enabled: !!id,
  });

  // Fetch instructor reviews
  const { data: instructorReviews } = useQuery({
    queryKey: ["instructor-reviews", id],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/instructors/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      // Handle different response structures
      return {
        data: Array.isArray(data) ? data : data?.data || data?.reviews || [],
        meta: data?.meta || { total: data?.total || 0 }
      };
    },
    enabled: !!id,
  });

  const profile = apiUser?.instructorProfile;
  const ins = {
    name:           apiUser?.name ?? "Instructor",
    avatar:         initials(apiUser?.name ?? "I"),
    avatarBg:       "bg-gradient-to-br from-blue-600 to-indigo-700",
    title:          profile?.professionalTitle ?? profile?.specialization ?? "Instructor",
    bio:            profile?.bio ?? profile?.description ?? "No bio provided.",
    location:       apiUser?.location ?? "—",
    email:          apiUser?.email ?? "",
    phoneNumber:    profile?.phoneNumber ?? "—",
    website:        profile?.website ?? undefined as string | undefined,
    github:         profile?.github ?? undefined as string | undefined,
    twitter:        profile?.twitter ?? undefined as string | undefined,
    linkedin:       profile?.linkedin ?? undefined as string | undefined,
    youtube:        profile?.youtube ?? undefined as string | undefined,
    department:     profile?.department ?? "—",
    professionalExperience: profile?.professionalExperience ?? "—",
    areasOfExpertise: profile?.areasOfExpertise ?? [],
    tags:           profile?.tags ?? [],
    teachingCategories: profile?.teachingCategories ?? [],
    recognitions:   profile?.recognitions ?? [],
    // Use real API data or fallback to empty arrays
    badges:         instructorStats?.badges || [],
    rating:         instructorStats?.averageRating || 0,
    totalReviews:   instructorReviews?.meta?.total || 0,
    students:       instructorStats?.totalStudents || 0,
    courses:        instructorCourses?.length || 0,
    completionRate: instructorStats?.completionRate || 0,
    courseList:     instructorCourses?.map((course: any) => ({
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail ? `bg-cover bg-center` : "bg-gradient-to-br from-blue-500 to-purple-600",
      thumbnailImage: course.thumbnail || null,
      students: course.enrollmentCount || 0,
      rating: course.averageRating || 0,
      duration: course.duration || "TBD",
      level: course.level || "All Levels",
      price: course.price ? `$${course.price}` : "Free",
      enrolled: course.isEnrolled || false,
      progress: course.progress || 0,
      published: course.published || false
    })) || [],
    studentList:    Array.isArray(instructorStudents) ? instructorStudents?.map((student: any) => ({
      id: student.id,
      name: student.name,
      avatar: student.image ? null : initials(student.name),
      avatarImage: student.image || null,
      email: student.email,
      enrolledDate: student.enrollmentDate || student.createdAt,
      progress: student.progress || 0,
      color: `bg-gradient-to-br from-blue-500 to-purple-600`,
      matricNumber: student.studentProfile?.matricNumber
    })) : [],
    reviews:        Array.isArray(instructorReviews?.data) ? instructorReviews?.data?.map((review: any) => ({
      id: review.id,
      name: review.user?.name || "Anonymous",
      avatar: review.user?.image ? null : initials(review.user?.name || "A"),
      avatarImage: review.user?.image || null,
      color: `bg-gradient-to-br from-blue-500 to-purple-600`,
      text: review.comment || review.content,
      time: formatRelativeTime(review.createdAt),
      rating: review.rating,
      course: review.course?.title || "Course",
      helpful: review.helpful || 0,
      replies: review.replies || []
    })) : [],
  };

  const tabs = [
    { id: "about",    label: "About"               },
    { id: "courses",  label: `Courses (${ins.courses})` },
    { id: "students", label: `Students (${ins.students})` },
    { id: "reviews",  label: `Reviews (${ins.totalReviews})` },
  ] as const;

  if (isLoading && id) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );

  return (
    <>
      {showModal && <ReviewModal onClose={() => setShowModal(false)} name={ins.name} avatar={ins.avatar} />}

      <div className="max-w-[1150px] mx-auto space-y-5 pb-12">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
      <Fade>
        <Card>
          {/* Top gradient strip */}
          <div className="h-32 rounded-t-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />
            <div className="absolute inset-0"
              style={{
                background: "radial-gradient(circle 400px at 80% 50%, rgba(96,165,250,0.3), transparent 70%)",
              }} />
            {/* Edit button */}
            <Link to="/instructor/settings"
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold
                hover:bg-white/30 transition-all">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </Link>
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[20px] overflow-hidden
                  ring-4 ring-white dark:ring-[#0f1623]
                  shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
                  {apiUser?.image
                    ? <img src={apiUser.image} alt={ins.name} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${ins.avatarBg}`}>{ins.avatar}</div>
                  }
                </div>
                {/* Online */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400
                  border-[3px] border-white dark:border-[#0f1623]
                  shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 mt-0 md:mt-20 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {ins.badges.map((b: string) => (
                    <span key={b} className="px-2.5 py-1 rounded-lg text-[10px] font-bold
                      bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300
                      border border-blue-200 dark:border-blue-800/50">
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{ins.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ins.title}</p>
              </div>

              {/* Rating pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-black text-gray-900 dark:text-white">{ins.rating}</span>
                <span className="text-xs text-gray-400">({fmt(ins.totalReviews)})</span>
              </div>
            </div>

            {/* Quick meta row */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
              {ins.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" />{ins.email}</span>}
              {ins.phoneNumber !== "—" && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-green-500" />{ins.phoneNumber}</span>}
              {ins.location !== "—" && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-500" />{ins.location}</span>}
              {ins.department !== "—" && <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-purple-500" />{ins.department}</span>}
            </div>

            {/* Social links */}
            {(ins.website || ins.github || ins.twitter || ins.linkedin || ins.youtube) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {ins.website && (
                  <a href={ins.website} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Website</span>
                  </a>
                )}
                {ins.github && (
                  <a href={ins.github} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">GitHub</span>
                  </a>
                )}
                {ins.twitter && (
                  <a href={ins.twitter} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Twitter</span>
                  </a>
                )}
                {ins.linkedin && (
                  <a href={ins.linkedin} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">LinkedIn</span>
                  </a>
                )}
                {ins.youtube && (
                  <a href={ins.youtube} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    <span className="text-xs text-gray-600 dark:text-gray-400">YouTube</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </Card>
      </Fade>

        {/* ── Stats ── */}
        <Fade delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              value={ins.students}
              label="Students"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={BookOpen}
              value={ins.courses}
              label="Courses"
              color="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <StatCard
              icon={Award}
              value={ins.rating}
              label="Avg Rating"
              color="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StatCard
              icon={TrendingUp}
              value={`${ins.completionRate}%`}
              label="Completion"
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
          </div>
        </Fade>

        {/* ── Tabs ── */}
        <Fade delay={0.08}>
          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Fade>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* ABOUT */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Bio */}
              <Card className="p-6">
                <h2 className="font-black text-lg text-gray-900 dark:text-white mb-3">
                  About Instructor
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {ins.bio}
                </p>
              </Card>

              {/* Professional Experience */}
              {ins.professionalExperience !== "—" && (
                <Card className="p-6">
                  <h3 className="font-black text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Professional Experience
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {ins.professionalExperience}
                  </p>
                </Card>
              )}

              {/* Areas of Expertise */}
              {ins.areasOfExpertise.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-black text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Areas of Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ins.areasOfExpertise.map((area, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                        {area}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tags */}
              {ins.tags.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-black text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-green-500" />
                    Skills & Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ins.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Teaching Categories */}
              {ins.teachingCategories.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-black text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-orange-500" />
                    Teaching Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ins.teachingCategories.map((category, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
                        {category}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recognitions */}
              {ins.recognitions.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-black text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Recognitions & Awards
                  </h3>
                  <ul className="space-y-2">
                    {ins.recognitions.map((recognition, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{recognition}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          )}

          {/* COURSES */}
          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Course Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={BookOpen}
                  value={ins.courses}
                  label="Total Courses"
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={Users}
                  value={ins.students.toLocaleString()}
                  label="Total Students"
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  icon={Star}
                  value={ins.rating}
                  label="Avg Rating"
                  color="bg-gradient-to-br from-amber-400 to-orange-500"
                />
                <StatCard
                  icon={TrendingUp}
                  value={`${ins.completionRate}%`}
                  label="Completion Rate"
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
              </div>

              {/* Course List */}
              {ins.courseList.length === 0 && (
                <div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] p-10 text-center text-gray-400 text-sm">
                  No courses yet.
                </div>
              )}
              {ins.courseList.map((course: any, i: number) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="p-5 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex gap-5">
                      {/* Course Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-32 h-20 rounded-xl ${course.thumbnail}
                            flex items-center justify-center overflow-hidden`}
                          style={course.thumbnailImage ? { backgroundImage: `url(${course.thumbnailImage})` } : {}}
                        >
                          {!course.thumbnailImage && <Play className="w-8 h-8 text-white drop-shadow-lg" />}
                        </div>
                        {course.enrolled && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {course.duration}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06]">
                                {course.level}
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {course.price}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Stars rating={Math.round(course.rating)} />
                              <span className="text-sm font-bold text-amber-500">
                                {course.rating}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {course.students.toLocaleString()} students
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar (if enrolled) */}
                        {course.enrolled && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>Your Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-white/[0.1] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {course.enrolled ? (
                            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                              Continue Learning
                            </button>
                          ) : (
                            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all">
                              Enroll Now
                            </button>
                          )}
                          <button className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* STUDENTS */}
          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Student Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={Users}
                  value={ins.students.toLocaleString()}
                  label="Total Students"
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={TrendingUp}
                  value={`${ins.completionRate}%`}
                  label="Avg Completion"
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  icon={Award}
                  value={ins.rating}
                  label="Avg Rating"
                  color="bg-gradient-to-br from-amber-400 to-orange-500"
                />
                <StatCard
                  icon={BookOpen}
                  value={ins.courses}
                  label="Courses Taken"
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
              </div>

              {/* Student List */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-lg text-gray-900 dark:text-white">
                    Student Directory
                  </h2>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="px-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                    />
                    <button className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                      Filter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ins.studentList.map((student: any, index: number) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-center gap-3">
                          {/* Student Avatar */}
                          <div className="relative flex-shrink-0">
                            {student.avatarImage ? (
                              <img 
                                src={student.avatarImage} 
                                alt={student.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-xl ${student.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {student.avatar}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0f1623]" />
                          </div>

                          {/* Student Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                              {student.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {student.email}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400">
                                Enrolled {formatRelativeTime(student.enrolledDate)}
                              </span>
                              <div className="flex items-center gap-1">
                                <div className="w-12 h-1 bg-gray-200 dark:bg-white/[0.1] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${student.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{student.progress}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center mt-6">
                  <button className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                    Load More Students
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Rating Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Overall score */}
                <Card className="p-6 flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                    Overall Rating
                  </p>
                  <p className="text-6xl font-black text-gray-900 dark:text-white leading-none">
                    {ins.rating}
                  </p>
                  <div className="mt-2">
                    <Stars rating={Math.round(ins.rating)} size="md" />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {ins.totalReviews.toLocaleString()} reviews
                  </p>
                </Card>

                {/* Rating Distribution */}
                <Card className="p-6">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const percentage = rating === 5 ? 72 : rating === 4 ? 18 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-3">{rating}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-white/[0.1] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Drop a review CTA */}
                <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
                  <div>
                    <p className="text-blue-200 text-sm font-medium mb-1">
                      Enjoyed learning from {ins.name}?
                    </p>
                    <h3 className="text-white font-black text-xl leading-tight">
                      Share your experience with other students
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 self-start flex items-center gap-2 px-5 py-2.5 rounded-xl
                      bg-white text-blue-700 font-bold text-sm
                      hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
                  >
                    <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                    Drop a Review
                  </button>
                </Card>
              </div>

              {/* Filter and Sort */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by:</span>
                    <select className="px-3 py-1.5 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200">
                      <option>All Courses</option>
                      {ins.courseList.map((course: any) => (
                        <option key={course.id}>{course.title}</option>
                      ))}
                    </select>
                    <select className="px-3 py-1.5 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200">
                      <option>Most Recent</option>
                      <option>Most Helpful</option>
                      <option>Highest Rated</option>
                      <option>Lowest Rated</option>
                    </select>
                  </div>
                  <span className="text-sm text-gray-500">
                    {ins.totalReviews.toLocaleString()} reviews
                  </span>
                </div>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-3">
                {ins.reviews.map((review: any, index: number) => (
                  <motion.div
                    key={review.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {/* Reviewer Avatar */}
                        <div className="flex-shrink-0">
                          {review.avatarImage ? (
                            <img 
                              src={review.avatarImage} 
                              alt={review.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-xl ${review.color} flex items-center justify-center text-white font-bold text-sm`}>
                              {review.avatar}
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                  {review.name}
                                </h3>
                                <Stars rating={review.rating} />
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{review.time}</span>
                                <span>•</span>
                                <span className="text-blue-600 dark:text-blue-400">{review.course}</span>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          </div>

                          {/* Review Text */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                            {review.text}
                          </p>

                          {/* Helpful Buttons */}
                          <div className="flex items-center gap-4 text-xs">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              Helpful (24)
                            </button>
                            <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                              Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Load More Reviews */}
              <div className="flex justify-center">
                <button className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                  Load More Reviews
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}