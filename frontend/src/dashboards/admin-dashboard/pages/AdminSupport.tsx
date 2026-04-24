// src/dashboards/admin/AdminSupport.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy, Search, X, Clock, CheckCircle2, AlertCircle, Loader2,
  Trash2, Tag, Filter, ChevronDown, Send,
  Paperclip, GraduationCap, Users, Flame, ArrowRight, RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SupportTicketService, {
  TicketStatus, TicketPriority, TicketCategory,
  type SupportTicketSummary, type SupportTicketDetail,
  type PaginatedTickets,
} from "@/services/support-ticket.service";

// ─── Labels ───────────────────────────────────────────────────────────────────

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

// ─── Meta maps ────────────────────────────────────────────────────────────────

const statusMeta: Record<TicketStatus, {
  color: string; icon: React.ElementType;
  next: TicketStatus | null; nextLabel: string;
}> = {
  [TicketStatus.OPEN]: {
    color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
    icon: AlertCircle,
    next: TicketStatus.IN_PROGRESS,
    nextLabel: "Mark In Progress",
  },
  [TicketStatus.IN_PROGRESS]: {
    color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
    icon: Loader2,
    next: TicketStatus.RESOLVED,
    nextLabel: "Mark Resolved",
  },
  [TicketStatus.RESOLVED]: {
    color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
    icon: CheckCircle2,
    next: null,
    nextLabel: "",
  },
};

