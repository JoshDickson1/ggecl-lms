import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, ShoppingCart, Home, RefreshCcw, Info } from "lucide-react";

export default function StudentCheckoutCancelled() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18] flex items-center justify-center px-6 py-24">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.025) 1px, transparent 1px),
            radial-gradient(circle 700px at 50% 40%, rgba(239,68,68,0.04), transparent 70%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%",
        }}
      />

      <div className="relative z-10 w-full flex justify-center">
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-500
                dark:from-gray-600 dark:to-gray-800
                flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <XCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-400 text-sm mb-1">
                You cancelled the payment. No charges were made.
              </p>
              {orderId && (
                <p className="text-xs text-gray-400 mb-6">
                  Order ID: <span className="font-bold text-gray-500">{orderId}</span>
                </p>
              )}

              {/* Info card */}
              <div className="rounded-2xl p-4 bg-blue-50/60 dark:bg-blue-950/20
                border border-blue-100 dark:border-blue-900/30 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Your cart items are still saved. You can go back and try again whenever you're ready.
                    If you were charged, please contact support.
                  </p>
                </div>
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

                <div className="grid grid-cols-2 gap-3">
                  <Link to="/student/cart">
                    <motion.div
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold
                        border border-gray-200 dark:border-white/[0.08]
                        text-gray-600 dark:text-gray-300
                        hover:border-blue-300 dark:hover:border-blue-700
                        hover:text-blue-600 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" /> Cart
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
      </div>
    </div>
  );
}
