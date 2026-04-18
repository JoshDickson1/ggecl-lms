// src/dashboards/commons/PreviewAdmin.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Mail, Calendar, Shield,
  Users, DollarSign, BookOpen, Ticket, CheckCircle2,
  ShieldCheck, Clock, TrendingUp, Zap, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/services/user.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  phone?: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/20",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/15 dark:text-amber-400 dark:border-amber-800/30",
};

const PERMISSION_STYLES: Record<string, string> = {
  "Full Access": "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/15 dark:text-rose-400 dark:border-rose-900/20",
  "Read Only":   "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  "Moderator":   "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/15 dark:text-violet-400 dark:border-violet-900/20",
};

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay, ease: "easeOut" }}>
    {children}
  </motion.div>
);

const ACTIVITY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  approve:  { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  ticket:   { icon: Ticket,       color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-100 dark:bg-amber-900/40"    },
  publish:  { icon: BookOpen,     color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-100 dark:bg-blue-900/40"      },
  payout:   { icon: DollarSign,   color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-100 dark:bg-violet-900/40"  },
  settings: { icon: Zap,          color: "text-gray-600 dark:text-gray-400",      bg: "bg-gray-100 dark:bg-gray-700/30"      },
  enroll:   { icon: Users,        color: "text-cyan-600 dark:text-cyan-400",      bg: "bg-cyan-100 dark:bg-cyan-900/40"      },
  delete:   { icon: Shield,       color: "text-rose-600 dark:text-rose-400",      bg: "bg-rose-100 dark:bg-rose-900/40"      },
  create:   { icon: TrendingUp,   color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-100 dark:bg-indigo-900/40"  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PreviewAdmin() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"about" | "activity" | "permissions">("about");

  const { data: apiUser, isLoading, isError } = useQuery<ApiUser>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await UserService.findOne(id!) as ApiUser;
      return res;
    },
    enabled: !!id,
  });

  const joinedDate = apiUser?.createdAt
    ? new Date(apiUser.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  const admin = {
    name:            apiUser?.name ?? "Admin",
    avatar:          initials(apiUser?.name ?? "A"),
    avatarBg:        "bg-gradient-to-br from-rose-500 to-pink-600",
    title:           "Administrator",
    bio:             apiUser?.bio ?? "No bio provided.",
    email:           apiUser?.email ?? "",
    location:        "-",
    department:      "Administration",
    joined:          joinedDate,
    status:          "Active" as const,
    permissionLevel: "Read Only",
    isSuperAdmin:    false,
    badges:          [] as string[],
    usersManaged:    0,
    ticketsResolved: 0,
    revenueOverseen: "$0",
    coursesPublished: 0,
    recentActivity:  [] as { type: string; action: string; target: string; time: string }[],
    permissionGroups: [
      {
        group: "User Management",
        permissions: [
          { label: "View users",   granted: true  },
          { label: "Edit users",   granted: false },
          { label: "Delete users", granted: false },
        ],
      },
      {
        group: "Course Management",
        permissions: [
          { label: "View courses",   granted: true  },
          { label: "Publish courses",granted: false },
          { label: "Delete courses", granted: false },
        ],
      },
    ],
  };

  const TABS = [
    { id: "about",       label: "About"       },
    { id: "activity",    label: "Activity"    },
    { id: "permissions", label: "Permissions" },
  ] as const;

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center py-20 text-gray-400 gap-2">
      <p className="text-sm font-semibold">Failed to load admin profile</p>
      <Link to="/admin/admins" className="text-xs text-blue-500 hover:underline">← Back to Admins</Link>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pb-12">

      {/* Back */}
      <Fade>
        <Link to="/admin/admins" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Admins
        </Link>
      </Fade>

      {/* ── Hero ── */}
      <Fade delay={0.02}>
        <Card>
          <div className="h-32 rounded-t-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle 500px at 80% 50%, rgba(251,113,133,0.3), transparent 70%)" }} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#0f1623] shadow-xl flex-shrink-0">
                {apiUser?.image
                  ? <img src={apiUser.image} alt={admin.name} className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${admin.avatarBg}`}>{admin.avatar}</div>
                }
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${STATUS_STYLES[admin.status]}`}>{admin.status}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${PERMISSION_STYLES[admin.permissionLevel] ?? ""}`}>
                    {admin.isSuperAdmin && <ShieldCheck className="w-3 h-3" />}
                    {admin.permissionLevel}
                  </span>
                  {admin.badges.map(b => (
                    <span key={b} className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">{b}</span>
                  ))}
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{admin.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{admin.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              {admin.location !== "-" && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" />{admin.location}</span>}
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-rose-500" />{admin.email}</span>
              {admin.joined && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-rose-500" />Joined {admin.joined}</span>}
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-rose-500" />{admin.department}</span>
            </div>
          </div>
        </Card>
      </Fade>

      {/* ── Stats ── */}
      <Fade delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users,      value: fmt(admin.usersManaged),        label: "Users Managed",      color: "from-blue-500 to-blue-600"      },
            { icon: Ticket,     value: String(admin.ticketsResolved),  label: "Tickets Resolved",   color: "from-amber-400 to-orange-500"   },
            { icon: DollarSign, value: admin.revenueOverseen,          label: "Revenue Overseen",   color: "from-emerald-500 to-teal-600"   },
            { icon: BookOpen,   value: String(admin.coursesPublished), label: "Courses Published",  color: "from-violet-500 to-purple-600"  },
          ].map(({ icon: Ic, value, label, color }) => (
            <Card key={label} className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Ic className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* ── Tabs ── */}
      <Fade delay={0.08}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Fade>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">

        {/* ABOUT */}
        {activeTab === "about" && (
          <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-rose-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">About</h2></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{admin.bio}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div>Department: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.department}</span></div>
                <div>Permission level: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.permissionLevel}</span></div>
                <div>Super admin: <span className="font-semibold text-gray-700 dark:text-gray-300">{admin.isSuperAdmin ? "Yes" : "No"}</span></div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5"><TrendingUp className="w-4 h-4 text-rose-500" /><h2 className="font-black text-base text-gray-900 dark:text-white">Recent Activity</h2></div>
              {admin.recentActivity.length === 0
                ? <p className="text-sm text-gray-400 italic text-center py-6">No recent activity.</p>
                : <div className="space-y-3">
                    {admin.recentActivity.map((a, i) => {
                      const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.settings;
                      const Icon = meta.icon;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{a.action}</p>
                            <p className="text-[10px] text-gray-400 truncate">{a.target}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />{a.time}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
              }
            </Card>
          </motion.div>
        )}

        {/* PERMISSIONS */}
        {activeTab === "permissions" && (
          <motion.div key="permissions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {admin.permissionGroups.map((group, gi) => (
              <motion.div key={group.group} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.07 }}>
                <Card className="p-5">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">{group.group}</p>
                  <div className="space-y-2">
                    {group.permissions.map((p, pi) => (
                      <motion.div key={p.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: gi * 0.07 + pi * 0.04 }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p.label}</span>
                        {p.granted ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />Granted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <ShieldCheck className="w-3.5 h-3.5" />Super Admin only
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
