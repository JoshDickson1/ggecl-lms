// src/dashboards/admin-dashboard/pages/AdminAssignmentPreview.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Eye, Edit3, Trash2, FileText, Users, Clock,
  CheckCircle2, Calendar, Download, AlertCircle,
  UserCheck, BarChart3, BookOpen, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService, { type AssignmentResponse } from "@/services/assignment.service";
import CoursesService from "@/services/course.service";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

function SectionCard({ icon: Icon, title, children, delay = 0 }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function DeleteModal({
  title,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-6"
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">Delete Assignment</h3>
            <p className="text-xs text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{title}"</span>? All submissions and grades will be permanently removed.
        </p>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminAssignmentPreview() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: assignment, isLoading, error } = useQuery<AssignmentResponse>({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      if (!assignmentId) throw new Error("Assignment ID is required");
      return AssignmentService.getById(assignmentId);
    },
    enabled: !!assignmentId,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses-list", 200],
    queryFn: () => CoursesService.findAll({ limit: 200 }),
    staleTime: 1000 * 60 * 5,
  });

  const allCourses: any[] = (coursesData as any)?.data ?? [];
  const courseMap = new Map<string, string>(allCourses.map((c: any) => [c.id, c.title]));
  const courseName = assignment ? (courseMap.get(assignment.courseId) ?? assignment.courseId) : "";

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["assignment-submissions", assignmentId],
    queryFn: async () => {
      if (!assignmentId) return { data: [], meta: {} };
      return AssignmentService.getSubmissions(assignmentId);
    },
    enabled: !!assignmentId,
  });

  const submissions = submissionsData?.data || [];

  const { data: stats } = useQuery({
    queryKey: ["assignment-stats", assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      return AssignmentService.getStats(assignmentId);
    },
    enabled: !!assignmentId,
  });

  const { mutate: deleteAssignment, isPending: isDeleting } = useMutation({
    mutationFn: () => {
      if (!assignmentId) throw new Error("Assignment ID is required");
      return AssignmentService.delete(assignmentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      navigate("/admin/assignments");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-400">Loading assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-400 mb-4">Assignment not found</p>
            <Link to="/admin/assignments">
              <button className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">
                Back to Assignments
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / 86400000);
  const isPast = daysLeft < 0;
  const isSoon = daysLeft <= 3 && !isPast;

  const totalSubmissions = submissions?.length || 0;
  const gradedSubmissions = submissions?.filter((s: any) => s.grade).length || 0;
  const pendingSubmissions = totalSubmissions - gradedSubmissions;

  return (
    <>
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            title={assignment.title}
            onConfirm={() => deleteAssignment()}
            onCancel={() => setShowDeleteModal(false)}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        <Fade>
          <div className="flex items-start gap-4 flex-wrap">
            <Link to="/admin/assignments" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Assignments
            </Link>
          </div>
        </Fade>

        {/* Header */}
        <Fade delay={0.05}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)]">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    {assignment.title}
                  </h1>
                  {courseName && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{courseName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin/assignments/${assignment.id}/submissions`}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all">
                  <Users className="w-4 h-4" /> Submissions
                </motion.button>
              </Link>
              <Link to={`/admin/assignments/${assignment.id}/edit`}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                  <Edit3 className="w-4 h-4" /> Edit
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </motion.button>
            </div>
          </div>
        </Fade>

        {/* Stats */}
        <Fade delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Total Enrolled", value: stats?.totalEnrolled ?? 0, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
              { icon: FileText, label: "Submissions", value: totalSubmissions, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
              { icon: Clock, label: "Pending Grade", value: pendingSubmissions, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
              { icon: CheckCircle2, label: "Graded", value: stats?.graded ?? gradedSubmissions, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
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

        {/* Assignment Details */}
        <SectionCard icon={FileText} title="Assignment Details" delay={0.15}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {assignment.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Instructions</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {assignment.instructions}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Course</h3>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{courseName || "—"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Due Date</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={cn("text-sm font-semibold",
                    isPast ? "text-red-500" : isSoon ? "text-amber-500" : "text-gray-600"
                  )}>
                    {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full border capitalize",
                    isPast ? "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800/40"
                           : isSoon ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800/40"
                                     : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800/40"
                  )}>
                    {isPast ? "Closed" : isSoon ? "Due Soon" : "Open"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Scoring</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">Max: {assignment.maxScore}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400">
                    {assignment.allowLate ? "Late allowed" : "No late"}
                  </span>
                </div>
              </div>
            </div>

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Attachments</h3>
                <div className="space-y-2">
                  {assignment.attachments.map((attachment: string, index: number) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                        {attachment.split('/').pop() || `Attachment ${index + 1}`}
                      </span>
                      <span className="text-xs text-blue-600 font-semibold">Open</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Submissions Preview */}
        <SectionCard icon={Users} title="Recent Submissions" delay={0.2}>
          <div className="space-y-4">
            {submissionsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading submissions...</p>
              </div>
            ) : submissions && submissions.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-gray-900 dark:text-white">{totalSubmissions}</span> submission{totalSubmissions !== 1 ? "s" : ""} &bull; <span className="text-emerald-600 font-semibold">{gradedSubmissions} graded</span> &bull; <span className="text-amber-600 font-semibold">{pendingSubmissions} pending</span>
                  </p>
                  <Link to={`/admin/assignments/${assignment.id}/submissions`}>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                      <Eye className="w-3 h-3" /> View All
                    </button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {submissions.slice(0, 5).map((submission: any) => {
                    const studentLabel = submission.studentName
                      ? submission.studentName
                      : `Student …${submission.studentId.slice(-6)}`;
                    const score = submission.grade?.resolvedGrade ?? submission.grade?.score ?? null;
                    const pct = score !== null ? Math.round((score / assignment.maxScore) * 100) : null;
                    const pctColor = pct === null ? "" : pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500";

                    return (
                      <div key={submission.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/[0.06] flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{studentLabel}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                              {submission.isLate && <span className="text-amber-500 ml-2">(Late)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {score !== null ? (
                            <div className="text-right">
                              <span className={`text-sm font-bold ${pctColor}`}>
                                {score}/{assignment.maxScore}
                              </span>
                              {pct !== null && (
                                <p className={`text-[10px] font-semibold ${pctColor}`}>{pct}%</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-200 dark:border-amber-800/40">
                              Ungraded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {submissions.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to={`/admin/assignments/${assignment.id}/submissions`}>
                      <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        View {submissions.length - 5} more submission{submissions.length - 5 !== 1 ? "s" : ""}
                      </button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">No submissions yet</p>
                <p className="text-xs text-gray-400 mt-1">Students haven't submitted any work</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
