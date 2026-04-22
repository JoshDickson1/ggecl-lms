// src/dashboards/instructor/InstructorSupport.tsx
import { useState, useRef, useEffect } from "react";
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
  TicketStatus,
} from "@/data/supportTypes.ts";
import SupportTicketService, {
  TicketCategory as ServiceTicketCategory,
  TicketPriority as ServiceTicketPriority,
} from "@/services/support-ticket.service.ts";
import { FileUploadService } from "@/services/file-upload.service.ts";

// ─── Helpers (same pattern as StudentSupport) ─────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const statusMeta: Record<TicketStatus, { color: string; icon: React.ElementType; label: string }> = {
  OPEN: { color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30", icon: AlertCircle, label: "Open" },
  IN_PROGRESS: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30", icon: Loader2, label: "In Progress" },
  RESOLVED: { color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30", icon: CheckCircle2, label: "Resolved" },
};

const priorityMeta: Record<TicketPriority, { color: string; dot: string }> = {
  LOW: { color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/30", dot: "bg-gray-400" },
  MEDIUM: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30", dot: "bg-amber-400" },
  HIGH: { color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30", dot: "bg-rose-500" },
};

// Instructor-specific categories extend the base ones
const CATEGORIES: TicketCategory[] = ["BILLING", "TECHNICAL", "COURSE_ISSUE", "ACCOUNT", "OTHER"];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];

const formatCategory = (category: TicketCategory) => {
  return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatPriority = (priority: TicketPriority) => {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
};

const timeAgo = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
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
              <span className="text-xs font-bold text-gray-400 font-mono">{ticket.ticketNumber}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                <StatusIcon className="w-3 h-3" />{sm.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{formatPriority(ticket.priority)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                <Tag className="w-3 h-3" />{formatCategory(ticket.category)}
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
            <p className="text-xs font-bold text-gray-400 font-mono mb-1">{ticket.ticketNumber}</p>
            <h2 className="font-black text-gray-900 dark:text-white text-base leading-snug">{ticket.subject}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                <StatusIcon className="w-3 h-3" />{sm.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{formatPriority(ticket.priority)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                <Tag className="w-3 h-3" />{formatCategory(ticket.category)}
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
          {ticket.attachment && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] w-fit">
              <Paperclip className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{ticket.attachment.split('/').pop()}</span>
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
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{note.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(note.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400">Submitted {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [filters, setFilters] = useState({
    status: "" as TicketStatus | "",
    category: "" as TicketCategory | "",
    priority: "" as TicketPriority | ""
  });

  const [form, setForm] = useState({ subject: "", category: "" as TicketCategory | "", priority: "MEDIUM" as TicketPriority, description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const TICKETS_PER_PAGE = 10;

  // Fetch tickets on component mount and when page or filters change
  useEffect(() => {
    fetchTickets();
  }, [currentPage, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const query: any = {
        page: currentPage,
        limit: TICKETS_PER_PAGE
      };
      
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;
      if (filters.priority) query.priority = filters.priority;
      
      const response = await SupportTicketService.findMine(query);
      // Convert SupportTicketSummary to SupportTicket by fetching details for each ticket
      const ticketsWithDetails = await Promise.all(
        response.data.map(async (ticket) => {
          if ('description' in ticket) {
            return ticket as SupportTicket;
          }
          // If it's a summary, fetch full details
          return await SupportTicketService.findOne(ticket.id);
        })
      );
      setTickets(ticketsWithDetails);
      setTotalTickets(response.meta.total);
      setTotalPages(Math.ceil(response.meta.total / TICKETS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.category) e.category = "Required" as any;
    if (!form.description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      setFileError(null);
      
      const payload: any = {
        subject: form.subject.trim(),
        category: form.category as ServiceTicketCategory,
        priority: form.priority as ServiceTicketPriority,
        description: form.description.trim(),
      };
      
      if (file) {
        // Validate file
        const validation = FileUploadService.validateFile(file);
        if (!validation.valid) {
          setFileError(validation.error || 'Invalid file');
          setSubmitting(false);
          return;
        }
        
        // Upload file
        setUploadingFile(true);
        try {
          const fileUrl = await FileUploadService.uploadFile(file);
          payload.attachment = fileUrl;
        } catch (uploadError) {
          setFileError('Failed to upload file. Please try again.');
          setSubmitting(false);
          setUploadingFile(false);
          return;
        } finally {
          setUploadingFile(false);
        }
      }
      
      const newTicket = await SupportTicketService.create(payload);
      setTickets((p) => [{
        ...newTicket,
        attachment: newTicket.attachment || undefined
      }, ...p]);
      setTotalTickets(prev => prev + 1);
      setForm({ subject: "", category: "", priority: "MEDIUM", description: "" });
      setFile(null);
      setFileError(null);
      setErrors({});
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: totalTickets,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({ status: "", category: "", priority: "" });
    setCurrentPage(1);
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

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm text-gray-400 uppercase tracking-wider">Filters</h3>
              {(filters.status || filters.category || filters.priority) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all border-gray-200 dark:border-white/[0.08]"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all border-gray-200 dark:border-white/[0.08]"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{formatCategory(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all border-gray-200 dark:border-white/[0.08]"
                >
                  <option value="">All Priorities</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{formatPriority(p)}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </motion.div>
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
                            {CATEGORIES.map((c) => <option key={c} value={c}>{formatCategory(c)}</option>)}
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
                                  ? p === "LOW" ? "bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                                  : p === "MEDIUM" ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700"
                                  : "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700"
                                  : "bg-gray-50 dark:bg-white/[0.04] text-gray-400 border-gray-200 dark:border-white/[0.07]"
                              }`}>
                              {p === "HIGH" && <Flame className="w-3 h-3 inline mr-1" />}{formatPriority(p)}
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
                      <input ref={fileRef} type="file" className="hidden" onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          const validation = FileUploadService.validateFile(selectedFile);
                          if (validation.valid) {
                            setFile(selectedFile);
                            setFileError(null);
                          } else {
                            setFileError(validation.error || 'Invalid file');
                          }
                        }
                      }} />
                      {file ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] w-fit">
                          <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{file.name}</span>
                          <button 
                            onClick={() => {
                              setFile(null);
                              setFileError(null);
                              if (fileRef.current) fileRef.current.value = '';
                            }} 
                            className="text-gray-400 hover:text-rose-500 transition-colors ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-white/[0.12] hover:border-violet-400 hover:text-violet-500 transition-all"
                        >
                          <Paperclip className="w-4 h-4" />Attach screenshot or file
                        </button>
                      )}
                      {fileError && (
                        <p className="text-xs text-rose-500 mt-1">{fileError}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Supported: Images, PDFs, text documents (max 10MB)</p>
                    </div>
                    <button 
                      onClick={handleSubmit} 
                      disabled={submitting || uploadingFile}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting || uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Submitting...' : uploadingFile ? 'Uploading...' : 'Submit Complaint'}
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
          {error && (
            <Card className="p-4 mb-4 border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800/30">
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </Card>
          )}
          <div className="space-y-3">
            <AnimatePresence>
              {loading ? (
                <Card className="p-10 text-center">
                  <Loader2 className="w-8 h-8 text-violet-500 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading your tickets...</p>
                </Card>
              ) : tickets.length === 0 ? (
                <Card className="p-10 text-center">
                  <LifeBuoy className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No complaints yet. You're all good!</p>
                </Card>
              ) : (
                <>
                  {tickets.map((t) => <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />)}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1623] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                currentPage === page
                                  ? "bg-violet-600 text-white"
                                  : "border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1623] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1623] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
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