const priorityMeta: Record<TicketPriority, { color: string; dot: string }> = {
  [TicketPriority.LOW]:    { color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/30",           dot: "bg-gray-400"  },
  [TicketPriority.MEDIUM]: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",       dot: "bg-amber-400" },
  [TicketPriority.HIGH]:   { color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",             dot: "bg-rose-500"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const timeAgo = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

function roleIcon(role?: string) {
  if (!role) return null;
  return role.toLowerCase() === "student"
    ? <GraduationCap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
    : <Users className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-white/[0.04] animate-pulse">
      {[40, 200, 100, 80, 70, 80, 60].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-3.5 rounded-lg bg-gray-100 dark:bg-white/[0.06]`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Ticket Detail Panel ──────────────────────────────────────────────────────

function TicketDetailPanel({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: ticket, isLoading, isError } = useQuery<SupportTicketDetail>({
    queryKey: ["ticket-detail", ticketId],
    queryFn:  () => SupportTicketService.findOne(ticketId),
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => SupportTicketService.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) => SupportTicketService.addNote(ticketId, content),
    onSuccess: () => {
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => SupportTicketService.deleteOne(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      onClose();
    },
  });

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
        initial={{ opacity: 0, x: 40, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 40, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Loading */}
        {isLoading && (
          <div className="px-6 py-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading ticket…</p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Couldn't load ticket</p>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Close
            </button>
          </div>
        )}

        {/* Content */}
        {ticket && sm && pm && (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 font-mono">{ticket.ticketNumber}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
                      <StatusIcon className="w-3 h-3" />{STATUS_LABEL[ticket.status]}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
                      {ticket.priority === TicketPriority.HIGH && <Flame className="w-3 h-3" />}
                      {PRIORITY_LABEL[ticket.priority]}
                    </span>
                  </div>
                  <h2 className="font-black text-gray-900 dark:text-white text-base leading-snug">{ticket.subject}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      {roleIcon(ticket.user?.role)}
                      {ticket.user?.name ?? "Unknown"}
                      {ticket.user?.role && (
                        <span className="capitalize">({ticket.user.role.toLowerCase()})</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />{timeAgo(ticket.createdAt)}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sm.next && (
                <button
                  onClick={() => statusMutation.mutate(sm.next!)}
                  disabled={statusMutation.isPending}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                    bg-gradient-to-r from-rose-600 to-pink-700 text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
                >
                  {statusMutation.isPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <ArrowRight className="w-3.5 h-3.5" />}
                  {sm.nextLabel}
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
                  <Tag className="w-3 h-3" />{CATEGORY_LABEL[ticket.category]}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ticket.description}</p>
              </div>

              {/* Attachment */}
              {ticket.attachment && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachment</p>
                  {/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(ticket.attachment) && (
                    <div className="rounded-xl overflow-hidden ring-2 ring-rose-200 dark:ring-rose-800/40 max-w-sm">
                      <img src={ticket.attachment} alt="Attachment" className="w-full object-contain max-h-64" />
                    </div>
                  )}
                  <a
                    href={ticket.attachment}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-[0_3px_10px_rgba(225,29,72,0.3)] transition-all"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    {/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(ticket.attachment) ? "Download Image" : "Download File"}
                  </a>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Notes {ticket.notes.length > 0 && `(${ticket.notes.length})`}
                </p>
                {ticket.notes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No notes yet. Add the first one below.</p>
                ) : (
                  <div className="space-y-3">
                    {ticket.notes.map(note => {
                      const initials = note.author.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <div key={note.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 bg-rose-50 dark:bg-rose-900/10 rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mb-1">{note.author.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{note.content}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(note.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add note */}
              {ticket.status !== TicketStatus.RESOLVED && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Add a Note</p>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Write a note or reply to the user…"
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border
                      bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08]
                      text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600
                      focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none transition-all"
                  />
                  <button
                    onClick={() => noteMutation.mutate(noteText.trim())}
                    disabled={!noteText.trim() || noteMutation.isPending}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white
                      bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {noteMutation.isPending
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                    Post Note
                  </button>
                </div>
              )}
            </div>

            {/* Footer — delete */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.07]">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete this complaint
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Are you sure?</p>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all disabled:opacity-60"
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.08] text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Ticket Row ───────────────────────────────────────────────────────────────

function TicketRow({ ticket, onClick }: { ticket: SupportTicketSummary; onClick: () => void }) {
  const sm = statusMeta[ticket.status];
  const pm = priorityMeta[ticket.priority];
  const StatusIcon = sm.icon;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group border-b border-gray-50 dark:border-white/[0.04] last:border-0"
    >
      <td className="px-5 py-4">
        <span className="text-xs font-bold text-gray-400 font-mono">{ticket.ticketNumber}</span>
      </td>
      <td className="px-5 py-4">
        <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors truncate max-w-[220px]">
          {ticket.subject}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          {roleIcon(ticket.user?.role)}
          <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {ticket.user?.name ?? "—"}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400 dark:border-gray-700/30">
          <Tag className="w-3 h-3" />{CATEGORY_LABEL[ticket.category]}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${pm.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
          {ticket.priority === TicketPriority.HIGH && <Flame className="w-3 h-3" />}
          {PRIORITY_LABEL[ticket.priority]}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${sm.color}`}>
          <StatusIcon className="w-3 h-3" />{STATUS_LABEL[ticket.status]}
        </span>
      </td>
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
        {timeAgo(ticket.createdAt)}
      </td>
    </motion.tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminSupport() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<TicketStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "All">("All");
  const [roleFilter, setRoleFilter]       = useState<"All" | "STUDENT" | "INSTRUCTOR">("All");
  const [showCategoryDrop, setShowCategoryDrop] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedTickets>({
    queryKey: ["admin-tickets"],
    queryFn:  () => SupportTicketService.findAll({ limit: 200 }),
    refetchInterval: 60_000,
  });

  const tickets = data?.data ?? [];
  const meta    = data?.meta;

  const filtered = useMemo(() => {
    let list = [...tickets];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        (t.user?.name ?? "").toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter   !== "All") list = list.filter(t => t.status   === statusFilter);
    if (categoryFilter !== "All") list = list.filter(t => t.category === categoryFilter);
    if (roleFilter     !== "All") list = list.filter(t => t.user?.role?.toUpperCase() === roleFilter);
    return list;
  }, [tickets, search, statusFilter, categoryFilter, roleFilter]);

  const stats = {
    total:      meta?.total      ?? tickets.length,
    open:       meta?.openCount        ?? tickets.filter(t => t.status === TicketStatus.OPEN).length,
    inProgress: meta?.inProgressCount  ?? tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
    resolved:   meta?.resolvedCount    ?? tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
    high:       tickets.filter(t => t.priority === TicketPriority.HIGH).length,
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter("All"); setCategoryFilter("All"); setRoleFilter("All");
  };
  const hasFilters = search || statusFilter !== "All" || categoryFilter !== "All" || roleFilter !== "All";

  return (
    <>
      <div className="max-w-[1200px] mx-auto space-y-6 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center shadow-md">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Support Tickets</h1>
              <p className="text-xs text-gray-400">Manage and resolve complaints</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Total",         value: isLoading ? "—" : stats.total,      color: "text-gray-900 dark:text-white"             },
              { label: "Open",          value: isLoading ? "—" : stats.open,       color: "text-blue-600 dark:text-blue-400"           },
              { label: "In Progress",   value: isLoading ? "—" : stats.inProgress, color: "text-amber-600 dark:text-amber-400"         },
              { label: "Resolved",      value: isLoading ? "—" : stats.resolved,   color: "text-emerald-600 dark:text-emerald-400"     },
              { label: "High Priority", value: isLoading ? "—" : stats.high,       color: "text-rose-600 dark:text-rose-400"           },
            ].map(s => (
              <Card key={s.label} className="p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Table card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            {/* Filters */}
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tickets…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.07] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                {([
                  { v: "All",                    label: "All"         },
                  { v: TicketStatus.OPEN,         label: "Open"        },
                  { v: TicketStatus.IN_PROGRESS,  label: "In Progress" },
                  { v: TicketStatus.RESOLVED,     label: "Resolved"    },
                ] as const).map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setStatusFilter(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      statusFilter === v
                        ? v === "All"                    ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white"
                        : v === TicketStatus.OPEN         ? "bg-blue-600 text-white"
                        : v === TicketStatus.IN_PROGRESS  ? "bg-amber-500 text-white"
                        : "bg-emerald-600 text-white"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                {(["All", "STUDENT", "INSTRUCTOR"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                      roleFilter === r
                        ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {r === "All" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Category dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDrop(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:border-gray-300 transition-all"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {categoryFilter === "All" ? "Category" : CATEGORY_LABEL[categoryFilter]}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {showCategoryDrop && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-[#0f1623] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-xl overflow-hidden"
                    >
                      <button
                        onClick={() => { setCategoryFilter("All"); setShowCategoryDrop(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${categoryFilter === "All" ? "font-bold text-rose-500" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        All
                      </button>
                      {Object.values(TicketCategory).map(c => (
                        <button
                          key={c}
                          onClick={() => { setCategoryFilter(c); setShowCategoryDrop(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${categoryFilter === c ? "font-bold text-rose-500" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {CATEGORY_LABEL[c]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-rose-500 font-semibold hover:underline whitespace-nowrap">
                  Clear all
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    {["ID", "Subject", "From", "Category", "Priority", "Status", "Submitted"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                  ) : isError ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <AlertCircle className="w-7 h-7 text-rose-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Failed to load tickets</p>
                        <button onClick={() => refetch()} className="mt-2 text-xs text-rose-500 font-semibold hover:underline">Retry</button>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                        No tickets match the current filters.
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {filtered.map(t => (
                        <TicketRow key={t.id} ticket={t} onClick={() => setSelectedId(t.id)} />
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.06]">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of{" "}
                <span className="font-semibold text-gray-600 dark:text-gray-300">{tickets.length}</span> tickets
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Category dropdown click-away */}
      {showCategoryDrop && <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDrop(false)} />}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedId && (
          <TicketDetailPanel
            ticketId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
