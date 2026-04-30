// src/dashboards/admin-dashboard/pages/AdminAssignmentSubmissions.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Users, Clock, CheckCircle2,
  Download, UserCheck, AlertTriangle, Search, X,
  Star, Loader2, ExternalLink,
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

// ─── Grade Modal ──────────────────────────────────────────────────────────────

function GradeModal({
  submission, maxScore, onGrade, onClose, isGrading,
}: {
  submission: any;
  maxScore: number;
  onGrade: (submissionId: string, score: number, feedback: string) => void;
  onClose: () => void;
  isGrading: boolean;
}) {
  const [score,    setScore]    = useState<string>(submission.grade?.score != null ? String(submission.grade.score) : "");
  const [feedback, setFeedback] = useState<string>(
    typeof submission.grade?.feedback === "string" ? submission.grade.feedback : ""
  );
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const n = Number(score);
    if (score === "" || isNaN(n)) { setError("Please enter a valid score"); return; }
    if (n < 0 || n > maxScore)   { setError(`Score must be between 0 and ${maxScore}`); return; }
    setError("");
    onGrade(submission.id, n, feedback);
  };

  const pct = score !== "" && !isNaN(Number(score)) ? ((Number(score) / maxScore) * 100).toFixed(0) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {submission.grade ? "Update Grade" : "Grade Submission"}
              </p>
              <p className="text-sm font-black text-gray-900 dark:text-white">Max: {maxScore} pts</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:bg-white/80 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Student info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white">
                {submission.studentName ?? `Student ···${submission.studentId.slice(-6)}`}
              </p>
              <p className="text-[10px] text-gray-400">
                Submitted {new Date(submission.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {submission.isLate && <span className="text-amber-500 ml-1.5">· Late</span>}
              </p>
            </div>
          </div>

          {/* Score input */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Score <span className="text-blue-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min={0}
                  max={maxScore}
                  value={score}
                  onChange={e => { setScore(e.target.value); setError(""); }}
                  placeholder={`0 – ${maxScore}`}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all text-center font-black text-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  / {maxScore}
                </span>
              </div>
              {pct !== null && (
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg font-black",
                  Number(pct) >= 70 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  : Number(pct) >= 50 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                )}>
                  {pct}%
                </div>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {error}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Feedback <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Great work! Consider improving…"
              className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none resize-none transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              The student will be notified of their grade and this feedback.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isGrading}
              className="flex-[2] py-2.5 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {isGrading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : <><Star className="w-3.5 h-3.5" /> {submission.grade ? "Update Grade" : "Submit Grade"}</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminAssignmentSubmissions() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const qc = useQueryClient();

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<"all" | "submitted" | "graded">("all");
  const [lateOnly,      setLateOnly]      = useState(false);
  const [gradingTarget, setGradingTarget] = useState<any | null>(null);

  // Assignment details
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => {
      if (!assignmentId) throw new Error("Missing assignment ID");
      return AssignmentService.getById(assignmentId);
    },
    enabled: !!assignmentId,
  });

  // Submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["assignment-submissions", assignmentId, lateOnly],
    queryFn: () => {
      if (!assignmentId) return { data: [], meta: {} };
      return AssignmentService.getSubmissions(assignmentId, { lateOnly });
    },
    enabled: !!assignmentId,
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ["assignment-stats", assignmentId],
    queryFn: () => {
      if (!assignmentId) return null;
      return AssignmentService.getStats(assignmentId);
    },
    enabled: !!assignmentId,
  });

  // Grade mutation
  const { mutate: gradeSubmission, isPending: isGrading } = useMutation({
    mutationFn: ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) =>
      AssignmentService.gradeSubmission(submissionId, { score, feedback }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignment-submissions", assignmentId] });
      qc.invalidateQueries({ queryKey: ["assignment-stats", assignmentId] });
      setGradingTarget(null);
    },
  });

  const submissions: any[] = submissionsData?.data || [];
  const filtered = submissions.filter(s => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      s.studentId.toLowerCase().includes(q) ||
      (s.studentName ?? "").toLowerCase().includes(q) ||
      (s.note ?? "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "submitted" && !s.grade) ||
      (statusFilter === "graded" && s.grade);
    return matchSearch && matchStatus;
  });

  const totalSubmissions  = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.grade).length;
  const pendingSubmissions = totalSubmissions - gradedSubmissions;

  if (assignmentLoading) {
    return (
      <div className="max-w-[1100px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading assignment…</p>
        </div>
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="max-w-[1100px] mx-auto flex items-center justify-center min-h-[400px]">
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
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Back */}
      <Fade>
        <Link to={`/admin/assignments/${assignmentId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Assignment
        </Link>
      </Fade>

      {/* Header */}
      <Fade delay={0.05}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)] flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{assignment.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Submissions · Max {assignment.maxScore} pts ·{" "}
              {assignment.allowLate ? "Late allowed" : "No late submissions"}
            </p>
          </div>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: "Enrolled",   value: stats?.totalEnrolled  ?? 0, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"      },
            { icon: FileText,     label: "Submissions", value: totalSubmissions,           color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40"  },
            { icon: Clock,        label: "Pending",     value: pendingSubmissions,         color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"    },
            { icon: CheckCircle2, label: "Graded",      value: gradedSubmissions,          color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student or note…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                {(["all", "submitted", "graded"] as const).map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                      statusFilter === f
                        ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={() => setLateOnly(v => !v)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                  lateOnly
                    ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40"
                    : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:text-gray-700"
                )}>
                Late Only
              </button>
            </div>
          </div>
        </Card>
      </Fade>

      {/* Submissions list */}
      <Fade delay={0.2}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              Submissions <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
          </div>

          {submissionsLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-400">Loading submissions…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">
                {search || statusFilter !== "all" || lateOnly
                  ? "No submissions match your filters"
                  : "No submissions yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {filtered.map((submission: any, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: student + submission info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {submission.studentName ?? `Student ···${submission.studentId.slice(-6)}`}
                          </p>
                          {submission.isLate && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 font-bold">
                              Late
                            </span>
                          )}
                          {submission.grade && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-bold">
                              Graded
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {submission.note && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 italic">
                            "{submission.note}"
                          </p>
                        )}
                        {submission.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {submission.attachments.map((url: string, idx: number) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-all text-xs text-gray-600 dark:text-gray-300 font-medium">
                                <Download className="w-3 h-3" />
                                {url.split("/").pop()?.slice(0, 20) || `File ${idx + 1}`}
                                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: grade info + action */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {submission.grade ? (
                        <>
                          <div className="text-right">
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                              {submission.grade.score}
                              <span className="text-xs text-gray-400 font-normal">/{assignment.maxScore}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              {((submission.grade.score / assignment.maxScore) * 100).toFixed(0)}% ·{" "}
                              {new Date(submission.grade.gradedAt).toLocaleDateString()}
                            </p>
                            {submission.grade.feedback && typeof submission.grade.feedback === "string" && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 max-w-[180px] text-right line-clamp-2">
                                {submission.grade.feedback}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setGradingTarget(submission)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                            Update
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setGradingTarget(submission)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_3px_10px_rgba(59,130,246,0.3)]">
                          Grade
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </Fade>

      {/* Grade modal */}
      <AnimatePresence>
        {gradingTarget && (
          <GradeModal
            submission={gradingTarget}
            maxScore={assignment.maxScore}
            isGrading={isGrading}
            onClose={() => setGradingTarget(null)}
            onGrade={(submissionId, score, feedback) =>
              gradeSubmission({ submissionId, score, feedback })
            }
          />
        )}
      </AnimatePresence>

    </div>
  );
}
