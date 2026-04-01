// src/dashboards/instructor/InstructorSupport.tsx
import { useState, useRef } from "react";
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
} from "lucide-react";
import type {
  SupportTicket,
  TicketCategory,
  TicketPriority,
} from "@/data/supportTypes.ts";
import { SEED_TICKETS } from "@/data/supportTypes.ts";

// ─── Helpers (same pattern as StudentSupport) ─────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const statusMeta: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  Open: { color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30", icon: AlertCircle, label: "Open" },
  "In Progress": { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30", icon: Loader2, label: "In Progress" },
  Resolved: { color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30", icon: CheckCircle2, label: "Resolved" },
};

const priorityMeta: Record<string, { color: string; dot: string }> = {
  Low: { color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/30", dot: "bg-gray-400" },
  Medium: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30", dot: "bg-amber-400" },
  High: { color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30", dot: "bg-rose-500" },
};

// Instructor-specific categories extend the base ones
const CATEGORIES: TicketCategory[] = ["Technical", "Course Issue", "Billing", "Account", "Other"];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High"];

const timeAgo = (d: Date) => {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, onClick }: { ticket: SupportTicket; onClick: () => void }) {
  const sm = statusMeta[ticket.status];
  const pm = priorityMeta[ticket.priority];
  const StatusIcon = sm.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} onClick={onClick} className="cursor-pointer">
      <Card className="p-5 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 font-mono">{ticket.id}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                <StatusIcon className="w-3 h-3" />{sm.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{ticket.priority}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                <Tag className="w-3 h-3" />{ticket.category}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-violet-500 transition-colors truncate">{ticket.subject}</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ticket.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{timeAgo(ticket.createdAt)}</p>
            {ticket.notes.length > 0 && <p className="text-xs text-violet-500 mt-1 font-semibold">{ticket.notes.length} note{ticket.notes.length > 1 ? "s" : ""}</p>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────

function TicketModal({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const sm = statusMeta[ticket.status];
  const pm = priorityMeta[ticket.priority];
  const StatusIcon = sm.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gray-400 font-mono mb-1">{ticket.id}</p>
            <h2 className="font-black text-gray-900 dark:text-white text-base leading-snug">{ticket.subject}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                <StatusIcon className="w-3 h-3" />{sm.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{ticket.priority}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                <Tag className="w-3 h-3" />{ticket.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ticket.description}</p>
          </div>
          {ticket.attachmentName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] w-fit">
              <Paperclip className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{ticket.attachmentName}</span>
            </div>
          )}
          {ticket.notes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Admin Notes</p>
              <div className="space-y-3">
                {ticket.notes.map((note) => (
                  <div key={note.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-black flex-shrink-0">A</div>
                    <div className="flex-1 bg-violet-50 dark:bg-violet-900/20 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{note.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(note.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400">Submitted {ticket.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorSupport() {
  const myTickets = SEED_TICKETS.filter((t) => t.submitterRole === "instructor");
  const [tickets, setTickets] = useState<SupportTicket[]>(myTickets);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({ subject: "", category: "" as TicketCategory | "", priority: "Medium" as TicketPriority, description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.category) e.category = "Required" as any;
    if (!form.description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 200).padStart(3, "0")}`,
      subject: form.subject.trim(),
      category: form.category as TicketCategory,
      priority: form.priority,
      status: "Open",
      description: form.description.trim(),
      attachmentName: file?.name,
      submittedBy: "You",
      submitterRole: "instructor",
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
    };
    setTickets((p) => [newTicket, ...p]);
    setForm({ subject: "", category: "", priority: "Medium", description: "" });
    setFile(null);
    setErrors({});
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2500);
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <>
      <div className="max-w-[860px] mx-auto space-y-6 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Support</h1>
              <p className="text-xs text-gray-400">Submit and track your complaints</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white
              bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 transition-all shadow-md"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Complaint"}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-gray-900 dark:text-white" },
              { label: "Open", value: stats.open, color: "text-blue-600 dark:text-blue-400" },
              { label: "In Progress", value: stats.inProgress, color: "text-amber-600 dark:text-amber-400" },
              { label: "Resolved", value: stats.resolved, color: "text-emerald-600 dark:text-emerald-400" },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <Card className="p-6">
                <h2 className="font-black text-base text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-500" />
                  New Complaint
                </h2>
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-black text-gray-900 dark:text-white text-lg">Complaint submitted!</p>
                    <p className="text-sm text-gray-400">We'll get back to you shortly.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Subject</label>
                      <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Brief summary of your issue"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all ${errors.subject ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`} />
                      {errors.subject && <p className="text-xs text-rose-500 mt-1">{errors.subject}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
                        <div className="relative">
                          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TicketCategory }))}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all ${errors.category ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}>
                            <option value="">Select category</option>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Priority</label>
                        <div className="flex gap-2">
                          {PRIORITIES.map((p) => (
                            <button key={p} type="button" onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                form.priority === p
                                  ? p === "Low" ? "bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                                  : p === "Medium" ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                                  : "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700"
                                  : "bg-gray-50 dark:bg-white/[0.04] text-gray-400 border-gray-200 dark:border-white/[0.07]"
                              }`}>
                              {p === "High" && <Flame className="w-3 h-3 inline mr-1" />}{p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
                      <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe your issue in detail..." rows={4}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none transition-all ${errors.description ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`} />
                      {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Attachment <span className="font-normal text-gray-400">(optional)</span></label>
                      <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                      {file ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] w-fit">
                          <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{file.name}</span>
                          <button onClick={() => setFile(null)} className="text-gray-400 hover:text-rose-500 transition-colors ml-1"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-white/[0.12] hover:border-violet-400 hover:text-violet-500 transition-all">
                          <Paperclip className="w-4 h-4" />Attach screenshot or file
                        </button>
                      )}
                    </div>
                    <button onClick={handleSubmit}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 transition-all shadow-md">
                      <Send className="w-4 h-4" />Submit Complaint
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ticket list */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h2 className="font-black text-sm text-gray-400 uppercase tracking-wider mb-3">Your Complaints</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {tickets.length === 0 ? (
                <Card className="p-10 text-center">
                  <LifeBuoy className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No complaints yet. You're all good!</p>
                </Card>
              ) : (
                tickets.map((t) => <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />)
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedTicket && <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      </AnimatePresence>
    </>
  );
}