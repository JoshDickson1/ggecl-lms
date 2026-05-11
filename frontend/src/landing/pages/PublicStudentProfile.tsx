// src/landing/pages/PublicStudentProfile.tsx
import UserService, { type PublicStudentProfile as StudentProfileType } from "@/services/user.service";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Sparkles,
  Star,
  Tag,
  Target,
  TrendingUp,
  Trophy, Users
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";


// Generate gradient based on student ID
function getGradientForStudent(id: string): string {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-400 to-orange-500",
    "from-red-500 to-rose-600",
    "from-cyan-500 to-blue-500",
    "from-violet-600 to-indigo-700",
    "from-pink-500 to-rose-500",
    "from-orange-500 to-amber-500",
    "from-teal-500 to-cyan-600",
    "from-indigo-500 to-blue-600",
    "from-lime-500 to-green-600",
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=Dancing+Script:wght@700&display=swap');`;

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionCard({ title, icon: Icon, children, delay = 0, className = "" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <FadeUp delay={delay} className={className}>
      <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </FadeUp>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student data from API
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await UserService.findOneStudentPublic(id);
        setStudent(data);
      } catch (err) {
        console.error("Failed to fetch student:", err);
        setError("Failed to load student profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <p className="text-xl font-black text-gray-900 dark:text-white">Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-700" />
        <p className="text-xl font-black text-gray-900 dark:text-white">{error || "Student not found"}</p>
        <Link to="/our-students/public" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">
          ← Back to Our Students
        </Link>
      </div>
    );
  }

  const initials = student.user.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const gradient = getGradientForStudent(student.id);
  
  // Calculate stats from API data
  const completedCourses = student.courseProgress?.filter(cp => cp.isCompleted) || [];
  const totalSubmissions = student.submissions?.length || 0;
  const gradedSubmissions = student.submissions?.filter(s => s.grade) || [];
  const avgScore = gradedSubmissions.length > 0 
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade?.score || 0), 0) / gradedSubmissions.length)
    : 0;
  
  const statItems = [
    { label: "Courses Completed", value: completedCourses.length, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
    { label: "Certificates", value: student.certificates?.length || 0, icon: Award, color: "from-amber-400 to-orange-500" },
    { label: "Avg Score", value: avgScore > 0 ? `${avgScore}%` : "N/A", icon: Star, color: "from-emerald-500 to-teal-600" },
    { label: "Assignments", value: totalSubmissions, icon: FileText, color: "from-violet-500 to-purple-600" },
    { label: "Enrollments", value: student.enrollments?.length || 0, icon: Users, color: "from-cyan-500 to-blue-500" },
    { label: "Total XP", value: student.xp?.totalXp || 0, icon: Trophy, color: "from-rose-500 to-pink-600" },
    { label: "Current Streak", value: `${student.learningStreak?.currentStreak || 0}d`, icon: TrendingUp, color: "from-lime-500 to-green-600" },
    { label: "Quiz Attempts", value: student.quizAttempts?.length || 0, icon: BarChart3, color: "from-red-500 to-rose-600" },
  ];

  return (
    <>
      <style>{FONTS}</style>

      {/* ── Hero / cover ── */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-br ${gradient} overflow-hidden pt-20 pb-8`}>
        {/* pattern */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        {/* back btn */}
        <div className="absolute top-30 left-4 md:left-30">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Our Students
          </button>
        </div> 
      </div>  

      {/* ── Profile header ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar */}
          {student.user.image ? (
            <img 
              src={student.user.image} 
              alt={student.user.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-[22px] object-cover flex-shrink-0 border-4 border-white dark:border-[#0a0f1d] shadow-2xl"
            />
          ) : (
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[22px] bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-[#0a0f1d] shadow-2xl`}>
              <span className="text-white font-black text-3xl">{initials}</span>
            </div>
          )}

          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {student.user.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{student.matricNumber || "N/A"}</p>
              </div>
              {avgScore > 0 && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5`}>
                  <Star className="w-3 h-3" /> Avg {avgScore}%
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              {student.user.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{student.user.location}</span>
              )}
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{student.user.email}</span>
              {student.enrollmentDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Enrolled {new Date(student.enrollmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-6">

        {/* Stats grid */}
        <FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statItems.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-[18px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* About */}
        {student.bio && (
          <SectionCard title="About" icon={Sparkles} delay={0.05}>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{student.bio}</p>
          </SectionCard>
        )}

        {/* Goals + Tags row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {student.learningGoals && student.learningGoals.length > 0 && (
            <SectionCard title="Learning Goals" icon={Target} delay={0.08}>
              <ul className="space-y-2.5">
                {student.learningGoals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">{i + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{goal}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {student.enrollments && student.enrollments.length > 0 && (
            <SectionCard title="Enrolled Courses" icon={Tag} delay={0.1}>
              <div className="flex flex-wrap gap-2">
                {student.enrollments.slice(0, 6).map((enrollment, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    {enrollment.course.title}
                  </span>
                ))}
                {student.enrollments.length > 6 && (
                  <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 text-xs font-bold">
                    +{student.enrollments.length - 6} more
                  </span>
                )}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Completed Courses */}
        {completedCourses && completedCourses.length > 0 && (
          <SectionCard title="Completed Courses" icon={BookOpen} delay={0.14}>
            <div className="space-y-3">
              {completedCourses.map((progress) => (
                <div key={progress.id} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 dark:bg-emerald-950/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{progress.course.title}</p>
                    <p className="text-xs text-gray-400">{progress.completedLessons} / {progress.totalLessons} lessons completed</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
                      {progress.percentComplete}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Certificates */}
        {student.certificates && student.certificates.length > 0 && (
          <FadeUp delay={0.16}>
            <div className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white">Certificates of Completion</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">{student.certificates.length} certificate{student.certificates.length !== 1 ? "s" : ""} earned</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {student.certificates.map((cert) => (
                  <div key={cert.id} className="rounded-[18px] overflow-hidden border border-gray-200 dark:border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0d2a6e]/10 to-indigo-50 dark:from-[#0d2a6e]/30 dark:to-indigo-950/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d2a6e] to-blue-700 flex items-center justify-center flex-shrink-0">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{cert.course.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={cert.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d2a6e] hover:bg-[#0a2060] text-white text-xs font-bold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}

        {/* Assignments */}
        {student.submissions && student.submissions.length > 0 && (
          <SectionCard title="Assignment Submissions" icon={FileText} delay={0.18}>
            <div className="space-y-3">
              {student.submissions.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{submission.assignment.title}</p>
                    <p className="text-xs text-gray-400">
                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      {submission.isLate && <span className="text-amber-500 ml-2">(Late)</span>}
                    </p>
                  </div>
                  {submission.grade && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
                      {submission.grade.score}/{submission.assignment.maxScore}
                    </span>
                  )}
                </div>
              ))}
              {student.submissions.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-2">
                  +{student.submissions.length - 5} more submissions
                </p>
              )}
            </div>
          </SectionCard>
        )}

        {/* Reviews */}
        {student.reviews && student.reviews.length > 0 && (
          <SectionCard title="Course Reviews" icon={Star} delay={0.2}>
            <div className="space-y-3">
              {student.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{review.course.title}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{review.comment}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                    {review.isEdited && <span className="ml-2">(edited)</span>}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Profile ID card */}
        <FadeUp delay={0.24}>
          <div className="rounded-[22px] overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
            <div className="bg-white dark:bg-[#0f1623] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
              {student.user.image ? (
                <img 
                  src={student.user.image} 
                  alt={student.user.name}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-lg"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-white font-black text-xl">{initials}</span>
                </div>
              )}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="font-bold text-gray-900 dark:text-white">{student.user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Matric Number</p>
                  <p className="font-bold text-gray-900 dark:text-white font-mono">{student.matricNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Member Since</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {student.enrollmentDate 
                      ? new Date(student.enrollmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                      : new Date(student.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                    }
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Active Student</span>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Back link */}
        <FadeUp delay={0.26} className="flex justify-center pt-4">
          <Link
            to="/our-students/public"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Students
          </Link>
        </FadeUp>
      </div>
    </>
  );
}
