import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";

type Variant = "student" | "instructor" | "admin";

const VARIANTS: Record<
  Variant,
  {
    title: string;
    body: string;
    gradient: string;
    progressGradient: string;
    progressGlow: string;
    orbColor: string;
    orbColorDark: string;
    icon: React.ReactNode;
  }
> = {
  student: {
    title: "Student Login",
    body: "Please proceed to login with your student credentials to access your dashboard.",
    gradient: "linear-gradient(135deg, #1a6ef7 0%, #0a3ba8 100%)",
    progressGradient: "linear-gradient(90deg, #1a6ef7, #4d9bff)",
    progressGlow: "rgba(26,110,247,0.5)",
    orbColor: "rgba(26,110,247,0.14)",
    orbColorDark: "rgba(77,155,255,0.12)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM3 13c0-2.21 2.239-4 5-4s5 1.79 5 4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  instructor: {
    title: "Instructor Login",
    body: "Login with your instructor credentials to manage your courses and track student progress.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
    progressGradient: "linear-gradient(90deg, #f59e0b, #fbbf24)",
    progressGlow: "rgba(245,158,11,0.5)",
    orbColor: "rgba(245,158,11,0.14)",
    orbColorDark: "rgba(251,191,36,0.10)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.5" />
        <path d="M5 14h6M8 11v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 6.5h6M5 8.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  admin: {
    title: "Admin Access",
    body: "This is a restricted area. Login with your admin credentials. All activity is monitored.",
    gradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
    progressGradient: "linear-gradient(90deg, #dc2626, #f87171)",
    progressGlow: "rgba(220,38,38,0.5)",
    orbColor: "rgba(220,38,38,0.14)",
    orbColorDark: "rgba(248,113,113,0.10)",
    icon: <Shield size={16} color="white" strokeWidth={1.8} />,
  },
};

type PageNotifierProps = {
  variant?: Variant;
};

const PageNotifier = ({ variant = "student" }: PageNotifierProps) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const v = VARIANTS[variant];

  useEffect(() => {
    if (!visible) return;
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            setVisible(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPaused, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: "110%", opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: "110%", opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="fixed bottom-5 right-5 z-50"
        >
          <div
            className={`relative w-[340px] p-4 rounded-xl border bg-white/60 backdrop-blur-xl shadow-lg overflow-hidden ${
              variant === "admin" ? "border-red-400/30" : "border-white/20"
            } dark:bg-gray-900/80 dark:border-white/10`}
          >
            {/* Orb */}
            <div
              className="absolute top-[-40px] right-[-40px] w-[120px] h-[120px] rounded-full filter blur-3xl pointer-events-none"
              style={{ background: v.orbColor }}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: v.gradient,
                  boxShadow: `0 4px 14px ${v.progressGlow}`,
                }}
              >
                {v.icon}
              </div>
              <div className="flex-1 min-w-0">
                {variant === "admin" && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-red-600 bg-red-100/50 border border-red-300 rounded-full px-2 py-0.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Restricted
                  </div>
                )}
                <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {v.title}
                </p>
              </div>
              <button
                className=" w-7 h-7 rounded-full bg-black/5 border border-black/10 dark:bg-white/5 dark:border-white/10 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-transform transition-colors transition-all items-center justify-center flex-shrink-0"
                onClick={() => setVisible(false)}
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <p
              className={`text-[13px] font-light mb-3 ${
                variant === "admin"
                  ? "bg-red-50/30 border border-red-200/40 p-2 rounded text-gray-700 dark:bg-red-900/20 dark:text-gray-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {v.body}
            </p>

            {/* Progress */}
            <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: v.progressGradient,
                  boxShadow: `0 0 8px ${v.progressGlow}`,
                }}
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageNotifier;