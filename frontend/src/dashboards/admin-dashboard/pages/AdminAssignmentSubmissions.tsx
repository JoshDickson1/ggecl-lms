// src/dashboards/admin-dashboard/pages/AdminAssignmentSubmissions.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Users, Clock, CheckCircle2,
  Download, UserCheck, AlertTriangle,
  Search
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AssignmentService from "@/services/assignment.service";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, delay, ease: "easeOut" }}>{children}</motion.div>;
}

export default function AdminAssignmentSubmissions() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "graded">("all");
  const [lateOnly, setLateOnly] = useState(false);

  // Fetch assignment details
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      if (!assignmentId) throw new Error("Assignment ID is required");
      return AssignmentService.getById(assignmentId);
    },
    enabled: !!assignmentId,
  });

  // Fetch submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["assignment-submissions", assignmentId, statusFilter, lateOnly],
    queryFn: async () => {
      if (!assignmentId) return { data: [], meta: {} };
      return AssignmentService.getSubmissions(assignmentId, {
        lateOnly,
      });
    },
    enabled: !!assignmentId,
  });

  // Fetch assignment stats
  const { data: stats } = useQuery({
    queryKey: ["assignment-stats", assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      return AssignmentService.getStats(assignmentId);
    },
    enabled: !!assignmentId,
  });

  // Grade submission mutation
  const { mutate: gradeSubmission } = useMutation({
    mutationFn: ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) =>
      AssignmentService.gradeSubmission(submissionId, { score, feedback }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignment-submissions", assignmentId] });
      qc.invalidateQueries({ queryKey: ["assignment-stats", assignmentId] });
    },
  });

  const submissions = submissionsData?.data || [];
  const filteredSubmissions = submissions.filter((submission: any) => {
    const matchesSearch = !search.trim() || 
      submission.studentId.toLowerCase().includes(search.toLowerCase()) ||
      submission.note?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "submitted" && !submission.grade) ||
      (statusFilter === "graded" && submission.grade);
    
    return matchesSearch && matchesStatus;
  });

  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter((s: any) => s.grade).length;
  const pendingSubmissions = totalSubmissions - gradedSubmissions;

  if (assignmentLoading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading assignment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
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

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-start gap-4 flex-wrap">
          <Link to={`/admin/assignments/${assignmentId}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Assignment
          </Link>
        </div>
      </Fade>

      {/* Header */}
      <Fade delay={0.05}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)]">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  {assignment.title}
                </h1>
                <p className="text-sm text-gray-400 mt-1">Assignment submissions and grading</p>
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Enrolled", value: stats?.totalEnrolled || 0, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
            { icon: FileText, label: "Submissions", value: totalSubmissions, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
            { icon: Clock, label: "Pending", value: pendingSubmissions, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
            { icon: CheckCircle2, label: "Graded", value: gradedSubmissions, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
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
      <Fade delay={0.15}>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student ID or notes..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                {(["all", "submitted", "graded"] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                      statusFilter === filter
                        ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLateOnly(!lateOnly)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                  lateOnly
                    ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40"
                    : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-700"
                )}
              >
                Late Only
              </button>
            </div>
          </div>
        </Card>
      </Fade>

      {/* Submissions List */}
      <Fade delay={0.2}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              Submissions <span className="text-gray-400 font-normal">({filteredSubmissions.length})</span>
            </p>
          </div>
          
          {submissionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Loading submissions...</span>
              </div>
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {filteredSubmissions.map((submission: any, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Student {submission.studentId.slice(-6)}
                          </h3>
                          {submission.isLate && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              Late
                            </span>
                          )}
                          {submission.grade && (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              Graded
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {submission.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {submission.note}
                          </p>
                        )}
                        {submission.attachments && submission.attachments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {submission.attachments.map((attachment: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-all text-xs text-gray-600 dark:text-gray-300"
                                >
                                  <Download className="w-3 h-3" />
                                  {attachment.split('/').pop() || `File ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      {submission.grade ? (
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">
                            {submission.grade.score}/{assignment.maxScore}
                          </p>
                          <p className="text-xs text-gray-400">
                            Graded {new Date(submission.grade.gradedAt).toLocaleDateString()}
                          </p>
                          {submission.grade.feedback && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-[200px]">
                              {submission.grade.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            // TODO: Open grading modal
                            const score = prompt(`Enter score (out of ${assignment.maxScore}):`);
                            if (score && !isNaN(Number(score))) {
                              const feedback = prompt("Enter feedback (optional):") || "";
                              gradeSubmission({
                                submissionId: submission.id,
                                score: Number(score),
                                feedback
                              });
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all"
                        >
                          Grade
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">
                {search || statusFilter !== "all" || lateOnly
                  ? "No submissions match your filters"
                  : "No submissions yet"}
              </p>
            </div>
          )}
        </Card>
      </Fade>
    </div>
  );
}
