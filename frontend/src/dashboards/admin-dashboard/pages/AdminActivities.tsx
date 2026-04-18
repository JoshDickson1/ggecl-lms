// src/dashboards/admin-dashboard/pages/AdminActivities.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity, ChevronRight, RefreshCw, Loader2,
  CheckCircle2, BookOpen, DollarSign, Users, Zap, Ticket,
  Clock, Search, Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardService, { type AdminActivityItem } from "@/services/admin-dashboard.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function absTime(d: Date | string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(title: string) {
  return title.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  approve:  { icon: CheckCircle2, color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
  ticket:   { icon: Ticket,       color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"        },
  publish:  { icon: BookOpen,     color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"            },
  payout:   { icon: DollarSign,   color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"    },
  enroll:   { icon: Users,        color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"            },
  settings: { icon: Zap,          color: "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400"           },
};

const LIMITS = [20, 50, 100, 200];

const AVATAR_BG = [
  "bg-blue-500", "bg-violet-500", "bg-rose-500",
  "bg-amber-500", "bg-emerald-500", "bg-cyan-500",
];

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ item, index }: { item: AdminActivityItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { icon: Icon, color } = ICON_MAP.settings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-start gap-4 px-6 py-4 border-b border-gray-50 dark:border-white/[0.04]
        hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 ${AVATAR_BG[index % AVATAR_BG.length]}`}>
        {initials(item.title)}
      </div>

      {/* Icon badge */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{item.message}</p>
      </div>

      {/* Read badge */}
      {!item.isRead && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
      )}

      {/* Time */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {hovered ? absTime(item.createdAt) : relativeTime(item.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminActivities() {
  const [limit, setLimit] = useState(50);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [search, setSearch] = useState("");

  const { data: activities = [], isLoading, isError, refetch, isFetching } = useQuery<AdminActivityItem[]>({
    queryKey: ["admin-activities", limit, onlyUnread],
    queryFn: () => AdminDashboardService.getRecentActivities(limit, onlyUnread),
    refetchInterval: 60_000,
  });

  const filtered = search.trim()
    ? activities.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase())
      )
    : activities;

  const unreadCount = activities.filter(a => !a.isRead).length;

  return (
    <div className="max-w-[900px] mx-auto pb-12 space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Admin · Platform</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Activity Feed</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time platform events and admin actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Analytics <ChevronRight className="w-4 h-4" />
            </Link>
            <button onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md disabled:opacity-70">
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search activities…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
              bg-white dark:bg-[#0f1623]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-800 dark:text-white placeholder:text-gray-400
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Unread toggle */}
        <button onClick={() => setOnlyUnread(p => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            onlyUnread
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
          }`}>
          <Filter className="w-4 h-4" />
          Unread {unreadCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{unreadCount}</span>}
        </button>

        {/* Limit selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
          {LIMITS.map(l => (
            <button key={l} onClick={() => setLimit(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                limit === l
                  ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}>
              {l}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex items-center gap-6 px-5 py-3 rounded-2xl bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07] shadow-sm text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Showing {filtered.length} of {activities.length} events</span>
        {unreadCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            {unreadCount} unread
          </span>
        )}
        <span className="ml-auto text-[11px]">Auto-refreshes every 60s</span>
      </motion.div>

      {/* Feed */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]
          shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading activities…</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <p className="text-sm font-semibold">Failed to load activities</p>
            <button onClick={() => refetch()}
              className="text-xs text-blue-500 hover:underline">Try again</button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Activity className="w-8 h-8 opacity-30" />
            <p className="text-sm font-semibold">{search ? "No matching activities" : "No activity yet"}</p>
          </div>
        )}

        {!isLoading && !isError && filtered.map((item, i) => (
          <ActivityRow key={item.id} item={item} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
