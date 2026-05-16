import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2, XCircle, Loader2, BookOpen,
  Home, RefreshCcw, Mail, ArrowRight, AlertCircle,
} from "lucide-react";
import { useOrderStatus } from "@/services/checkout.service";
import { formatCurrency } from "@/lib/currency.utils";
import type { CurrencyCode } from "@/lib/currency.utils";

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Particle({ delay }: { delay: number }) {
  const colors = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 100;
  const size = 6 + Math.random() * 8;
  return (
    <motion.div
      className="absolute top-0 rounded-sm pointer-events-none"
      style={{ left: `${x}%`, width: size, height: size, backgroundColor: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: "110vh", opacity: [1, 1, 0], rotate: Math.random() * 720 - 360 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: "easeIn" }}
    />
  );
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 60 }, (_, i) => (
        <Particle key={i} delay={i * 0.04} />
      ))}
    </div>
  );
}

// ─── Polling state ────────────────────────────────────────────────────────────
function Verifying() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg"
    >
      <div className="rounded-[28px] p-10 text-center bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_16px_64px_rgba(0,0,0,0.1)]">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.4, 0] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
              flex items-center justify-center shadow-[0_8px_32px_rgba(59,130,246,0.5)]">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Confirming Payment
        </h1>
        <p className="text-gray-400 text-sm">
          Stripe confirmed your payment — finalising your enrollment…
        </p>
      </div>
    </motion.div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function Success({ orderId, amount, currency, courses }: {
  orderId: string;
  amount: number;
  currency: CurrencyCode;
  courses?: Array<{ id: string; title: string }>;
}) {
  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, type: "spring", stiffness: 200 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-[28px] p-10 text-center bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_16px_64px_rgba(0,0,0,0.1)]">

          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
              flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.45)]">
              <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-400 text-sm mb-1">
              Your courses are now unlocked and ready.
            </p>
            <p className="text-xs text-gray-400 mb-1">
              Order ID:{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">{orderId}</span>
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Amount paid:{" "}
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {formatCurrency(amount, currency)}
              </span>
            </p>

            {courses && courses.length > 0 && (
              <div className="rounded-2xl p-4 bg-emerald-50/60 dark:bg-emerald-950/20
                border border-emerald-100 dark:border-emerald-900/30 mb-4 text-left">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Enrolled in:
                </p>
                {courses.map((c) => (
                  <p key={c.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {c.title}
                  </p>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-4 bg-blue-50/60 dark:bg-blue-950/20
              border border-blue-100 dark:border-blue-900/30 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  A confirmation email has been sent to you. You'll also need to fill in a short{" "}
                  <span className="font-bold text-gray-800 dark:text-white">student information form</span>{" "}
                  so we can set up your account and notify the instructors.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/student/cart/student-info">
                <motion.div
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                    bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
                    shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors cursor-pointer"
                >
                  Fill Student Information <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/student/courses">
                  <motion.div
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-600 dark:text-gray-300
                      hover:border-blue-300 dark:hover:border-blue-700
                      hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" /> My Courses
                  </motion.div>
                </Link>
                <Link to="/student">
                  <motion.div
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-600 dark:text-gray-300
                      hover:border-blue-300 dark:hover:border-blue-700
                      hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <Home className="w-4 h-4" /> Home
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Still pending after load ─────────────────────────────────────────────────
function StillPending({ orderId }: { orderId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg"
    >
      <div className="rounded-[28px] p-10 text-center bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_16px_64px_rgba(0,0,0,0.1)]">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
            flex items-center justify-center shadow-[0_8px_32px_rgba(245,158,11,0.4)]">
            <AlertCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Payment Processing
        </h1>
        <p className="text-gray-400 text-sm mb-2">
          Your payment is still being confirmed. This page will update automatically.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Order ID: <span className="font-bold text-gray-500">{orderId}</span>
        </p>
        <Link to="/student">
          <motion.div
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
              bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
              shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Failed ───────────────────────────────────────────────────────────────────
function Failed({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg"
    >
      <div className="rounded-[28px] p-10 text-center bg-white dark:bg-[#0f1623]
        border border-gray-100 dark:border-white/[0.07]
        shadow-[0_16px_64px_rgba(0,0,0,0.1)]">

        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600
            flex items-center justify-center shadow-[0_8px_32px_rgba(239,68,68,0.4)]">
            <XCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-400 text-sm mb-1">
            Something went wrong processing your payment. No charges were made.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Order ID: <span className="font-bold text-gray-500">{orderId}</span>
          </p>

          <div className="rounded-2xl p-4 bg-red-50/60 dark:bg-red-950/20
            border border-red-100 dark:border-red-900/30 mb-8 text-left">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Common reasons:</p>
            {[
              "Insufficient funds",
              "Card details entered incorrectly",
              "Bank declined the transaction",
              "Network timeout",
            ].map((r) => (
              <p key={r} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 py-0.5">
                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                {r}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/student/cart")}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                bg-blue-600 hover:bg-blue-500 text-white font-black text-sm
                shadow-[0_6px_24px_rgba(59,130,246,0.42)] transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Try Again
            </motion.button>
            <Link to="/student/cart">
              <motion.div
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold
                  border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-300
                  hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer"
              >
                Back to Cart
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentCheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  const { data: order, isLoading, error } = useOrderStatus(orderId, !!orderId);

  const accentColor =
    isLoading || order?.status === "PENDING"
      ? "rgba(59,130,246,0.06)"
      : order?.status === "PAID"
      ? "rgba(16,185,129,0.06)"
      : "rgba(239,68,68,0.05)";

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18] flex items-center justify-center px-6 py-24">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px),
            radial-gradient(circle 700px at 50% 40%, ${accentColor}, transparent 70%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%",
        }}
      />
      <div className="relative z-10 w-full flex justify-center">
        {!orderId ? (
          // Stripe sent us here without an orderId — shouldn't happen but handle gracefully
          <StillPending orderId="unknown" />
        ) : isLoading || order?.status === "PENDING" ? (
          <Verifying />
        ) : error ? (
          <Failed orderId={orderId} />
        ) : order?.status === "PAID" ? (
          <Success
            orderId={order.orderId}
            amount={order.amount}
            currency={order.currency}
            courses={order.courses}
          />
        ) : (
          <Failed orderId={orderId} />
        )}
      </div>
    </div>
  );
}
