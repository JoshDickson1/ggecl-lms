// src/dashboards/admin-dashboard/pages/AdminProfile.tsx
import { motion } from "framer-motion";
import {
  Users, BookOpen, Award, Mail,
  Calendar,
  Shield, ShieldCheck, TrendingUp,
  Ticket, DollarSign, CheckCircle2, Clock, Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardService from "@/services/admin-dashboard.service";
import ActivityService, { type ActivityItem } from "@/services/activity.service";
import { useDashboardUser, getInitials } from "@/hooks/useDashboardUser";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white dark:bg-[#0f1623]
      border border-gray-100 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function StatTile({ icon: Icon, value, label, sub }: {
  icon: React.ElementType; value: string; label: string; sub?: string;
}) {
  return (
    <div className="flex flex-col items-center py-5 px-3 rounded-2xl
      bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20
      hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[9px] text-blue-500 font-bold mt-0.5">{sub}</p>}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

function SectionHead({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
        flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-base font-black text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    approve:  { icon: CheckCircle2, color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    ticket:   { icon: Ticket,       color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"        },
    publish:  { icon: BookOpen,     color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"            },
    payout:   { icon: DollarSign,   color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"    },
    settings: { icon: Zap,          color: "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400"           },
    enroll:   { icon: Users,        color: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"            },
  };
  const { icon: Icon, color } = map[type] ?? map.settings;
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
}

function relTime(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminProfile() {
  const { user } = useDashboardUser();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => AdminDashboardService.getSummary(),
  });

  const { data: activitiesFeed, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities-feed", 8],
    queryFn: () => ActivityService.getFeed({ limit: 8 }),
  });
  const activities: ActivityItem[] = activitiesFeed?.data ?? [];

  const fullName  = user ? `${user.firstName} ${user.lastName}`.trim() : "Admin";
  const email     = user?.email ?? "";
  const avatarUrl = user?.avatarUrl ?? null;
  const isSuperAdmin = !!user?.isSuperAdmin;

  const ad = {
    name:         fullName,
    title:        `Platform ${isSuperAdmin ? "Super Admin" : "Administrator"} · GGECL`,
    email,
    isSuperAdmin,
    badges:       isSuperAdmin ? ["Super Admin"] : ["Admin"],
    usersManaged:    (summary?.students?.total ?? 0) + (summary?.instructors?.total ?? 0),
    ticketsResolved: 0,
    revenueOverseen: `$${((summary?.revenue?.total ?? 0) / 1000).toFixed(1)}k`,
    coursesPublished: summary?.courses?.published ?? 0,
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <Fade>
        <Card>
          {/* Banner */}
          <div className="h-32 rounded-t-[22px] bg-gradient-to-br mb-20 from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(circle 500px at 90% 50%, rgba(99,102,241,0.3), transparent 70%)" }} />
            
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[20px] overflow-hidden
                  ring-4 ring-white dark:ring-[#0f1623]
                  shadow-[0_8px_32px_rgba(59,130,246,0.25)]">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-blue-600">
                        {getInitials(user)}
                      </div>
                  }
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400
                  border-[3px] border-white dark:border-[#0f1623]
                  shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {ad.isSuperAdmin && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold
                      bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400
                      border border-amber-200 dark:border-amber-800/50">
                      <ShieldCheck className="w-3 h-3" /> Super Admin
                    </span>
                  )}
                  {ad.badges.map(b => (
                    <span key={b} className="px-2.5 py-1 rounded-lg text-[10px] font-bold
                      bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300
                      border border-blue-200 dark:border-blue-800/50">
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{ad.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ad.title}</p>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mb-5">
              {ad.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />{ad.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />Platform Operations
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />Admin Account
              </span>
            </div>

            
          </div>
        </Card>
      </Fade>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center py-5 px-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-blue-200 dark:bg-blue-900/40 mb-2" />
                  <div className="h-6 w-12 bg-blue-200 dark:bg-blue-900/40 rounded-lg mb-1" />
                  <div className="h-3 w-20 bg-blue-200 dark:bg-blue-900/40 rounded-lg" />
                </div>
              ))
            : <>
                <StatTile icon={Users}      value={fmt(ad.usersManaged)}      label="Users Managed"      sub="on platform"    />
                <StatTile icon={Ticket}     value={String(ad.ticketsResolved)} label="Tickets Resolved"   sub="this quarter"   />
                <StatTile icon={DollarSign} value={ad.revenueOverseen}         label="Revenue Overseen"   sub="total platform" />
                <StatTile icon={BookOpen}   value={String(ad.coursesPublished)} label="Courses Published" sub="live on GGECL"  />
              </>
          }
        </div>
      </Fade>

      {/* ── Activity ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="flex flex-col gap-3">
            <Fade delay={0.06}>
              <Card className="p-6">
                <SectionHead icon={TrendingUp} title="Recent Activity" />
                <div className="flex flex-col gap-2">
                  {activitiesLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] animate-pulse">
                          <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/[0.08] flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-40 bg-gray-200 dark:bg-white/[0.08] rounded-lg" />
                            <div className="h-3 w-56 bg-gray-200 dark:bg-white/[0.08] rounded-lg" />
                          </div>
                          <div className="h-3 w-12 bg-gray-200 dark:bg-white/[0.08] rounded-lg flex-shrink-0" />
                        </div>
                      ))
                    : activities.length === 0
                    ? <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
                    : activities.map((a, i) => (
                        <motion.div key={a.id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.04 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                          <ActivityIcon type={a.type ?? "settings"} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{a.title}</p>
                            <p className="text-[10px] text-gray-400 truncate">{a.message}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{relTime(a.createdAt)}
                          </span>
                        </motion.div>
                      ))
                  }
                </div>
              </Card>
            </Fade>
          </div>

          {/* Sidebar: recognition only */}
          <div className="flex flex-col gap-5">
            <Fade delay={0.1}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">Recognition</p>
                <div className="flex flex-wrap gap-2">
                  {ad.badges.map(b => (
                    <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                      bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40
                      border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300">
                      <Award className="w-3 h-3" />{b}
                    </span>
                  ))}
                </div>
              </Card>
            </Fade>


          </div>
        </div>
    </div>
  );
}