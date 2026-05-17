// src/dashboards/admin-dashboard/pages/AdminExchangeRate.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, RefreshCw, CheckCircle2, AlertCircle,
  Loader2, TrendingUp, Clock, User, ShieldCheck,
  ArrowRight, Info,
} from "lucide-react";
import { useExchangeRate, useSetExchangeRate } from "@/services/currency.service";
import { useDashboardUser } from "@/hooks/useDashboardUser";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtNGN(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Preview card ─────────────────────────────────────────────────────────────

function ConversionPreview({ rate }: { rate: number }) {
  const examples = [1, 10, 50, 100, 500];
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
        Conversion preview at this rate
      </p>
      <div className="space-y-2">
        {examples.map(usd => (
          <div key={usd} className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400">${usd} USD</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <ArrowRight className="w-3 h-3" />
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {fmtNGN(usd * rate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminExchangeRate() {
  const { user } = useDashboardUser();
  const { data: rateData, isLoading: rateLoading, error: rateError } = useExchangeRate();
  const { mutate: setRate, isPending: saving, isSuccess, error: saveError, reset } = useSetExchangeRate();

  const [inputValue, setInputValue] = useState("");
  const [touched, setTouched] = useState(false);

  // Pre-fill input when current rate loads
  useEffect(() => {
    if (rateData && !touched) {
      setInputValue(String(rateData.usdToNgn));
    }
  }, [rateData, touched]);

  const parsedRate = parseFloat(inputValue);
  const isValidRate = !isNaN(parsedRate) && parsedRate > 0 && parsedRate <= 10_000_000;
  const hasChanged = rateData ? parsedRate !== rateData.usdToNgn : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidRate) return;
    reset();
    setRate(parsedRate);
  };

  // ── Access guard ────────────────────────────────────────────────────────────
  if (!user?.isSuperAdmin) {
    return (
      <div className="max-w-[600px] mx-auto mt-16 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white">Super Admin Only</h2>
        <p className="text-sm text-gray-400">
          Exchange rate management is restricted to Super Admins. Contact your platform owner if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Exchange Rate</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              Super Admin
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Set the platform-wide USD → NGN rate. All NGN checkout prices update immediately.
          </p>
        </div>
      </motion.div>

      {/* Current rate card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: TrendingUp, color: "emerald",
            value: rateLoading ? "—" : rateData ? `₦${rateData.usdToNgn.toLocaleString()}` : "—",
            label: "Current Rate", sub: "per 1 USD",
          },
          {
            icon: Clock, color: "blue",
            value: rateLoading ? "—" : rateData ? fmtDate(rateData.updatedAt) : "—",
            label: "Last Updated", sub: "date & time",
          },
          {
            icon: User, color: "violet",
            value: rateLoading ? "—" : rateData?.updatedBy?.name ?? "—",
            label: "Updated By", sub: rateData?.updatedBy?.email ?? "",
          },
        ].map(({ icon: Icon, color, value, label, sub }) => {
          const p: Record<string, string> = {
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_.ic]:bg-emerald-100 dark:[&_.ic]:bg-emerald-900/40 [&_.ic_svg]:text-emerald-600 dark:[&_.ic_svg]:text-emerald-400",
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_.ic]:bg-blue-100 dark:[&_.ic]:bg-blue-900/40 [&_.ic_svg]:text-blue-600 dark:[&_.ic_svg]:text-blue-400",
            violet:  "bg-violet-50/60 dark:bg-violet-950/20 border-violet-100/60 dark:border-violet-900/20 [&_.ic]:bg-violet-100 dark:[&_.ic]:bg-violet-900/40 [&_.ic_svg]:text-violet-600 dark:[&_.ic_svg]:text-violet-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${p[color]}`}>
              <div className="ic w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                {rateLoading
                  ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  : <Icon className="w-4 h-4" />}
              </div>
              <p className="text-base font-black text-gray-900 dark:text-white leading-tight text-center">{value}</p>
              {sub && <p className="text-[9px] font-bold mt-0.5 text-gray-400 text-center">{sub}</p>}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center leading-tight">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Rate error */}
      {rateError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Failed to load current rate. You can still submit a new value.</span>
        </motion.div>
      )}

      {/* Update form */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">

        {/* Form header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.06] bg-amber-50/40 dark:bg-amber-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-white">Update Exchange Rate</p>
              <p className="text-xs text-gray-400">Enter the new USD → NGN rate below</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              1 USD equals (NGN)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 pointer-events-none select-none">
                ₦
              </span>
              <input
                type="number"
                min="1"
                max="10000000"
                step="0.01"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setTouched(true); reset(); }}
                placeholder="e.g. 1600"
                className="w-full pl-8 pr-4 py-3 rounded-2xl text-lg font-black bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all"
              />
            </div>
            {inputValue && !isValidRate && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Enter a valid positive number (max 10,000,000)
              </p>
            )}
          </div>

          {/* Preview */}
          {isValidRate && <ConversionPreview rate={parsedRate} />}

          {/* Info notice */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              This rate applies immediately to all new Paystack (NGN) checkouts. Existing orders are not affected — they retain their snapshot rate.
            </p>
          </div>

          {/* Success / error feedback */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Exchange rate updated successfully.
              </motion.div>
            )}
            {saveError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {(saveError as Error).message ?? "Failed to update rate. Please try again."}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValidRate || !hasChanged || saving}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-black transition-all
              bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-[0_4px_14px_rgba(245,158,11,0.35)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><RefreshCw className="w-4 h-4" /> Update Exchange Rate</>}
          </button>

          {!hasChanged && isValidRate && (
            <p className="text-center text-xs text-gray-400">
              Rate is already set to ₦{parsedRate.toLocaleString()} — change the value to update.
            </p>
          )}
        </form>
      </motion.div>

      {/* History note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400 leading-relaxed">
          The platform stores a single active rate. Each transaction records a <strong className="text-gray-600 dark:text-gray-300">snapshot</strong> of the rate at purchase time, so historical revenue figures remain accurate regardless of future rate changes.
        </p>
      </motion.div>
    </div>
  );
}
