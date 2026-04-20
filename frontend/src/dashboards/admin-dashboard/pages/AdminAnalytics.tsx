// src/dashboards/admin-dashboard/pages/AdminAnalytics.tsx
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, DollarSign, BookOpen, GraduationCap,
  ArrowUpRight, ArrowDownRight, Download,
  BarChart2, Activity, Target, Repeat2, UserCheck, ChevronRight,
  Info, Loader2, ShoppingCart, TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardService, { type SignupDaySeries } from "@/services/admin-dashboard.service";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Types / helpers ──────────────────────────────────────────────────────────

type Range = "7d" | "30d" | "90d" | "1y";

function getRangeDates(range: Range): { from: string; to: string } {
  const to   = new Date();
  const from = new Date();
  const days = ({ "7d": 7, "30d": 30, "90d": 90, "1y": 365 } as const)[range];
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { from: fmt(from), to: fmt(to) };
}

function aggregateSignupSeries(
  series: SignupDaySeries[],
  range: Range,
  total: number,
): { label: string; students: number }[] {
  if (series.length > 0) {
    if (range === "7d") {
      return series.slice(-7).map(s => ({
        label: new Date(s.date).toLocaleDateString("en-US", { weekday: "short" }),
        students: s.count,
      }));
    }

    if (range === "30d") {
      const buckets = [0, 0, 0, 0];
      series.forEach(s => {
        const daysAgo = Math.floor((Date.now() - new Date(s.date).getTime()) / 86_400_000);
        const idx = Math.min(3, Math.floor(daysAgo / 7));
        buckets[3 - idx] += s.count;
      });
      return buckets.map((v, i) => ({ label: `W${i + 1}`, students: v }));
    }

    // 90d / 1y → aggregate by month
    const monthMap = new Map<string, number>();
    series.forEach(s => {
      const key = new Date(s.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthMap.set(key, (monthMap.get(key) ?? 0) + s.count);
    });
    return Array.from(monthMap.entries()).map(([label, students]) => ({ label, students }));
  }

  // No series from backend — fall back to a single bar showing the period total
  if (total > 0) {
    const labels: Record<Range, string> = { "7d": "This Week", "30d": "This Month", "90d": "Last 90d", "1y": "This Year" };
    return [{ label: labels[range], students: total }];
  }

  return [];
}

// ─── Mock data kept for charts without a backend series endpoint ──────────────

const COURSE_COMPLETION = [
  { name: "React & TS",   completed: 87, dropped: 13 },
  { name: "Node.js",      completed: 91, dropped: 9  },
  { name: "Data Science", completed: 74, dropped: 26 },
  { name: "Marketing",    completed: 82, dropped: 18 },
  { name: "TypeScript",   completed: 94, dropped: 6  },
  { name: "UI/UX Design", completed: 78, dropped: 22 },
];

const ENROLLMENT_BY_CATEGORY = [
  { name: "Engineering",  value: 8200, color: "#3b82f6" },
  { name: "Data Science", value: 2400, color: "#8b5cf6" },
  { name: "Marketing",    value: 1900, color: "#f59e0b" },
  { name: "Design",       value: 1400, color: "#10b981" },
  { name: "Other",        value:  820, color: "#94a3b8" },
];

const COHORT_RETENTION = [
  { cohort: "Jan '25", w1: 100, w2: 84, w4: 72, w8: 61, w12: 54 },
  { cohort: "Feb '25", w1: 100, w2: 88, w4: 76, w8: 64, w12: 58 },
  { cohort: "Mar '25", w1: 100, w2: 86, w4: 74, w8: 62, w12: null },
];

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: "easeOut" }} className={className}>
    {children}
  </motion.div>
);

function RangeToggle({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
      {(["7d", "30d", "90d", "1y"] as Range[]).map(r => (
        <button key={r} onClick={() => onChange(r)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
            value === r
              ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}>{r}</button>
      ))}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub, children }: {
  icon: React.ElementType; title: string; sub?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-black text-base text-gray-900 dark:text-white leading-tight">{title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function BackendCallout({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
      <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-amber-700 dark:text-amber-400">{text}</p>
    </div>
  );
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function SignupTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
      <p className="text-blue-500">{payload[0]?.value} signups</p>
    </div>
  );
}

function CompletionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
      <p className="text-emerald-500">{payload[0]?.value}% completed</p>
      <p className="text-rose-400">{payload[1]?.value}% dropped</p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const total = ENROLLMENT_BY_CATEGORY.reduce((a, d) => a + d.value, 0);
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{name}</p>
      <p className="text-gray-500 mt-0.5">{value.toLocaleString()} · {((value / total) * 100).toFixed(1)}%</p>
    </div>
  );
}

// ─── Cohort Retention Table ───────────────────────────────────────────────────

function RetentionCell({ value }: { value: number | null }) {
  if (value === null) {
    return <td className="px-4 py-3 text-center"><span className="text-[11px] text-gray-300 dark:text-gray-600">—</span></td>;
  }
  const bg =
    value >= 90 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
    : value >= 70 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    : value >= 50 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
    : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300";
  return (
    <td className="px-4 py-3 text-center">
      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${bg}`}>{value}%</span>
    </td>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [revenueRange, setRevenueRange] = useState<Range>("30d");
  const [signupRange,  setSignupRange]  = useState<Range>("30d");

  // ── Real API: summary (KPIs) ───────────────────────────────────────────────
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn:  () => AdminDashboardService.getSummary(),
  });

  // ── Real API: top enrollments ──────────────────────────────────────────────
  const { data: topEnrollments = [] } = useQuery({
    queryKey: ["admin-top-enrollments"],
    queryFn:  () => AdminDashboardService.getTopEnrollments(5),
  });

  // ── Real API: revenue for selected range ───────────────────────────────────
  const revDates = useMemo(() => getRangeDates(revenueRange), [revenueRange]);
  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ["admin-revenue", revenueRange],
    queryFn:  () => AdminDashboardService.getRevenue(revDates),
    staleTime: 1000 * 60 * 5,
  });

  // ── Real API: completion rate (dedicated endpoint) ────────────────────────
  const { data: completionRateData } = useQuery({
    queryKey: ["admin-completion-rate"],
    queryFn: () => AdminDashboardService.getCompletionRate(),
    staleTime: 1000 * 60 * 10,
  });

  // ── Real API: signups for selected range ───────────────────────────────────
  const signDates = useMemo(() => getRangeDates(signupRange), [signupRange]);
  const { data: signupData, isLoading: signLoading } = useQuery({
    queryKey: ["admin-signups", signupRange],
    queryFn:  () => AdminDashboardService.getSignups(signDates),
    staleTime: 1000 * 60 * 5,
  });

  // ── Derived chart data ─────────────────────────────────────────────────────
  const signChartData = useMemo(
    () => aggregateSignupSeries(signupData?.series ?? [], signupRange, signupData?.total ?? 0),
    [signupData, signupRange]
  );

  const pieTotal = ENROLLMENT_BY_CATEGORY.reduce((a, d) => a + d.value, 0);

  // ── KPI cards ──────────────────────────────────────────────────────────────
  const kpiSummary = [
    { label: "Total Revenue",   value: summaryLoading ? "…" : `$${((summary?.revenue?.total ?? 0) / 1000).toFixed(1)}k`,                           sub: "all time",                                icon: DollarSign, color: "from-emerald-500 to-teal-600",  trendUp: true  },
    { label: "New Signups",     value: summaryLoading ? "…" : (summary?.signups?.total ?? 0).toLocaleString(),                                       sub: "all time",                                icon: UserCheck,  color: "from-blue-500 to-blue-600",     trendUp: true  },
    { label: "Avg Completion",  value: completionRateData ? `${Number(completionRateData.rate).toFixed(1)}%` : summaryLoading ? "…" : `${Number(summary?.completionRate?.rate ?? 0).toFixed(1)}%`, sub: "platform avg", icon: Target, color: "from-violet-500 to-purple-600", trendUp: true },
    { label: "Retention (W4)",  value: "74%",                                                                                                        sub: "mock — backend needed",                   icon: Repeat2,    color: "from-amber-400 to-orange-500",  trendUp: true  },
    { label: "Active Students", value: summaryLoading ? "…" : (summary?.students?.active ?? 0).toLocaleString(),                                     sub: "as of today",                             icon: Activity,   color: "from-cyan-500 to-sky-600",      trendUp: true  },
    { label: "Active Courses",  value: summaryLoading ? "…" : (summary?.courses?.published ?? 0).toString(),                                         sub: `${summary?.courses?.draft ?? 0} in draft`, icon: BookOpen, color: "from-rose-500 to-pink-600",     trendUp: true  },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-5 pb-12">

      {/* ── Page header ── */}
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Admin · Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Platform Analytics</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
            <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-md">
              <BarChart2 className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </div>
      </Fade>

      {/* ── KPI grid ── */}
      <Fade delay={0.04}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiSummary.map(({ label, value, sub, icon: Ic, color, trendUp }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.04 }}>
              <Card className="p-4">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2.5`}>
                  <Ic className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{label}</p>
                <p className={`flex items-center gap-0.5 text-[10px] font-bold mt-1.5 ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
                  {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{sub}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Fade>

      {/* ── Revenue (real totals) + Signups (real chart) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue — real totals, no time series yet */}
        <Fade delay={0.1}>
          <Card className="p-6 flex flex-col">
            <SectionHeader icon={DollarSign} title="Revenue" sub="Gross revenue for selected period">
              <RangeToggle value={revenueRange} onChange={setRevenueRange} />
            </SectionHeader>

            {revLoading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp,  label: "Total Revenue",       value: `$${((revenueData?.total ?? 0) / 1000).toFixed(1)}k`,    color: "from-emerald-500 to-teal-600"  },
                  { icon: ShoppingCart, label: "Enrollments",         value: (revenueData?.enrollmentCount ?? 0).toLocaleString(),     color: "from-blue-500 to-indigo-600"   },
                  { icon: DollarSign,  label: "Avg Order",            value: `$${(revenueData?.averageOrderValue ?? 0).toFixed(2)}`,  color: "from-violet-500 to-purple-600" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex flex-col items-center py-5 px-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{value}</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            )}

            <BackendCallout text="Backend should provide: GET /dashboard/admin/revenue/series?range=7d|30d|90d|1y — time-series breakdown (daily/weekly revenue points) for the area chart." />
          </Card>
        </Fade>

        {/* Signups — real series data from API */}
        <Fade delay={0.12}>
          <Card className="p-6">
            <SectionHeader icon={Users} title="New Signups" sub="Users joining the platform">
              <RangeToggle value={signupRange} onChange={setSignupRange} />
            </SectionHeader>

            {signLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-3 mb-4">
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {(signupData?.total ?? 0).toLocaleString()}
                  </p>
                  <span className="text-xs font-bold text-blue-500 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> new users
                  </span>
                  {/* Only show breakdown when backend provides non-zero role counts */}
                  {((signupData?.students ?? 0) > 0 || (signupData?.instructors ?? 0) > 0) && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                        {signupData!.students} students
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                        {signupData!.instructors} instructors
                      </span>
                    </div>
                  )}
                </div>

                {signChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    {signChartData.length === 1 ? (
                      // Single-bucket fallback: show as a bar
                      <BarChart data={signChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={48}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<SignupTooltip />} />
                        <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : (
                      // Multi-point: area chart
                      <AreaChart data={signChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<SignupTooltip />} />
                        <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2.5}
                          fill="url(#signupGrad)"
                          dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center">
                    <p className="text-sm text-gray-400">No signup data for this period</p>
                  </div>
                )}

                {!(signupData?.students) && !(signupData?.instructors) && (
                  <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Backend doesn't return per-role breakdown in signups series — showing combined total.
                  </p>
                )}
              </>
            )}
          </Card>
        </Fade>
      </div>

      {/* ── Completion + Enrollment breakdown (mock + callouts) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">

        <Fade delay={0.14}>
          <Card className="p-6">
            <SectionHeader icon={Target} title="Course Completion" sub="Completed vs dropped per course" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={COURSE_COMPLETION} layout="vertical"
                margin={{ top: 0, right: 16, left: 4, bottom: 0 }} barSize={14}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CompletionTooltip />} />
                <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="dropped"   fill="#f43f5e" radius={[0, 4, 4, 0]} stackId="a" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Completed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 opacity-70 inline-block" />Dropped</span>
            </div>
            <BackendCallout text="Backend should provide: GET /dashboard/admin/completion-by-course — completion and drop rates per course." />
          </Card>
        </Fade>

        <Fade delay={0.16}>
          <Card className="p-6">
            <SectionHeader icon={BookOpen} title="Enrollments by Category" sub={`${pieTotal.toLocaleString()} total`} />
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ENROLLMENT_BY_CATEGORY} cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                  dataKey="value" paddingAngle={3}>
                  {ENROLLMENT_BY_CATEGORY.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-2">
              {ENROLLMENT_BY_CATEGORY.map((d) => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{d.name}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{d.value.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 w-10 text-right">{((d.value / pieTotal) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <BackendCallout text="Backend should provide: GET /dashboard/admin/enrollments-by-category — enrollment counts grouped by course category/tag." />
          </Card>
        </Fade>
      </div>

      {/* ── Cohort Retention Table (mock + callout) ── */}
      <Fade delay={0.18}>
        <Card className="p-6">
          <SectionHeader icon={Repeat2} title="Cohort Retention"
            sub="% of students still active at each week milestone" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cohort</th>
                  {["Week 1", "Week 2", "Week 4", "Week 8", "Week 12"].map(w => (
                    <th key={w} className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {COHORT_RETENTION.map((row, i) => (
                  <motion.tr key={row.cohort}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.06 }}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{row.cohort}</span>
                    </td>
                    <RetentionCell value={row.w1} />
                    <RetentionCell value={row.w2} />
                    <RetentionCell value={row.w4} />
                    <RetentionCell value={row.w8} />
                    <RetentionCell value={row.w12} />
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100 dark:border-white/[0.06]">
                  <td className="px-4 py-3 text-xs font-bold text-gray-400">Avg</td>
                  {[100, 86, 74, 62, 56].map((avg, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{avg}%</span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30 inline-block" />≥90%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 inline-block" />70–89%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 inline-block" />50–69%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-900/30 inline-block" />&lt;50%</span>
          </div>
          <BackendCallout text="Backend should provide: GET /dashboard/admin/cohort-retention?cohorts[]=2025-01 — weekly retention rates per student cohort (signup month)." />
        </Card>
      </Fade>

      {/* ── Top Courses Table (real data) ── */}
      <Fade delay={0.2}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-black text-base text-gray-900 dark:text-white">Top Performing Courses</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ranked by enrollment · all time</p>
              </div>
            </div>
            <Link to="/admin/courses"
              className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
              All courses <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {["Course", "Students"].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${h === "Course" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {topEnrollments.map((c, i) => (
                  <motion.tr key={c.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 + i * 0.05 }}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-300 dark:text-gray-600 w-4">{i + 1}</span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{c.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{c.enrollmentCount.toLocaleString()}</span>
                    </td>
                  </motion.tr>
                ))}
                {topEnrollments.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-xs text-gray-400">No course data yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Fade>

      {/* ── Activities link ── */}
      <Fade delay={0.22}>
        <Link to="/admin/activities"
          className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 transition-all shadow-lg group">
          <div>
            <h3 className="text-base font-black text-white">Platform Activity Feed</h3>
            <p className="text-xs text-blue-200 mt-0.5">View all real-time platform events and admin actions</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold group-hover:bg-white/30 transition-all">
            <Activity className="w-4 h-4" /> View all <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </Fade>
    </div>
  );
}
