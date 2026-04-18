// src/dashboards/student/StudentSupport.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  Plus,
  Paperclip,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  FileText,
  Tag,
  Flame,
  RefreshCw,
} from "lucide-react";
import SupportTicketService, {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  type SupportTicketSummary,
  type SupportTicketDetail,
  type PaginatedTicketsMeta,
} from "@/services/support-ticket.service";
import StorageService from "@/services/storage.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

// Map backend enums → display strings
const STATUS_LABEL: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]:        "Open",
  [TicketStatus.IN_PROGRESS]: "In Progress",
  [TicketStatus.RESOLVED]:    "Resolved",
};

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  [TicketPriority.LOW]:    "Low",
  [TicketPriority.MEDIUM]: "Medium",
  [TicketPriority.HIGH]:   "High",
};

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  [TicketCategory.TECHNICAL]: "Technical",
  [TicketCategory.BILLING]:   "Billing",
  [TicketCategory.COURSE]:    "Course Issue",
  [TicketCategory.ACCOUNT]:   "Account",
  [TicketCategory.OTHER]:     "Other",
};

const statusMeta: Record<TicketStatus, { color: string; icon: React.ElementType }> = {
  [TicketStatus.OPEN]: {
    color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
    icon: AlertCircle,
  },
  [TicketStatus.IN_PROGRESS]: {
    color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
    icon: Loader2,
  },
  [TicketStatus.RESOLVED]: {
    color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
    icon: CheckCircle2,
  },
};

const priorityMeta: Record<TicketPriority, { color: string; dot: string }> = {
  [TicketPriority.LOW]:    { color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/30", dot: "bg-gray-400" },
  [TicketPriority.MEDIUM]: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30", dot: "bg-amber-400" },
  [TicketPriority.HIGH]:   { color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30", dot: "bg-rose-500" },
};

const timeAgo = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CATEGORIES = Object.values(TicketCategory);
const PRIORITIES = Object.values(TicketPriority);

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url);
}

