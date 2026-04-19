// src/dashboards/admin-dashboard/pages/AdminAllNotifications.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Send, Users, GraduationCap, Globe,
  CheckCircle2, Trash2, Search,
  BookOpen, DollarSign, Ticket, Zap,
  AlertCircle, Info, X, ChevronDown,
  Check, RefreshCw, Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ActivityService from "@/services/activity.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "system" | "course" | "payout" | "ticket" | "enrollment" | "alert";

interface ActivityItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
  type?: string;
}

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferType(item: ActivityItem): NotifType {
  const text = `${item.title} ${item.message} ${item.type ?? ""}`.toLowerCase();
  if (text.includes("ticket") || text.includes("support"))                         return "ticket";
  if (text.includes("payout") || text.includes("payment") || text.includes("₦"))  return "payout";
  if (text.includes("course") || text.includes("review"))                          return "course";
  if (text.includes("enroll"))                                                      return "enrollment";
  if (text.includes("alert") || text.includes("login") || text.includes("unusual")) return "alert";
  return "system";
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function mapActivity(item: ActivityItem): Notification {
  return {
    id:    item.id,
    type:  inferType(item),
    title: item.title,
    body:  item.message,
    time:  timeAgo(item.createdAt),
    read:  item.isRead,
  };
}

function normalizeResponse(raw: unknown): ActivityItem[] {
  if (Array.isArray(raw)) return raw as ActivityItem[];
  const r = raw as any;
  if (r?.items && Array.isArray(r.items)) return r.items as ActivityItem[];
  if (r?.data  && Array.isArray(r.data))  return r.data  as ActivityItem[];
  return [];
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotifType }) {
  const map: Record<NotifType, { icon: React.ElementType; color: string }> = {
    system:     { icon: Zap,         color: "bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400"         },
    course:     { icon: BookOpen,    color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"          },
    payout:     { icon: DollarSign,  color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" },
    ticket:     { icon: Ticket,      color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"      },
    enrollment: { icon: Users,       color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"          },
    alert:      { icon: AlertCircle, color: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"              },
  };
  const { icon: Icon, color } = map[type];
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ─── Compose modal ────────────────────────────────────────────────────────────

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [audience,  setAudience]  = useState<"students" | "instructors" | "both">("students");
  const [notifType, setNotifType] = useState<"info" | "alert" | "update">("info");
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");

  const audienceLabels = {
    students:    { icon: Users,         label: "Students only",    count: "all students"    },
    instructors: { icon: GraduationCap, label: "Instructors only", count: "all instructors" },
    both:        { icon: Globe,         label: "Everyone",         count: "all users"       },
  };

  const typeConfig = {
    info:   { icon: Info,        label: "Informational",  color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"       },
    alert:  { icon: AlertCircle, label: "Alert",          color: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"           },
    update: { icon: RefreshCw,   label: "Platform Update",color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"},
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.2)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">Send Notification</h2>
              <p className="text-[11px] text-gray-400">Broadcast a message to platform users</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-500 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* Backend callout */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Backend should provide:{" "}
              <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">POST /notifications/broadcast</code>{" "}
              with <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">{"{ audience, type, title, message }"}</code> — bulk push notification to all users of a role.
            </p>
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
              Audience <span className="text-blue-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["students", "instructors", "both"] as const).map(a => {
                const { icon: Icon, label, count } = audienceLabels[a];
                return (
                  <button key={a} onClick={() => setAudience(a)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all duration-200
                      ${audience === a
                        ? "bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                        : "border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:text-blue-600"
                      }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{label}</span>
                    <span className={`text-[9px] font-medium ${audience === a ? "text-blue-200" : "text-gray-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
              Notification Type <span className="text-blue-500">*</span>
            </label>
            <div className="flex gap-2">
              {(["info", "alert", "update"] as const).map(t => {
                const { icon: Icon, label, color } = typeConfig[t];
                return (
                  <button key={t} onClick={() => setNotifType(t)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all
                      ${notifType === t
                        ? "bg-blue-600 text-white border-blue-600 shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
                        : "border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:text-blue-600"
                      }`}>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${notifType === t ? "bg-white/20" : color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
              Title <span className="text-blue-500">*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Scheduled maintenance on Sunday 3AM"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
              Message <span className="text-blue-500">*</span>
            </label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
              placeholder="Write your notification message here…"
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
            <p className="text-[11px] text-gray-400 mt-1">{body.length}/300 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            Will send to {audienceLabels[audience].count}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <button
              disabled={!title.trim() || !body.trim()}
              title="Backend endpoint required"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed">
              <Send className="w-3.5 h-3.5" /> Send (pending backend)
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TYPE_FILTERS = [
  { value: "all"        as const, label: "All"        },
  { value: "ticket"     as const, label: "Tickets"    },
  { value: "course"     as const, label: "Courses"    },
  { value: "enrollment" as const, label: "Enrollment" },
  { value: "payout"     as const, label: "Payouts"    },
  { value: "alert"      as const, label: "Alerts"     },
  { value: "system"     as const, label: "System"     },
];

export default function AdminAllNotifications() {
  const qc = useQueryClient();

  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState<NotifType | "all">("all");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [composing,  setComposing]  = useState(false);

  // ── Real API: load activity feed ───────────────────────────────────────────
  const { data: rawFeed, isLoading } = useQuery({
    queryKey: ["activity-feed"],
    queryFn:  () => ActivityService.getFeed({ limit: 100 }),
    staleTime: 1000 * 30,
  });

  const notifs = useMemo<Notification[]>(() => {
    const items = normalizeResponse(rawFeed);
    return items.map(mapActivity);
  }, [rawFeed]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ["activity-feed"] });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => ActivityService.markAsRead(id),
    onSuccess:  invalidate,
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () => ActivityService.markAllAsRead(),
    onSuccess:  invalidate,
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => ActivityService.remove(id),
    onMutate: async (id) => {
      // optimistic remove
      await qc.cancelQueries({ queryKey: ["activity-feed"] });
      const prev = qc.getQueryData(["activity-feed"]);
      qc.setQueryData(["activity-feed"], (old: unknown) => {
        const items = normalizeResponse(old);
        const updated = items.filter(i => i.id !== id);
        if (Array.isArray(old)) return updated;
        return { ...(old as object), items: updated };
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["activity-feed"], ctx.prev);
    },
    onSettled: invalidate,
  });

  const { mutate: clearAll, isPending: clearingAll } = useMutation({
    mutationFn: () => ActivityService.clearAll(),
    onSuccess:  invalidate,
  });

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => notifs.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.body.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && n.type !== filterType) return false;
    if (filterRead === "unread" && n.read)  return false;
    if (filterRead === "read"   && !n.read) return false;
    return true;
  }), [notifs, search, filterType, filterRead]);

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-[900px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 text-sm font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">All platform alerts and activity for your admin account</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {notifs.length > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => clearAll()}
              disabled={clearingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-red-200 hover:text-red-500 transition-colors">
              {clearingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Clear all
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors">
            <Send className="w-4 h-4" /> Send Noti
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4 flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
        </div>

        <div className="relative">
          <select value={filterRead} onChange={e => setFilterRead(e.target.value as "all" | "unread" | "read")}
            className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none focus:border-blue-400 cursor-pointer">
            <option value="all">All status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {unreadCount > 0 && (
          <button onClick={() => markAllRead()} disabled={markingAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:text-blue-600 transition-all whitespace-nowrap disabled:opacity-50">
            {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Mark all read
          </button>
        )}
      </motion.div>

      {/* Type pills */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilterType(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200
              ${filterType === f.value
                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                : "bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-blue-200 hover:text-blue-600"
              }`}>
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-400">Loading notifications…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((n, i) => (
                <motion.div key={n.id} layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.24, delay: i * 0.03 }}
                  className={`flex items-start gap-4 p-4 rounded-[18px] border transition-all duration-200 group
                    ${n.read
                      ? "bg-white dark:bg-[#0f1623] border-gray-100 dark:border-white/[0.07]"
                      : "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30"
                    }`}>
                  <NotifIcon type={n.type} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-snug ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {n.title}
                        {!n.read && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle" />}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} title="Mark as read"
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                  <Bell className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-700 dark:text-white mb-1">No notifications</h3>
                <p className="text-sm text-gray-400">
                  {search || filterType !== "all" || filterRead !== "all" ? "Try adjusting your filters" : "You're all caught up!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {composing && <ComposeModal onClose={() => setComposing(false)} />}
      </AnimatePresence>
    </div>
  );
}
