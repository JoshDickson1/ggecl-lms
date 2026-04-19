// src/dashboards/admin-dashboard/pages/AdminTransactions.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Search,
  ChevronDown, Download, X, Eye,
  CheckCircle2, XCircle, Clock, RefreshCw,
  TrendingUp, CreditCard, Info, Loader2,
  ShoppingCart, BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardService from "@/services/admin-dashboard.service";
import EnrollmentService from "@/services/enrollment.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxStatus = "completed" | "pending" | "failed" | "processing";

interface Transaction {
  id:        string;
  type:      "enrollment";
  status:    TxStatus;
  amount:    number;
  currency:  "USD";
  from:      string;
  fromEmail: string;
  to:        string;
  course?:   string;
  ref:       string;
  date:      string;
  dateRaw:   number;
  method:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtK(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  completed:  { label: "Completed",  icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50" },
  pending:    { label: "Pending",    icon: Clock,        color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"         },
  failed:     { label: "Failed",     icon: XCircle,      color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"                 },
  processing: { label: "Processing", icon: RefreshCw,    color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50"             },
};

// ─── Build enrollment transactions from enrollment list ───────────────────────

function buildEnrollmentTransactions(enrollments: unknown[]): Transaction[] {
  return enrollments.map((e: any, i) => ({
    id:        e.id ?? `tx-${i}`,
    type:      "enrollment" as const,
    status:    "completed" as TxStatus,
    amount:    e.course?.price ?? 0,
    currency:  "USD",
    from:      e.student?.name ?? e.studentId ?? "Student",
    fromEmail: e.student?.email ?? "",
    to:        "Platform",
    course:    e.course?.title,
    ref:       `ENR-${e.id?.slice(0, 8).toUpperCase() ?? i}`,
    date:      e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    dateRaw:   e.enrolledAt ? new Date(e.enrolledAt).getTime() : 0,
    method:    "card",
  }));
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function TxDetailModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const status = STATUS_CONFIG[tx.status];
  const SIcon  = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden"
      >
        <div className="px-6 py-5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Enrollment</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{fmtUSD(tx.amount)}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 dark:bg-white/[0.08] text-gray-500 hover:bg-white/80 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${status.bg} ${status.color}`}>
              <SIcon className="w-3.5 h-3.5" /> {status.label}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Reference",  value: tx.ref              },
              { label: "Date",       value: tx.date             },
              { label: "Student",    value: tx.from             },
              { label: "Email",      value: tx.fromEmail || "—" },
              { label: "Method",     value: tx.method           },
              ...(tx.course ? [{ label: "Course", value: tx.course }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-xs font-bold text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Receipt
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminTransactions() {
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<TxStatus | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy,       setSortBy]       = useState<"date" | "amount">("date");
  const [sortDir,      setSortDir]      = useState<"desc" | "asc">("desc");
  const [selected,     setSelected]     = useState<Transaction | null>(null);

  // ── Real API data ──────────────────────────────────────────────────────────

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn:  () => AdminDashboardService.getRevenue(),
  });

  const { data: rawEnrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ["admin-all-enrollments"],
    queryFn:  () => EnrollmentService.findAll(),
    staleTime: 1000 * 60 * 2,
  });

  // ── Build transactions from enrollments ────────────────────────────────────

  const allTransactions = useMemo<Transaction[]>(() => {
    const list = Array.isArray(rawEnrollments)
      ? rawEnrollments
      : ((rawEnrollments as any)?.data ?? []);
    return buildEnrollmentTransactions(list as unknown[]);
  }, [rawEnrollments]);

  // ── Summary stats (from real revenue API) ─────────────────────────────────

  const totalRevenue   = revenue?.total           ?? 0;
  const enrollCount    = revenue?.enrollmentCount  ?? 0;
  const avgOrderValue  = revenue?.averageOrderValue ?? 0;
  const pendingCount   = allTransactions.filter(t => t.status === "pending").length;

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...allTransactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.from.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q) ||
        (t.course?.toLowerCase().includes(q)) ||
        t.fromEmail.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "all") result = result.filter(t => t.status === filterStatus);

    if (filterPeriod !== "all") {
      const now  = Date.now();
      const cuts = { today: 86400000, week: 604800000, month: 2592000000 };
      result = result.filter(t => (now - t.dateRaw) <= cuts[filterPeriod]);
    }

    result.sort((a, b) => {
      const val = sortBy === "date" ? b.dateRaw - a.dateRaw : b.amount - a.amount;
      return sortDir === "desc" ? val : -val;
    });

    return result;
  }, [allTransactions, search, filterStatus, filterPeriod, sortBy, sortDir]);

