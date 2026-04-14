// src/dashboards/student-dashboard/pages/StudentAllNotifications.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell, BookOpen, Award, CheckCircle2, Trash2,
  Search, ChevronDown, MessageSquare, PlayCircle,
  Tag, Zap, Check, GraduationCap, ShoppingCart,
  Heart, Star, Trophy, Loader2,
} from "lucide-react";
import ActivityService from "@/services/activity.service";

// ─── API Types (exact backend shape) ─────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  courseId?: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

interface ActivityResponse {
  data: ActivityItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    unreadCount: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtRelative(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  === 1) return "Yesterday";
  if (days  < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Map backend activity type → icon + color
function getIconConfig(type: string): { icon: React.ElementType; color: string } {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    LESSON_COMPLETED:    { icon: PlayCircle,    color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"             },
    COURSE_COMPLETED:    { icon: Trophy,        color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    CERTIFICATE_ISSUED:  { icon: GraduationCap, color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    ACHIEVEMENT_EARNED:  { icon: Award,         color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"         },
    REVIEW_SUBMITTED:    { icon: Star,          color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"     },
    ENROLLED:            { icon: BookOpen,      color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"     },
    WISHLIST_ITEM_ADDED: { icon: Heart,         color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"             },
    WISHLIST_TO_CART:    { icon: ShoppingCart,  color: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"     },
    CART_ITEM_ADDED:     { icon: ShoppingCart,  color: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"     },
    NEW_MESSAGE:         { icon: MessageSquare, color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"             },
    PROMO:               { icon: Tag,           color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"             },
  };
  return map[type] ?? { icon: Zap, color: "bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400" };
}

// Map type → CTA link
function getCTA(item: ActivityItem): { label: string; to: string } | null {
  switch (item.type) {
    case "LESSON_COMPLETED":
    case "COURSE_COMPLETED":
      return item.courseId ? { label: "View course", to: `/student/courses/${item.courseId}` } : null;
    case "CERTIFICATE_ISSUED":
      return { label: "Download", to: "/student/certificates" };
    case "ACHIEVEMENT_EARNED":
      return { label: "View achievements", to: "/student/profile" };
    case "ENROLLED":
      return item.courseId ? { label: "Start learning", to: `/student/courses/${item.courseId}` } : null;
    case "WISHLIST_ITEM_ADDED":
      return { label: "View wishlist", to: "/student/wishlist" };
    case "WISHLIST_TO_CART":
    case "CART_ITEM_ADDED":
      return { label: "View cart", to: "/student/cart" };
    default:
      return null;
  }
}

// Map type → human-readable category for filter pills
type FilterCategory = "all" | "learning" | "purchases" | "achievements" | "messages" | "system";

function getCategory(type: string): FilterCategory {
  if (["LESSON_COMPLETED","COURSE_COMPLETED","ENROLLED","CERTIFICATE_ISSUED"].includes(type)) return "learning";
  if (["WISHLIST_ITEM_ADDED","WISHLIST_TO_CART","CART_ITEM_ADDED","PROMO"].includes(type))     return "purchases";
  if (["ACHIEVEMENT_EARNED","REVIEW_SUBMITTED"].includes(type))                                 return "achievements";
  if (["NEW_MESSAGE"].includes(type))                                                           return "messages";
  return "system";
}

const TYPE_FILTERS: { value: FilterCategory; label: string }[] = [
  { value: "all",          label: "All"          },
  { value: "learning",     label: "Learning"     },
  { value: "purchases",    label: "Purchases"    },
  { value: "achievements", label: "Achievements" },
  { value: "messages",     label: "Messages"     },
  { value: "system",       label: "System"       },
];

// ─── Notification icon ────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const { icon: Icon, color } = getIconConfig(type);
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06] ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto pb-10 space-y-6">
      <div className="space-y-2">
        <Sk className="h-9 w-56" />
        <Sk className="h-4 w-72" />
      </div>
      <Sk className="h-14 rounded-[20px]" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-8 w-20 rounded-full" />)}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-20 rounded-[18px]" />)}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentAllNotifications() {
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState<FilterCategory>("all");
  const [filterRead,  setFilterRead]  = useState<"all" | "unread" | "read">("all");

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ActivityResponse>({
    queryKey: ["activities-all"],
    queryFn:  () => ActivityService.getFeed({ limit: 50 }) as Promise<ActivityResponse>,
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => ActivityService.markAsRead(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["activities-all"]    });
      queryClient.invalidateQueries({ queryKey: ["activities-navbar"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => ActivityService.markAllAsRead(),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["activities-all"]    });
      queryClient.invalidateQueries({ queryKey: ["activities-navbar"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ActivityService.remove(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["activities-all"]    });
      queryClient.invalidateQueries({ queryKey: ["activities-navbar"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => ActivityService.clearAll(),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ["activities-all"]    });
      queryClient.invalidateQueries({ queryKey: ["activities-navbar"] });
    },
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="max-w-[900px] mx-auto py-20 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Failed to load notifications. Please try again.</p>
      </div>
    );
  }

  const notifications = data?.data ?? [];
  const unreadCount   = data?.meta.unreadCount ?? 0;

  const filtered = notifications.filter(n => {
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    const matchCat  = filterCat === "all" || getCategory(n.type) === filterCat;
    const matchRead = filterRead === "all"
      ? true
      : filterRead === "unread" ? !n.isRead : n.isRead;
    return matchSearch && matchCat && matchRead;
  });

  return (
    <div className="max-w-[900px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 text-sm font-bold px-2.5 py-1 rounded-full
              bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300
              border border-blue-200 dark:border-blue-800/50">
              {unreadCount} new
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your course updates, messages, achievements, and more
        </p>
      </motion.div>

      {/* Filters bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm
              bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
        </div>
        {/* Read status filter */}
        <div className="relative">
          <select
            value={filterRead}
            onChange={e => setFilterRead(e.target.value as "all" | "unread" | "read")}
            className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
              bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
              text-gray-700 dark:text-gray-300 outline-none focus:border-blue-400 cursor-pointer">
            <option value="all">All status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {markAllMutation.isPending ? "Marking…" : "Mark all read"}
          </button>
        )}
        {/* Clear all */}
        {notifications.length > 0 && (
          <button
            onClick={() => clearAllMutation.mutate()}
            disabled={clearAllMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              border border-gray-200 dark:border-white/[0.08] text-red-500
              hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all whitespace-nowrap">
            <Trash2 className="w-3.5 h-3.5" />
            {clearAllMutation.isPending ? "Clearing…" : "Clear all"}
          </button>
        )}
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterCat(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200
              ${filterCat === f.value
                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                : "bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-blue-200 hover:text-blue-600"
              }`}>
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Notifications list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((n, i) => {
              const cta = getCTA(n);
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.24, delay: i * 0.03 }}
                  className={`flex items-start gap-4 p-4 rounded-[18px] border transition-all group
                    ${n.isRead
                      ? "bg-white dark:bg-[#0f1623] border-gray-100 dark:border-white/[0.07]"
                      : "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30"
                    }`}>
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-snug
                        ${n.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                        {n.title}
                        {!n.isRead && (
                          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle" />
                        )}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {fmtRelative(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    {cta && (
                      <Link
                        to={cta.to}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        {cta.label} →
                      </Link>
                    )}
                  </div>

                  {/* Actions — show on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markOneMutation.mutate(n.id)}
                        disabled={markOneMutation.isPending}
                        title="Mark as read"
                        className="w-7 h-7 rounded-lg flex items-center justify-center
                          bg-blue-50 dark:bg-blue-950/30 text-blue-500 hover:bg-blue-100 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(n.id)}
                      disabled={deleteMutation.isPending}
                      title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                        bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-700 dark:text-white mb-1">No notifications</h3>
              <p className="text-sm text-gray-400">
                {search || filterCat !== "all" || filterRead !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}