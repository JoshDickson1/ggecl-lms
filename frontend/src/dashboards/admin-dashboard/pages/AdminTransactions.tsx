// src/dashboards/admin-dashboard/pages/AdminTransactions.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, ArrowUpRight, ArrowDownLeft, Search,
  ChevronDown, Download, X, Eye,
  CheckCircle2, XCircle, Clock, RefreshCw,
  TrendingUp, CreditCard,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TxType    = "enrollment" | "payout" | "refund" | "withdrawal";
type TxStatus  = "completed" | "pending" | "failed" | "processing";

interface Transaction {
  id:        string;
  type:      TxType;
  status:    TxStatus;
  amount:    number;
  currency:  "NGN" | "USD";
  from:      string;
  fromRole:  "student" | "instructor" | "platform";
  fromAvatar:string;
  fromBg:    string;
  to:        string;
  toRole:    "student" | "instructor" | "platform";
  course?:   string;
  ref:       string;
  date:      string;
  dateRaw:   number; // timestamp for sorting
  method:    "card" | "bank_transfer" | "wallet" | "platform";
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const TRANSACTIONS: Transaction[] = [
  { id:"tx-001", type:"enrollment",  status:"completed",  amount:14.99,   currency:"USD", from:"Emeka Okonkwo",    fromRole:"student",    fromAvatar:"EO", fromBg:"bg-cyan-500",   to:"Platform",   toRole:"platform",   course:"React & TypeScript Bootcamp",         ref:"TXN-2024-001", date:"Apr 1, 2024",  dateRaw:1711929600, method:"card"          },
  { id:"tx-002", type:"payout",      status:"completed",  amount:312000,  currency:"NGN", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"Sarah Mitchell",  toRole:"instructor", course:undefined,                             ref:"PAY-2024-088", date:"Mar 31, 2024", dateRaw:1711843200, method:"bank_transfer"  },
  { id:"tx-003", type:"enrollment",  status:"completed",  amount:9.99,    currency:"USD", from:"Fatou Diallo",     fromRole:"student",    fromAvatar:"FD", fromBg:"bg-violet-500", to:"Platform",   toRole:"platform",   course:"Modern Astrology: Birth Charts",       ref:"TXN-2024-003", date:"Mar 30, 2024", dateRaw:1711756800, method:"card"          },
  { id:"tx-004", type:"refund",      status:"completed",  amount:17.99,   currency:"USD", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"Tobias Renz",toRole:"student",    course:"Financial Modelling (FMVA)",           ref:"REF-2024-021", date:"Mar 29, 2024", dateRaw:1711670400, method:"card"          },
  { id:"tx-005", type:"enrollment",  status:"pending",    amount:13.99,   currency:"USD", from:"Adaeze Obi",       fromRole:"student",    fromAvatar:"AO", fromBg:"bg-amber-500",  to:"Platform",   toRole:"platform",   course:"Python for Data Science & ML",        ref:"TXN-2024-005", date:"Mar 29, 2024", dateRaw:1711670400, method:"card"          },
  { id:"tx-006", type:"payout",      status:"processing", amount:185000,  currency:"NGN", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"James Okafor",   toRole:"instructor", course:undefined,                             ref:"PAY-2024-089", date:"Mar 28, 2024", dateRaw:1711584000, method:"bank_transfer"  },
  { id:"tx-007", type:"enrollment",  status:"failed",     amount:11.99,   currency:"USD", from:"Chinwe Eze",       fromRole:"student",    fromAvatar:"CE", fromBg:"bg-rose-500",   to:"Platform",   toRole:"platform",   course:"Digital Marketing Masterclass",       ref:"TXN-2024-007", date:"Mar 28, 2024", dateRaw:1711584000, method:"card"          },
  { id:"tx-008", type:"enrollment",  status:"completed",  amount:15.99,   currency:"USD", from:"Kwame Asante",     fromRole:"student",    fromAvatar:"KA", fromBg:"bg-teal-500",   to:"Platform",   toRole:"platform",   course:"Quantum Mechanics: From Zero",        ref:"TXN-2024-008", date:"Mar 27, 2024", dateRaw:1711497600, method:"card"          },
  { id:"tx-009", type:"payout",      status:"completed",  amount:420000,  currency:"NGN", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"Priya Sharma",   toRole:"instructor", course:undefined,                             ref:"PAY-2024-086", date:"Mar 25, 2024", dateRaw:1711324800, method:"bank_transfer"  },
  { id:"tx-010", type:"refund",      status:"pending",    amount:12.99,   currency:"USD", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"Amara Nwosu",toRole:"student",    course:"Node.js & MongoDB Masterclass",       ref:"REF-2024-022", date:"Mar 24, 2024", dateRaw:1711238400, method:"wallet"        },
  { id:"tx-011", type:"enrollment",  status:"completed",  amount:16.99,   currency:"USD", from:"Nkechi Adamu",     fromRole:"student",    fromAvatar:"NA", fromBg:"bg-indigo-500", to:"Platform",   toRole:"platform",   course:"Project Management Professional",     ref:"TXN-2024-011", date:"Mar 23, 2024", dateRaw:1711152000, method:"card"          },
  { id:"tx-012", type:"withdrawal",  status:"completed",  amount:650000,  currency:"NGN", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"Luca Romano",    toRole:"instructor", course:undefined,                             ref:"WDR-2024-014", date:"Mar 22, 2024", dateRaw:1711065600, method:"bank_transfer"  },
  { id:"tx-013", type:"enrollment",  status:"completed",  amount:10.99,   currency:"USD", from:"Bello Musa",       fromRole:"student",    fromAvatar:"BM", fromBg:"bg-emerald-500",to:"Platform",   toRole:"platform",   course:"Content Marketing & Copywriting",     ref:"TXN-2024-013", date:"Mar 21, 2024", dateRaw:1710979200, method:"card"          },
  { id:"tx-014", type:"enrollment",  status:"processing", amount:9.99,    currency:"USD", from:"Zara Ahmed",       fromRole:"student",    fromAvatar:"ZA", fromBg:"bg-pink-500",   to:"Platform",   toRole:"platform",   course:"Spanish Zero to Conversational",      ref:"TXN-2024-014", date:"Mar 20, 2024", dateRaw:1710892800, method:"card"          },
  { id:"tx-015", type:"payout",      status:"failed",     amount:95000,   currency:"NGN", from:"Platform",         fromRole:"platform",   fromAvatar:"P",  fromBg:"bg-blue-600",   to:"Marcus Thompson",toRole:"instructor", course:undefined,                             ref:"PAY-2024-091", date:"Mar 19, 2024", dateRaw:1710806400, method:"bank_transfer"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtAmount(amount: number, currency: "NGN" | "USD") {
  if (currency === "NGN") return `₦${amount.toLocaleString()}`;
  return `$${amount.toFixed(2)}`;
}

function fmtUSD(amount: number, currency: "NGN" | "USD") {
  // rough NGN→USD for summary only
  return currency === "USD" ? amount : amount / 1500;
}

const TYPE_CONFIG: Record<TxType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  enrollment: { label: "Enrollment",  icon: ArrowUpRight,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/40" },
  payout:     { label: "Payout",      icon: ArrowDownLeft,  color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-100 dark:bg-violet-950/40"   },
  refund:     { label: "Refund",      icon: RefreshCw,      color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-950/40"     },
  withdrawal: { label: "Withdrawal",  icon: ArrowDownLeft,  color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-950/40"       },
};

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  completed:  { label: "Completed",  icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50" },
  pending:    { label: "Pending",    icon: Clock,        color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"         },
  failed:     { label: "Failed",     icon: XCircle,      color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"                 },
  processing: { label: "Processing", icon: RefreshCw,    color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50"             },
};

// ─── Detail modal ─────────────────────────────────────────────────────────────
function TxDetailModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const type   = TYPE_CONFIG[tx.type];
  const status = STATUS_CONFIG[tx.status];
  const TIcon  = type.icon;
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
        className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden"
      >
        {/* Header */}
        <div className={`px-6 py-5 ${type.bg} border-b border-white/20`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${type.bg} flex items-center justify-center`}>
                <TIcon className={`w-5 h-5 ${type.color}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${type.color}`}>{type.label}</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{fmtAmount(tx.amount, tx.currency)}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center
                bg-white/60 dark:bg-white/[0.08] text-gray-500 hover:bg-white/80 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${status.bg} ${status.color}`}>
              <SIcon className="w-3.5 h-3.5" /> {status.label}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Reference",   value: tx.ref              },
              { label: "Date",        value: tx.date             },
              { label: "From",        value: `${tx.from} (${tx.fromRole})`  },
              { label: "To",          value: `${tx.to} (${tx.toRole})`      },
              { label: "Method",      value: tx.method.replace("_"," ")     },
              ...(tx.course ? [{ label: "Course", value: tx.course }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl
                bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-xs font-bold text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-right max-w-[55%] truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {tx.status === "pending" && (
              <button className="flex-1 py-2.5 rounded-xl text-xs font-bold
                bg-blue-600 hover:bg-blue-500 text-white
                shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
                Approve
              </button>
            )}
            {(tx.status === "pending" || tx.status === "failed") && (
              <button className="flex-1 py-2.5 rounded-xl text-xs font-bold
                border border-red-200 dark:border-red-800/50
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                {tx.status === "failed" ? "Retry" : "Reject"}
              </button>
            )}
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold
              border border-gray-200 dark:border-white/[0.08]
              text-gray-600 dark:text-gray-400
              hover:border-blue-200 hover:text-blue-600 transition-all">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminTransactions() {
  const [search,       setSearch]       = useState("");
  const [filterType,   setFilterType]   = useState<TxType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TxStatus | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy,       setSortBy]       = useState<"date" | "amount">("date");
  const [sortDir,      setSortDir]      = useState<"desc" | "asc">("desc");
  const [selected,     setSelected]     = useState<Transaction | null>(null);
//   const [showFilters,  setShowFilters]  = useState(false);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalRevenue = TRANSACTIONS
    .filter(t => t.type === "enrollment" && t.status === "completed")
    .reduce((a, t) => a + fmtUSD(t.amount, t.currency), 0);

  const totalPayouts = TRANSACTIONS
    .filter(t => (t.type === "payout" || t.type === "withdrawal") && t.status === "completed")
    .reduce((a, t) => a + fmtUSD(t.amount, t.currency), 0);

  const pendingCount = TRANSACTIONS.filter(t => t.status === "pending").length;
  const failedCount  = TRANSACTIONS.filter(t => t.status === "failed").length;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...TRANSACTIONS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q) ||
        (t.course?.toLowerCase().includes(q))
      );
    }

    if (filterType   !== "all") result = result.filter(t => t.type   === filterType);
    if (filterStatus !== "all") result = result.filter(t => t.status === filterStatus);

    if (filterPeriod !== "all") {
      const now  = Date.now() / 1000;
      const cuts = { today: 86400, week: 604800, month: 2592000 };
      result = result.filter(t => (now - t.dateRaw) <= cuts[filterPeriod]);
    }

    result.sort((a, b) => {
      const val = sortBy === "date"
        ? b.dateRaw - a.dateRaw
        : fmtUSD(b.amount, b.currency) - fmtUSD(a.amount, a.currency);
      return sortDir === "desc" ? val : -val;
    });

    return result;
  }, [search, filterType, filterStatus, filterPeriod, sortBy, sortDir]);

  const hasFilters = filterType !== "all" || filterStatus !== "all" || filterPeriod !== "all" || search.trim() !== "";

  const clearFilters = () => {
    setSearch(""); setFilterType("all"); setFilterStatus("all"); setFilterPeriod("all");
  };

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            All platform financial activity — enrollments, payouts, refunds
          </p>
        </div>
        <button
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
            border border-gray-200 dark:border-white/[0.08]
            text-gray-600 dark:text-gray-400
            hover:border-blue-200 hover:text-blue-600 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      {/* Summary stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp,  value: `$${totalRevenue.toFixed(0)}`,  label: "Total Revenue",    sub: "completed enrollments", color: "emerald" },
          { icon: DollarSign,  value: `$${totalPayouts.toFixed(0)}`,  label: "Paid Out",         sub: "to instructors",        color: "violet"  },
          { icon: Clock,       value: String(pendingCount),           label: "Pending",          sub: "awaiting action",       color: "amber"   },
          { icon: XCircle,     value: String(failedCount),            label: "Failed",           sub: "need attention",        color: "red"     },
        ].map(({ icon: Icon, value, label, sub, color }) => {
          const p: Record<string, string> = {
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_.ic]:bg-emerald-100 dark:[&_.ic]:bg-emerald-900/40 [&_.ic_svg]:text-emerald-600 dark:[&_.ic_svg]:text-emerald-400",
            violet:  "bg-violet-50/60 dark:bg-violet-950/20 border-violet-100/60 dark:border-violet-900/20 [&_.ic]:bg-violet-100 dark:[&_.ic]:bg-violet-900/40 [&_.ic_svg]:text-violet-600 dark:[&_.ic_svg]:text-violet-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_.ic]:bg-amber-100 dark:[&_.ic]:bg-amber-900/40 [&_.ic_svg]:text-amber-600 dark:[&_.ic_svg]:text-amber-400",
            red:     "bg-red-50/60 dark:bg-red-950/20 border-red-100/60 dark:border-red-900/20 [&_.ic]:bg-red-100 dark:[&_.ic]:bg-red-900/40 [&_.ic_svg]:text-red-600 dark:[&_.ic_svg]:text-red-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${p[color]}`}>
              <div className="ic w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              {sub && <p className="text-[9px] font-bold mt-0.5 text-gray-400">{sub}</p>}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4">

        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ref, course…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-800 dark:text-white placeholder:text-gray-400
                outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select value={filterType} onChange={e => setFilterType(e.target.value as TxType | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Types</option>
              <option value="enrollment">Enrollment</option>
              <option value="payout">Payout</option>
              <option value="refund">Refund</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TxStatus | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Period filter */}
          <div className="relative">
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value as "all"|"today"|"week"|"month")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select value={`${sortBy}-${sortDir}`}
              onChange={e => { const [s,d] = e.target.value.split("-"); setSortBy(s as "date"|"amount"); setSortDir(d as "desc"|"asc"); }}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear */}
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                  border border-red-200 dark:border-red-900/50
                  text-red-500 dark:text-red-400
                  bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400 mt-3">
          Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> of {TRANSACTIONS.length} transactions
        </p>
      </motion.div>

      {/* Transaction table */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-3
          bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]
          text-[10px] font-black text-gray-400 uppercase tracking-wider">
          <span>Participant</span>
          <span>Details</span>
          <span>Amount</span>
          <span>Status</span>
          <span className="w-8" />
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((tx, i) => {
                const type   = TYPE_CONFIG[tx.type];
                const status = STATUS_CONFIG[tx.status];
                const TIcon  = type.icon;
                const SIcon  = status.icon;

                return (
                  <motion.div key={tx.id} layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center
                      hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setSelected(tx)}
                  >
                    {/* Participant */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${type.bg}`}>
                        <TIcon className={`w-4 h-4 ${type.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                          {tx.type === "enrollment" ? tx.from : tx.to}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {tx.course ? tx.course : `${type.label} · ${tx.ref}`}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{tx.ref}</p>
                      <p className="text-[10px] text-gray-400">{tx.date}</p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className={`text-sm font-black ${
                        tx.type === "enrollment"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.type === "refund"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-800 dark:text-white"
                      }`}>
                        {tx.type === "enrollment" ? "+" : "-"}{fmtAmount(tx.amount, tx.currency)}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">{tx.method.replace("_"," ")}</p>
                    </div>

                    {/* Status */}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border w-fit ${status.bg} ${status.color}`}>
                      <SIcon className="w-3 h-3" /> {status.label}
                    </span>

                    {/* View */}
                    <button className="w-8 h-8 rounded-xl flex items-center justify-center
                      bg-gray-100 dark:bg-white/[0.06] text-gray-400
                      opacity-0 group-hover:opacity-100
                      hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600
                      transition-all">
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
                <p className="text-xs text-gray-400">Try adjusting your filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <TxDetailModal tx={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}