  const hasFilters = filterStatus !== "all" || filterPeriod !== "all" || search.trim() !== "";
  const clearFilters = () => { setSearch(""); setFilterStatus("all"); setFilterPeriod("all"); };
  const isLoading = revLoading || enrollLoading;

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">Platform financial activity — enrollments & revenue</p>
        </div>
        <button className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:text-blue-600 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      {/* Summary stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingUp, color: "emerald",
            value: isLoading ? "—" : fmtK(totalRevenue),
            label: "Total Revenue", sub: "all-time enrollments",
          },
          {
            icon: ShoppingCart, color: "blue",
            value: isLoading ? "—" : enrollCount.toLocaleString(),
            label: "Total Enrollments", sub: "completed purchases",
          },
          {
            icon: BarChart3, color: "violet",
            value: isLoading ? "—" : fmtUSD(avgOrderValue),
            label: "Avg Order Value", sub: "per enrollment",
          },
          {
            icon: Clock, color: "amber",
            value: isLoading ? "—" : String(pendingCount),
            label: "Pending", sub: "awaiting settlement",
          },
        ].map(({ icon: Icon, color, value, label, sub }) => {
          const p: Record<string, string> = {
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_.ic]:bg-emerald-100 dark:[&_.ic]:bg-emerald-900/40 [&_.ic_svg]:text-emerald-600 dark:[&_.ic_svg]:text-emerald-400",
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_.ic]:bg-blue-100 dark:[&_.ic]:bg-blue-900/40 [&_.ic_svg]:text-blue-600 dark:[&_.ic_svg]:text-blue-400",
            violet:  "bg-violet-50/60 dark:bg-violet-950/20 border-violet-100/60 dark:border-violet-900/20 [&_.ic]:bg-violet-100 dark:[&_.ic]:bg-violet-900/40 [&_.ic_svg]:text-violet-600 dark:[&_.ic_svg]:text-violet-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_.ic]:bg-amber-100 dark:[&_.ic]:bg-amber-900/40 [&_.ic_svg]:text-amber-600 dark:[&_.ic_svg]:text-amber-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${p[color]}`}>
              <div className="ic w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Icon className="w-4 h-4" />}
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              {sub && <p className="text-[9px] font-bold mt-0.5 text-gray-400">{sub}</p>}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Backend callout — payouts/refunds/withdrawals */}
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
          <p className="font-bold">Backend should provide for full transaction history:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-600 dark:text-amber-500">
            <li><code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">GET /dashboard/admin/transactions</code> — paginated list with type, status, amount, participant, method</li>
            <li><code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">PATCH /dashboard/admin/transactions/:id/approve</code> — approve pending payouts</li>
            <li>Fields needed: payout records, refunds, withdrawals, payment method, Paystack/Stripe reference</li>
          </ul>
          <p className="text-amber-600 dark:text-amber-500">Currently showing enrollment records from <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 rounded">GET /enrollments</code> as a proxy.</p>
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4">

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ref, course…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
          </div>

          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TxStatus | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value as "all" | "today" | "week" | "month")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={`${sortBy}-${sortDir}`}
              onChange={e => { const [s, d] = e.target.value.split("-"); setSortBy(s as "date" | "amount"); setSortDir(d as "desc" | "asc"); }}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> of {allTransactions.length} transactions
        </p>
      </motion.div>

      {/* Transaction table */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">

        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06] text-[10px] font-black text-gray-400 uppercase tracking-wider">
          <span>Student</span>
          <span>Reference</span>
          <span>Amount</span>
          <span>Status</span>
          <span className="w-8" />
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm text-gray-400">Loading transactions…</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((tx, i) => {
                  const status = STATUS_CONFIG[tx.status];
                  const SIcon  = status.icon;
                  return (
                    <motion.div key={tx.id} layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => setSelected(tx)}
                    >
                      {/* Student */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{tx.from}</p>
                          <p className="text-[10px] text-gray-400 truncate">{tx.course ?? "—"}</p>
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{tx.ref}</p>
                        <p className="text-[10px] text-gray-400">{tx.date}</p>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{fmtUSD(tx.amount)}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{tx.method}</p>
                      </div>

                      {/* Status */}
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border w-fit ${status.bg} ${status.color}`}>
                        <SIcon className="w-3 h-3" /> {status.label}
                      </span>

                      {/* View */}
                      <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">No transactions found</p>
                  <p className="text-xs text-gray-400">
                    {hasFilters ? "Try adjusting your filters" : "No enrollments have been made yet"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Revenue summary footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} shown
            </p>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Subtotal:{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {fmtUSD(filtered.reduce((a, t) => a + t.amount, 0))}
                </span>
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <TxDetailModal tx={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
