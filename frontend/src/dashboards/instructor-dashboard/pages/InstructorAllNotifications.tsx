import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell, Star, Users, BookOpen,
  CheckCircle2, Trash2, Search, ChevronDown,
  MessageSquare, Award, Check, Zap, Loader2,
  ClipboardList, RefreshCw,
} from "lucide-react";
import ActivityService from "@/services/activity.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  course?: { id: string; title: string; img: string | null } | null;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeFeed(raw: unknown): { items: ActivityItem[]; unreadCount: number } {
  if (!raw) return { items: [], unreadCount: 0 };
  const r = raw as any;
  const list: any[] = Array.isArray(raw) ? raw
    : Array.isArray(r.items)      ? r.items
    : Array.isArray(r.activities) ? r.activities
    : Array.isArray(r.data)       ? r.data
    : [];
  const items: ActivityItem[] = list.map(a => ({
    id:        a.id        ?? "",
    type:      (a.type     ?? "system").toLowerCase(),
    title:     a.title     ?? a.subject ?? "",
    message:   a.message   ?? a.body    ?? "",
    isRead:    a.isRead    ?? a.read    ?? false,
    createdAt: a.createdAt ?? a.time    ?? new Date().toISOString(),
    course:    a.course    ?? null,
  }));
  const unreadCount: number = r.unreadCount ?? items.filter(i => !i.isRead).length;
  return { items, unreadCount };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type KnownType = "enrollment" | "review" | "assignment" | "message" | "course" | "achievement" | "system";

const TYPE_ICON_MAP: Record<KnownType, { icon: React.ElementType; color: string }> = {
  enrollment:  { icon: Users,         color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"              },
  review:      { icon: Star,          color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"          },
  assignment:  { icon: ClipboardList, color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"      },
  message:     { icon: MessageSquare, color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"              },
  course:      { icon: BookOpen,      color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"      },
  achievement: { icon: Award,         color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"  },
  system:      { icon: Zap,           color: "bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400"             },
};

function NotifIcon({ type }: { type: string }) {
  const key = (Object.keys(TYPE_ICON_MAP).includes(type) ? type : "system") as KnownType;
  const { icon: Icon, color } = TYPE_ICON_MAP[key];
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

const TYPE_FILTERS = [
  { value: "all",         label: "All"         },
  { value: "enrollment",  label: "Enrollments" },
  { value: "review",      label: "Reviews"     },
  { value: "assignment",  label: "Assignments" },
  { value: "message",     label: "Messages"    },
  { value: "course",      label: "Courses"     },
  { value: "achievement", label: "Achievements"},
  { value: "system",      label: "System"      },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstructorAllNotifications() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: raw, isLoading, isError, refetch } = useQuery({
    queryKey: ["instructor-notifications-all"],
    queryFn:  () => ActivityService.getFeed({ limit: 100 }),
    staleTime: 1000 * 60,
  });

  const { items, unreadCount } = useMemo(() => normalizeFeed(raw), [raw]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const markRead = useMutation({
    mutationFn: (id: string) => ActivityService.markAsRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["instructor-notifications-all"] });
      qc.setQueryData(["instructor-notifications-all"], (old: unknown) => {
        const { items: prev, unreadCount: uc } = normalizeFeed(old);
        const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
        return { items: next, unreadCount: Math.max(0, uc - 1) };
      });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => ActivityService.markAllAsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["instructor-notifications-all"] });
      qc.setQueryData(["instructor-notifications-all"], (old: unknown) => {
        const { items: prev } = normalizeFeed(old);
        return { items: prev.map(n => ({ ...n, isRead: true })), unreadCount: 0 };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["instructor-notifications-all"] }),
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => ActivityService.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["instructor-notifications-all"] });
      qc.setQueryData(["instructor-notifications-all"], (old: unknown) => {
        const { items: prev, unreadCount: uc } = normalizeFeed(old);
        const removed = prev.find(n => n.id === id);
        return {
          items: prev.filter(n => n.id !== id),
          unreadCount: removed && !removed.isRead ? Math.max(0, uc - 1) : uc,
        };
      });
    },
  });

  const clearAll = useMutation({
    mutationFn: () => ActivityService.clearAll(),
    onSuccess:  () => qc.setQueryData(["instructor-notifications-all"], { items: [], unreadCount: 0 }),
  });

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => items.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && n.type !== filterType) return false;
    if (filterRead === "unread" && n.isRead)  return false;
    if (filterRead === "read"   && !n.isRead) return false;
    return true;
  }), [items, search, filterType, filterRead]);

  return (
    <div className="max-w-[900px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-bold px-2.5 py-1 rounded-full
                bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300
                border border-indigo-200 dark:border-indigo-800/50">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Your enrollments, reviews, assignments, and platform updates</p>
        </div>
        {items.length > 0 && (
          <button onClick={() => clearAll.mutate()}
            disabled={clearAll.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400
              hover:border-rose-200 hover:text-rose-600 transition-all whitespace-nowrap flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </motion.div>

      {/* Filters bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm
              bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
        </div>
        <div className="relative">
          <select value={filterRead} onChange={e => setFilterRead(e.target.value as "all" | "unread" | "read")}
            className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
              bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
              text-gray-700 dark:text-gray-300 outline-none focus:border-indigo-400 cursor-pointer">
            <option value="all">All status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:border-indigo-200 hover:text-indigo-600 transition-all whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
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
                ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]"
                : "bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-indigo-200 hover:text-indigo-600"
              }`}>
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">Failed to load notifications</p>
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Notification list */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((n, i) => (
                <motion.div key={n.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.24, delay: i * 0.02 }}
                  className={`flex items-start gap-4 p-4 rounded-[18px] border transition-all group
                    ${n.isRead
                      ? "bg-white dark:bg-[#0f1623] border-gray-100 dark:border-white/[0.07]"
                      : "bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30"
                    }`}>
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-snug ${n.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {n.title}
                        {!n.isRead && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 align-middle" />}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    {n.course && (
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mt-1">{n.course.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!n.isRead && (
                      <button onClick={() => markRead.mutate(n.id)} title="Mark as read"
                        className="w-7 h-7 rounded-lg flex items-center justify-center
                          bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500
                          hover:bg-indigo-100 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif.mutate(n.id)} title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                        bg-red-50 dark:bg-red-950/30 text-red-500
                        hover:bg-red-100 transition-colors">
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
                  {search || filterType !== "all" || filterRead !== "all"
                    ? "Try adjusting your filters"
                    : "You're all caught up!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
