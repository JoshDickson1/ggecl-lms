import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Star, Users, BookOpen, DollarSign,
  CheckCircle2, Trash2, Search, ChevronDown,
  MessageSquare, Award, Check, Zap,
} from "lucide-react";

type INotifType = "review" | "enrollment" | "payout" | "message" | "course" | "system" | "achievement";

interface INotification {
  id: string;
  type: INotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INSTRUCTOR_NOTIFS: INotification[] = [
  { id: "i1", type: "enrollment",  title: "New student enrolled",              body: "Fatou Diallo enrolled in your 'React & TypeScript Bootcamp'. You now have 54,201 students.",  time: "5m ago",  read: false },
  { id: "i2", type: "review",      title: "New ★★★★★ review",                  body: "Olusegun A. left a 5-star review: \"Best structured course I've ever taken. Worth every penny.\"",    time: "1h ago",  read: false },
  { id: "i3", type: "payout",      title: "Payout processed — ₦142,000",       body: "Your monthly payout of ₦142,000 has been successfully processed and sent to your bank account.",   time: "3h ago",  read: false },
  { id: "i4", type: "message",     title: "Student question on Lecture 14",    body: "Tobias R. asked: 'Can you explain the difference between useEffect and useLayoutEffect in more detail?'", time: "4h ago",  read: true  },
  { id: "i5", type: "course",      title: "Course approved for publishing",    body: "Your course 'Advanced React Patterns' has been reviewed and approved. It is now live on GGECL.",   time: "1d ago",  read: true  },
  { id: "i6", type: "achievement", title: "You earned Top Rated badge! 🏆",    body: "Congratulations! Your average rating of 4.9 and 12,400+ reviews have earned you the Top Rated badge.", time: "2d ago",  read: true  },
  { id: "i7", type: "enrollment",  title: "10 new enrollments today",          body: "Your courses received 10 new enrollments in the last 24 hours. Keep up the great work!",            time: "2d ago",  read: true  },
  { id: "i8", type: "system",      title: "GGECL platform maintenance notice", body: "Scheduled maintenance on Sunday 3AM–5AM WAT. The platform will be briefly unavailable.",           time: "3d ago",  read: true  },
];

function INotifIcon({ type }: { type: INotifType }) {
  const map: Record<INotifType, { icon: React.ElementType; color: string }> = {
    enrollment:  { icon: Users,        color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"           },
    review:      { icon: Star,         color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"       },
    payout:      { icon: DollarSign,   color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"  },
    message:     { icon: MessageSquare,color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"           },
    course:      { icon: BookOpen,     color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"  },
    achievement: { icon: Award,        color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    system:      { icon: Zap,          color: "bg-gray-100 dark:bg-white/[0.07] text-gray-600 dark:text-gray-400"          },
  };
  const { icon: Icon, color } = map[type];
  return (
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

export function InstructorAllNotifications() {
  const [notifs, setNotifs] = useState<INotification[]>(INSTRUCTOR_NOTIFS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<INotifType | "all">("all");
  const [filterRead, setFilterRead] = useState<"all"|"unread"|"read">("all");

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

  const TYPE_FILTERS: { value: INotifType | "all"; label: string }[] = [
    { value: "all",         label: "All"          },
    { value: "enrollment",  label: "Enrollments"  },
    { value: "review",      label: "Reviews"      },
    { value: "payout",      label: "Payouts"      },
    { value: "message",     label: "Messages"     },
    { value: "course",      label: "Courses"      },
    { value: "achievement", label: "Achievements" },
    { value: "system",      label: "System"       },
  ];

  return (
    <div className="max-w-[900px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 text-sm font-bold px-2.5 py-1 rounded-full
              bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300
              border border-indigo-200 dark:border-indigo-800/50">
              {unreadCount} new
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your enrollments, reviews, payouts, and platform updates
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
              outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
        </div>
        <div className="relative">
          <select value={filterRead} onChange={e => setFilterRead(e.target.value as "all"|"unread"|"read")}
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
          <button onClick={markAllRead}
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

      {/* List */}
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
                    : "bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30"
                  }`}>
                <INotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-snug ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                      {n.title}
                      {!n.read && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 align-middle" />}
                    </p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="Mark as read"
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                        bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500
                        hover:bg-indigo-100 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} title="Delete"
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
                {search || filterType !== "all" || filterRead !== "all" ? "Try adjusting your filters" : "You're all caught up!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InstructorAllNotifications;