async function downloadAttachment(url: string) {
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = url.split("/").pop()?.split("?")[0] ?? "attachment";
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

function AttachmentView({ url, accent = "blue" }: { url: string; accent?: "blue" | "rose" }) {
  const ring   = accent === "blue" ? "ring-blue-200 dark:ring-blue-800/40" : "ring-rose-200 dark:ring-rose-800/40";
  const btn    = accent === "blue"
    ? "bg-blue-600 hover:bg-blue-500 shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
    : "bg-rose-600 hover:bg-rose-500 shadow-[0_3px_10px_rgba(225,29,72,0.3)]";

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachment</p>
      {isImage(url) && (
        <div className={`rounded-xl overflow-hidden ring-2 ${ring} max-w-sm`}>
          <img src={url} alt="Attachment" className="w-full object-contain max-h-64" />
        </div>
      )}
      <button
        onClick={() => downloadAttachment(url)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white ${btn} transition-all`}
      >
        <Paperclip className="w-3.5 h-3.5" />
        {isImage(url) ? "Download Image" : "Download File"}
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TicketSkeleton() {
  return (
    <Card className="p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-5 w-16 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
          </div>
          <div className="h-4 w-2/3 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
        </div>
        <div className="h-4 w-14 rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
      </div>
    </Card>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, onClick }: { ticket: SupportTicketSummary; onClick: () => void }) {
  const sm = statusMeta[ticket.status];
  const pm = priorityMeta[ticket.priority];
  const StatusIcon = sm.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="p-5 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 font-mono">{ticket.ticketNumber}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                <StatusIcon className="w-3 h-3" />
                {STATUS_LABEL[ticket.status]}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
                {PRIORITY_LABEL[ticket.priority]}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                <Tag className="w-3 h-3" />
                {CATEGORY_LABEL[ticket.category]}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-500 transition-colors truncate">
              {ticket.subject}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              {timeAgo(ticket.createdAt)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────

function TicketModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    SupportTicketService.findOne(ticketId)
      .then(setTicket)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const sm = ticket ? statusMeta[ticket.status] : null;
  const pm = ticket ? priorityMeta[ticket.priority] : null;
  const StatusIcon = sm?.icon ?? Loader2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Loading state */}
        {loading && (
          <div className="px-6 py-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading ticket…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Couldn't load ticket</p>
            <p className="text-xs text-gray-400">Please try again later.</p>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Close
            </button>
          </div>
        )}

        {/* Ticket content */}
        {!loading && ticket && sm && pm && (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-400 font-mono mb-1">{ticket.ticketNumber}</p>
                <h2 className="font-black text-gray-900 dark:text-white text-base leading-snug">{ticket.subject}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                    <StatusIcon className="w-3 h-3" />{STATUS_LABEL[ticket.status]}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{PRIORITY_LABEL[ticket.priority]}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                    <Tag className="w-3 h-3" />{CATEGORY_LABEL[ticket.category]}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Description */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ticket.description}</p>
              </div>

              {ticket.attachment && <AttachmentView url={ticket.attachment} accent="blue" />}

              {/* Admin notes */}
              {ticket.notes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Admin Notes ({ticket.notes.length})
                  </p>
                  <div className="space-y-3">
                    {ticket.notes.map((note) => {
                      const initials = note.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <div key={note.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1">{note.author.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{note.content}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(note.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resolved note */}
              {ticket.status === TicketStatus.RESOLVED && ticket.resolvedAt && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    Resolved on {new Date(ticket.resolvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Submitted {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Create Form ──────────────────────────────────────────────────────────────

interface FormState {
  subject: string;
  category: TicketCategory | "";
  priority: TicketPriority;
  description: string;
}

function CreateForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>({
    subject: "",
    category: "",
    priority: TicketPriority.MEDIUM,
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.subject.trim())   e.subject     = "Required";
    if (!form.category)         e.category    = "Required";
    if (!form.description.trim()) e.description = "Required";
    else if (form.description.trim().length < 20) e.description = "Must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let attachmentUrl: string | undefined;
      if (file) {
        try {
          attachmentUrl = await StorageService.upload("assignments", file);
        } catch {
          setErrors({ subject: "Screenshot upload failed. Submit without it or try a smaller file." });
          setSubmitting(false);
          return;
        }
      }
      await SupportTicketService.create({
        subject:     form.subject.trim(),
        category:    form.category as TicketCategory,
        priority:    form.priority,
        description: form.description.trim(),
        attachment:  attachmentUrl,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onSuccess();
      }, 2200);
    } catch {
      setErrors({ subject: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 flex flex-col items-center gap-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="font-black text-gray-900 dark:text-white text-lg">Complaint submitted!</p>
        <p className="text-sm text-gray-400">We'll get back to you shortly.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Subject</label>
        <input
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          placeholder="Brief summary of your issue"
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04]
            text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
            ${errors.subject ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
        />
        {errors.subject && <p className="text-xs text-rose-500 mt-1">{errors.subject}</p>}
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TicketCategory }))}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04]
                text-gray-800 dark:text-gray-200 appearance-none
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                ${errors.category ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.priority === p
                    ? p === TicketPriority.LOW    ? "bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                    : p === TicketPriority.MEDIUM  ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                    : "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700"
                    : "bg-gray-50 dark:bg-white/[0.04] text-gray-400 border-gray-200 dark:border-white/[0.07]"
                }`}
              >
                {p === TicketPriority.HIGH && <Flame className="w-3 h-3 inline mr-1" />}
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Describe your issue in detail..."
          rows={4}
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04]
            text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all
            ${errors.description ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
        />
        {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
      </div>

      {/* Attachment */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
          Screenshot <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden ring-2 ring-blue-100 dark:ring-blue-900/40 max-w-xs">
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full object-contain max-h-48" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-rose-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400
              border border-dashed border-gray-300 dark:border-white/[0.12]
              hover:border-blue-400 hover:text-blue-500 transition-all"
          >
            <Paperclip className="w-4 h-4" />
            Attach screenshot
          </button>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
          bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "Submitting…" : "Submit Complaint"}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentSupport() {
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [meta, setMeta] = useState<PaginatedTicketsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const result = await SupportTicketService.findMine({ limit: 50 });
      setTickets(result.data);
      setMeta(result.meta);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // After successful create: close form, refresh list
  const handleCreateSuccess = () => {
    setShowForm(false);
    load();
  };

  // Stats — prefer meta counts from backend, fall back to derived
  const stats = {
    total:      meta?.total      ?? tickets.length,
    open:       meta?.openCount        ?? tickets.filter((t) => t.status === TicketStatus.OPEN).length,
    inProgress: meta?.inProgressCount  ?? tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
    resolved:   meta?.resolvedCount    ?? tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
  };

  return (
    <>
      <div className="max-w-[860px] mx-auto space-y-6 pb-12">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Support</h1>
              <p className="text-xs text-gray-400">Submit and track your complaints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowForm((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white
                bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel" : "New Complaint"}
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total",       value: stats.total,      color: "text-gray-900 dark:text-white" },
              { label: "Open",        value: stats.open,       color: "text-blue-600 dark:text-blue-400" },
              { label: "In Progress", value: stats.inProgress, color: "text-amber-600 dark:text-amber-400" },
              { label: "Resolved",    value: stats.resolved,   color: "text-emerald-600 dark:text-emerald-400" },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{loading ? "—" : s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ── Create form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Card className="p-6">
                <h2 className="font-black text-base text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  New Complaint
                </h2>
                <CreateForm onSuccess={handleCreateSuccess} />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Ticket list ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h2 className="font-black text-sm text-gray-400 uppercase tracking-wider mb-3">Your Complaints</h2>

          {/* Error state */}
          {fetchError && (
            <Card className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Couldn't load tickets</p>
              <p className="text-xs text-gray-400 mb-4">Check your connection and try again.</p>
              <button
                onClick={load}
                className="px-4 py-2 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                Retry
              </button>
            </Card>
          )}

          {/* Loading skeletons */}
          {loading && !fetchError && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <TicketSkeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && tickets.length === 0 && (
            <Card className="p-10 text-center">
              <LifeBuoy className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No complaints yet. You're all good!</p>
            </Card>
          )}

          {/* Ticket cards */}
          {!loading && !fetchError && tickets.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence>
                {tickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicketId(t.id)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selectedTicketId && (
          <TicketModal
            ticketId={selectedTicketId}
            onClose={() => setSelectedTicketId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 