import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, CreditCard, Zap, Lock } from "lucide-react";
import { useCart } from "@/hooks/useCart.tsx";

const STEPS = [
  { label: "Encrypting your payment details", icon: Lock, duration: 1400 },
  { label: "Contacting payment provider", icon: CreditCard, duration: 1600 },
  { label: "Authorising transaction", icon: Shield, duration: 1800 },
  { label: "Confirming your order", icon: Zap, duration: 1000 },
];

export default function Processing() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let total = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      total += step.duration;
      timers.push(
        setTimeout(() => {
          if (i < STEPS.length - 1) {
            setStepIndex(i + 1);
          } else {
            setDone(true);
            // Simulate ~80% success rate for demo
            const success = Math.random() > 0.2;
            setTimeout(() => {
              if (success) {
                clearCart();
                navigate("/order-complete?status=success");
              } else {
                navigate("/order-complete?status=failed");
              }
            }, 900);
          }
        }, total)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const progress = done ? 100 : ((stepIndex) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18] flex items-center justify-center px-6">
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.03) 1px, transparent 1px),
            radial-gradient(circle 600px at 50% 50%, rgba(59,130,246,0.06), transparent 70%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%",
        }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-[28px] p-10 text-center
          bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_16px_64px_rgba(0,0,0,0.1)]">

          {/* Animated orb */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              {/* Outer pulse rings */}
              {[0, 1, 2].map((i) => (
                <motion.div key={i}
                  className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                  animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.4, 0] }}
                  transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              {/* Core */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                  flex items-center justify-center
                  shadow-[0_8px_32px_rgba(59,130,246,0.5)]"
                animate={done ? { scale: [1, 1.12, 1] } : { rotate: 360 }}
                transition={done
                  ? { duration: 0.5, ease: "easeInOut" }
                  : { duration: 2, repeat: Infinity, ease: "linear" }
                }
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}>
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div key="spin"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {(() => { const Icon = STEPS[stepIndex]?.icon ?? Shield; return <Icon className="w-10 h-10 text-white" />; })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            {done ? "Payment Confirmed!" : "Processing Payment"}
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            {done ? "Redirecting you now..." : "Please don't close this window."}
          </p>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] mb-6 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Step list */}
          <div className="flex flex-col gap-2.5 text-left">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === stepIndex && !done;
              const isDone = i < stepIndex || done;
              return (
                <motion.div key={step.label}
                  animate={{ opacity: isDone ? 0.5 : isActive ? 1 : 0.35 }}
                  className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500"
                      : isActive
                        ? "bg-blue-100 dark:bg-blue-950/40 text-blue-500"
                        : "bg-gray-100 dark:bg-white/[0.04] text-gray-400"
                  }`}>
                    {isDone
                      ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : <Icon className="w-3.5 h-3.5" />
                    }
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {step.label}
                    {isActive && (
                      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                        ...
                      </motion.span>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}