// src/dashboards/student-dashboard/pages/StudentAllNotifications.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell, BookOpen, Award, CheckCircle2, Trash2,
  Search, ChevronDown, MessageSquare, PlayCircle,
  Tag, Zap, Check, GraduationCap,
} from "lucide-react";

type SNotifType = "lesson" | "certificate" | "message" | "assignment" | "promo" | "system" | "achievement";

interface SNotification {
  id: string;
  type: SNotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  cta?: { label: string; to: string };
}

const STUDENT_NOTIFS: SNotification[] = [
  { id: "s1", type: "lesson",      title: "New lecture added: React Query v5",     body: "Sarah Mitchell added a new lecture to 'React & TypeScript Bootcamp' — Lesson 47: React Query v5 Deep Dive.",    time: "20m ago", read: false, cta: { label: "Watch now",   to: "/courses/dev-001"      } },
  { id: "s2", type: "assignment",  title: "Assignment feedback received",           body: "Your submission for Project 3: E-commerce App has been reviewed. Grade: A (92/100). Well done!",               time: "2h ago",  read: false, cta: { label: "View grade",  to: "/student/courses"      } },
  { id: "s3", type: "certificate", title: "Certificate ready! 🎓",                 body: "Congratulations! Your certificate for 'Digital Marketing Masterclass' is ready to download and share.",          time: "1d ago",  read: false, cta: { label: "Download",    to: "/student/certificates" } },
  { id: "s4", type: "promo",       title: "Flash sale: 90% off this weekend!",     body: "Courses you've wishlisted are on sale. 'Node.js Masterclass' is now just ₦1,499 — offer ends Sunday.",          time: "2d ago",  read: true  },
  { id: "s5", type: "message",     title: "Reply from instructor Sarah M.",         body: "Sarah replied to your question on Lecture 14: 'useLayoutEffect fires synchronous after DOM mutations, while useEffect is asynchronous.'", time: "2d ago",  read: true  },
  { id: "s6", type: "achievement", title: "You hit a 14-day learning streak! 🔥",  body: "Amazing! You've been learning every day for 14 days. Keep going — your next badge unlocks at 30 days.",         time: "3d ago",  read: true  },
  { id: "s7", type: "lesson",      title: "Live session tomorrow at 7PM WAT",       body: "Sarah Mitchell is hosting a live Q&A session for React & TypeScript Bootcamp students tomorrow at 7PM.",      time: "3d ago",  read: true,  cta: { label: "RSVP",        to: "/student/courses"      } },
  { id: "s8", type: "system",      title: "Platform maintenance notice",            body: "Scheduled maintenance on Sunday 3AM–5AM WAT. Video playback may be briefly unavailable.",                       time: "4d ago",  read: true  },
];

function SNotifIcon({ type }: { type: SNotifType }) {
  const map: Record<SNotifType, { icon: React.ElementType; color: string }> = {
    lesson:      { icon: PlayCircle,    color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"             },
    certificate: { icon: GraduationCap, color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    message:     { icon: MessageSquare, color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"     },
    assignment:  { icon: BookOpen,      color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"          },
    promo:       { icon: Tag,           color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"              },
    system:      { icon: Zap,           color: "bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400"             },
    achievement: { icon: Award,         color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"              },
  };
  const { icon: Icon, color } = map[type];
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

const TYPE_FILTERS: { value: SNotifType | "all"; label: string }[] = [
  { value: "all",         label: "All"          },
  { value: "lesson",      label: "Lessons"      },
  { value: "assignment",  label: "Assignments"  },
  { value: "certificate", label: "Certificates" },
  { value: "message",     label: "Messages"     },
  { value: "achievement", label: "Achievements" },
  { value: "promo",       label: "Offers"       },
  { value: "system",      label: "System"       },
];

export default function StudentAllNotifications() {
  const [notifs, setNotifs] = useState<SNotification[]>(STUDENT_NOTIFS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<SNotifType | "all">("all");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.body.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && n.type !== filterType) return false;
    if (filterRead === "unread" && n.read) return false;
    if (filterRead === "read" && !n.read) return false;
    return true;
  });

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifs(p => p.filter(n => n.id !== id));

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
          Your course updates, messages, achievements, and promotions
        </p>
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
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
        </div>
        <div className="relative">
          <select value={filterRead} onChange={e => setFilterRead(e.target.value as "all" | "unread" | "read")}
            className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
              bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
              text-gray-700 dark:text-gray-300 outline-none focus:border-blue-400 cursor-pointer">
            <option value="all">All status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
              border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all whitespace-nowrap">
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
                ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(6,182,212,0.35)]"
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
            filtered.map((n, i) => (
              <motion.div key={n.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.24, delay: i * 0.03 }}
                className={`flex items-start gap-4 p-4 rounded-[18px] border transition-all group
                  ${n.read
                    ? "bg-white dark:bg-[#0f1623] border-gray-100 dark:border-white/[0.07]"
                    : "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30"
                  }`}>
                <SNotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-snug ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                      {n.title}
                      {!n.read && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle" />}
                    </p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  {n.cta && (
                    <Link to={n.cta.to}
                      className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      {n.cta.label} →
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="Mark as read"
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                        bg-blue-50 dark:bg-blue-950/30 text-blue-500 hover:bg-blue-100 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} title="Delete"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                      bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors">
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
    </div>
  );
}