// src/dashboards/admin-dashboard/pages/AdminTransactions.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Search, ChevronDown, X, Eye,
  CheckCircle2, XCircle, Clock, RefreshCw,
  TrendingUp, CreditCard, Loader2,
  ShoppingCart, BarChart3, ChevronLeft, ChevronRight,
  AlertCircle, Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TransactionService, {
  type Transaction,
  type OrderStatus,
  type Gateway,
  type TransactionAnalytics,
} from "@/services/transaction.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtK(n: number, currency = "USD") {
  const sym = currency === "NGN" ? "₦" : "$";
  return n >= 1_000_000
    ? `${sym}${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${sym}${(n / 1_000).toFixed(1)}k`
    : `${sym}${n.toFixed(0)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, {
  label: string; icon: React.ElementType; color: string; bg: string;
}> = {
  PAID:      { label: "Paid",      icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50" },
  PENDING:   { label: "Pending",   icon: Clock,        color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"         },
  FAILED:    { label: "Failed",    icon: XCircle,      color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"                 },
  REFUNDED:  { label: "Refunded",  icon: RefreshCw,    color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50"             },
  CANCELLED: { label: "Cancelled", icon: XCircle,      color: "text-gray-600 dark:text-gray-400",       bg: "bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800/50"             },
};

// ─── Detail modal ─────────────────────────────────────────────────────────────

function TxDetailModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data: tx, isLoading } = useQuery<Transaction>({
    queryKey: ["transaction-detail", orderId],
    queryFn: () => TransactionService.findOne(orderId),
    staleTime: 1000 * 60 * 5,
  });

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
        className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40">
                <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Order</p>
                {tx && (
                  <p className="text-lg font-black text-gray-900 dark:text-white">
                    {fmtCurrency(tx.total, tx.currency)}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 dark:bg-white/[0.08] text-gray-500 hover:bg-white/80 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm text-gray-400">Loading…</span>
            </div>
          )}

          {tx && (() => {
            const status = STATUS_CONFIG[tx.status];
            const SIcon = status.icon;
            return (
              <>
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${status.bg} ${status.color}`}>
                    <SIcon className="w-3.5 h-3.5" /> {status.label}
                  </span>
                </div>

                {/* Student */}
                <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Student</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{tx.student.name}</p>
                  <p className="text-xs text-gray-400">{tx.student.email}</p>
                </div>

                {/* Courses */}
                <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Courses ({tx.items.length})
                  </p>
                  <div className="space-y-2">
                    {tx.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate flex-1">
                          {item.courseTitle}
                        </p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                          {fmtCurrency(item.priceAtPurchase, tx.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Breakdown</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{fmtCurrency(tx.subtotal, tx.currency)}</span>
                  </div>
                  {tx.discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        Discount {tx.promoCodeSnapshot && <span className="text-[9px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full font-bold">{tx.promoCodeSnapshot}</span>}
                      </span>
                      <span className="font-semibold text-red-500">−{fmtCurrency(tx.discountAmount, tx.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-gray-200 dark:border-white/[0.08] pt-2 mt-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Total</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{fmtCurrency(tx.total, tx.currency)}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: "Order ID",   value: tx.orderId },
                    { label: "Gateway",    value: tx.gateway },
                    { label: "Date",       value: fmtDate(tx.createdAt) },
                    ...(tx.payment?.gatewayRef ? [{ label: "Gateway Ref", value: tx.payment.gatewayRef }] : []),
                    ...(tx.payment?.paidAt    ? [{ label: "Paid At",     value: fmtDate(tx.payment.paidAt) }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                      <span className="text-xs font-bold text-gray-400">{label}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-right max-w-[60%] truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AdminTransactions() {
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState<OrderStatus | "all">("all");
  const [filterGateway, setFilterGateway] = useState<Gateway | "all">("all");
  const [sortBy,        setSortBy]        = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [page,          setPage]          = useState(1);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);

  const sortMap = {
    "date-desc":   { sortBy: "createdAt" as const, order: "desc" as const },
    "date-asc":    { sortBy: "createdAt" as const, order: "asc"  as const },
    "amount-desc": { sortBy: "total"     as const, order: "desc" as const },
    "amount-asc":  { sortBy: "total"     as const, order: "asc"  as const },
  };

  const query = {
    ...(search.trim()            && { search: search.trim()              }),
    ...(filterStatus !== "all"   && { status: filterStatus               }),
    ...(filterGateway !== "all"  && { gateway: filterGateway             }),
    ...sortMap[sortBy],
    page,
    limit: PAGE_SIZE,
  };

  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ["admin-transactions", query],
    queryFn: () => TransactionService.findAll(query),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<TransactionAnalytics>({
    queryKey: ["admin-transactions-analytics"],
    queryFn: () => TransactionService.getAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = listLoading || analyticsLoading;
  const transactions = list?.items ?? [];
  const totalPages = list?.totalPages ?? 1;
  const totalCount = list?.total ?? 0;

  const hasFilters = filterStatus !== "all" || filterGateway !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setSearch(""); setFilterStatus("all"); setFilterGateway("all"); setPage(1);
  };

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleStatusChange = (v: OrderStatus | "all") => { setFilterStatus(v); setPage(1); };
  const handleGatewayChange = (v: Gateway | "all") => { setFilterGateway(v); setPage(1); };

  return (
    <div className="max-w-[1100px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">Platform revenue — orders, payments & refunds</p>
        </div>
      </motion.div>

      {/* Analytics cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingUp, color: "emerald",
            value: analyticsLoading ? "—" : fmtK(analytics?.totalRevenue ?? 0),
            label: "Total Revenue", sub: "all paid orders",
          },
          {
            icon: ShoppingCart, color: "blue",
            value: analyticsLoading ? "—" : (analytics?.totalCompletedOrders ?? 0).toLocaleString(),
            label: "Completed Orders", sub: "paid enrollments",
          },
          {
            icon: BarChart3, color: "violet",
            value: analyticsLoading ? "—" : fmtCurrency(analytics?.averageOrderValue ?? 0),
            label: "Avg Order Value", sub: "per paid order",
          },
          {
            icon: Clock, color: "amber",
            value: analyticsLoading ? "—" : String(analytics?.pendingOrders ?? 0),
            label: "Pending", sub: "awaiting payment",
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
                {analyticsLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Icon className="w-4 h-4" />}
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              {sub && <p className="text-[9px] font-bold mt-0.5 text-gray-400">{sub}</p>}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Gateway breakdown */}
      {analytics && analytics.revenueByGateway.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="flex flex-wrap items-center gap-3 px-5 py-4 rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">Revenue by gateway</span>
          {analytics.revenueByGateway.map(g => (
            <div key={g.gateway} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07]">
              <CreditCard className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{g.gateway}</span>
              <span className="text-xs text-gray-400">{fmtK(g.revenue)}</span>
              <span className="text-[10px] text-gray-400">({g.count} orders)</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search student, order ID, course…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select value={filterStatus} onChange={e => handleStatusChange(e.target.value as OrderStatus | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Gateway filter */}
          <div className="relative">
            <select value={filterGateway} onChange={e => handleGatewayChange(e.target.value as Gateway | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Gateways</option>
              <option value="PAYSTACK">Paystack</option>
              <option value="STRIPE">Stripe</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select value={sortBy} onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
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
          Showing page <span className="font-bold text-gray-700 dark:text-gray-300">{page}</span> of{" "}
          <span className="font-bold text-gray-700 dark:text-gray-300">{totalPages}</span> — {totalCount} total
        </p>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">

        <div className="grid grid-cols-[2fr_1.4fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06] text-[10px] font-black text-gray-400 uppercase tracking-wider">
          <span>Student / Course</span>
          <span>Order ID</span>
          <span>Amount</span>
          <span>Status</span>
          <span className="w-8" />
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {listLoading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm text-gray-400">Loading transactions…</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {transactions.length > 0 ? (
                transactions.map((tx, i) => {
                  const status = STATUS_CONFIG[tx.status];
                  const SIcon = status.icon;
                  const courseSummary = tx.items.length === 1
                    ? tx.items[0].courseTitle
                    : `${tx.items.length} courses`;

                  return (
                    <motion.div key={tx.orderId} layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className="grid grid-cols-[2fr_1.4fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => setSelectedId(tx.orderId)}
                    >
                      {/* Student / Course */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                          <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{tx.student.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{courseSummary}</p>
                        </div>
                      </div>

                      {/* Order ID + date */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate font-mono">
                          {tx.orderId.slice(0, 16)}…
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-[10px] text-gray-400">{fmtDate(tx.createdAt)}</p>
                          <span className="text-[9px] px-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500 font-bold">{tx.gateway}</span>
                          {tx.promoCodeSnapshot && (
                            <span className="text-[9px] px-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold flex items-center gap-0.5">
                              <Tag className="w-2 h-2" />{tx.promoCodeSnapshot}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {fmtCurrency(tx.total, tx.currency)}
                        </p>
                        {tx.discountAmount > 0 && (
                          <p className="text-[10px] text-gray-400 line-through">{fmtCurrency(tx.subtotal, tx.currency)}</p>
                        )}
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
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">No transactions found</p>
                  <p className="text-xs text-gray-400">
                    {hasFilters ? "Try adjusting your filters" : "No transactions recorded yet"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} · {totalCount} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const pg = start + i;
                return (
                  <button key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      pg === page
                        ? "bg-blue-500 text-white shadow-sm"
                        : "border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                    }`}>
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Subtotal footer (single page) */}
        {totalPages <= 1 && !listLoading && transactions.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] flex items-center justify-between">
            <p className="text-xs text-gray-400">{transactions.length} record{transactions.length !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Page total:{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {fmtCurrency(transactions.reduce((a, t) => a + t.total, 0))}
                </span>
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedId && (
          <TxDetailModal orderId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
