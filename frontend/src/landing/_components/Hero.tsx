// src/landing/components/Hero.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Star, CheckCircle2 } from "lucide-react";

const PHOTO_SETS: string[][] = [
  // Slot A — large center
  [
    "./A1.jpg",  // young woman smiling
    "./A2.jpg",  // man portrait
    "./A3.jpg",  // professional woman
    "./A4.jpg",  // man smiling
  ],
  // Slot B — top right
  [
    "./B1.jpg",  // woman glasses
    "./B2.jpg",  // man casual
    "./B3.jpg",  // woman happy
    "./B4.jpg",  // man serious
  ],
  // Slot C — top left small
  [
    // "./A.jpg",  // young woman
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&q=80&fit=crop",  // man portrait
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&q=80&fit=crop",  // woman portrait
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80&fit=crop",  // man smiling
  ],
  // Slot D — bottom right small
  [
    // "./A.jpg",  // man beard
    "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=300&q=80&fit=crop",  // woman confident
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80&fit=crop",  // man outdoor
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80&fit=crop",  // woman casual
  ],
  // Slot E — bottom left
  [
    // "./A.jpg",  // man young
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80&fit=crop",  // woman stylish
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&q=80&fit=crop",  // woman laughing
    "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80&fit=crop",  // man smiling
  ],
];

const TICKER_ITEMS = [
  "🎓 Sarah completed React Bootcamp",
  "⭐ New 5-star review for Node.js Masterclass",
  "🚀 Kofi earned his TypeScript certificate",
  "🔥 42 students enrolled today",
  "🏆 Amara ranked #1 in Marketing cohort",
];

// ─── Single cycling photo slot ────────────────────────────────────────────────
// mode="sync" so incoming renders ON TOP of exiting — no empty frame ever

function CyclingPhoto({
  photos,
  className = "",
  interval = 2600,
  offset = 0,
  rounded = "rounded-2xl",
  border = true,
  style,
}: {
  photos: string[];
  className?: string;
  interval?: number;
  offset?: number;
  rounded?: string;
  border?: boolean;
  style?: React.CSSProperties;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const id = setInterval(() => setIndex(i => (i + 1) % photos.length), interval);
      return () => clearInterval(id);
    }, offset);
    return () => clearTimeout(t);
  }, [photos.length, interval, offset]);

  return (
    <div
      style={style}
      className={`relative overflow-hidden ${rounded} ${className} ${
        border ? "ring-[10px] ring-white dark:ring-[#0f1623] shadow-xl" : ""
      }`}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={photos[index]}
          src={photos[index]}
          alt=""
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full object-cover object-top"
          draggable={false}
        />
      </AnimatePresence>
    </div>
  );
}

// ─── Live ticker ──────────────────────────────────────────────────────────────

function LiveTicker() {
  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="text-xs text-gray-500 dark:text-gray-500 font-medium flex items-center gap-2 flex-shrink-0">
            {item}
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-white dark:bg-[#060b14] overflow-hidden flex flex-col">

      {/* Subtle background tint */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-slate-50 dark:from-[#0a1020] to-transparent" />
      </div>

      {/* ── Main layout ── */}
      <div className="relative flex-1 max-w-[1200px] mx-auto w-full px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-center pt-32 pb-16">

        {/* ── Left: copy ── */}
        <div className="flex flex-col items-start">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.6rem,5.5vw,4.8rem)] font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white mb-6"
          >
            Learn. Connect.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900 dark:from-blue-900 dark:to-blue-400">
              Thrive.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-[480px]"
          >
            Build real-world skills through project-based courses, live mentorship, and a community that pushes you forward.
          </motion.p>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col gap-2.5 mb-10"
          >
            {[
              "Free coaching and professional development opportunities",
              "Industry-recognised certificates",
              "Live mentorship and more benefits",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-wrap items-center gap-3 mb-12"
          >
            <Link
              to="/courses"
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white
                bg-gradient-to-br from-blue-600 to-blue-900
                shadow-[0_6px_28px_rgba(59,130,246,0.4)]
                hover:shadow-[0_8px_40px_rgba(59,130,246,0.55)] hover:-translate-y-0.5
                transition-all duration-200"
            >
              Start Learning Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/courses"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold
                text-gray-700 dark:text-gray-200
                border border-gray-200 dark:border-white/[0.12]
                hover:border-blue-400 dark:hover:border-blue-500
                hover:text-blue-600 dark:hover:text-blue-400
                hover:-translate-y-0.5
                transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Play className="w-3 h-3 text-blue-600 dark:text-blue-400 ml-0.5" />
              </div>
              Watch Preview
            </Link>
          </motion.div>

          {/* Social proof — avatars only, no fake numbers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[
                { i: "ZA", c: "bg-emerald-500" },
                { i: "KM", c: "bg-violet-500"  },
                { i: "PK", c: "bg-pink-500"    },
                { i: "EO", c: "bg-blue-600"    },
                { i: "AD", c: "bg-amber-500"   },
              ].map((av, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.75 + idx * 0.07, type: "spring", stiffness: 300 }}
                  className={`w-8 h-8 rounded-full ${av.c} flex items-center justify-center text-white text-[10px] font-black ring-2 ring-white dark:ring-[#060b14]`}
                >
                  {av.i}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Early learners already enrolled — <strong className="text-gray-700 dark:text-gray-300">join them</strong>
            </p>
          </motion.div>
        </div>

        {/* ── Right: photo collage — absolutely positioned, overlapping ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="hidden lg:block relative h-[600px]"
        >
          {/* Frame A — large center-left, tallest */}
          <CyclingPhoto
            photos={PHOTO_SETS[0]}
            rounded="rounded-3xl"
            interval={2800}
            offset={0}
            className="absolute"
            style={{ top: "5%", left: "8%", width: "430px", height: "70%" }}
          />

          {/* Frame B — top-right, overlaps A */}
          <CyclingPhoto
            photos={PHOTO_SETS[1]}
            rounded="rounded-2xl"
            interval={2400}
            offset={700}
            className="absolute"
            style={{ top: "-10%", left: "48%", width: "300px", height: "42%" }}
          />

          {/* Frame C — bottom-right, overlaps A and B */}
          <CyclingPhoto
            photos={PHOTO_SETS[2]}
            rounded="rounded-2xl"
            interval={3000}
            offset={1400}
            className="absolute"
            style={{ top: "46%", left: "52%", width: "40%", height: "38%" }}
          />

          {/* Frame D — bottom-left, peeks under A */}
          <CyclingPhoto
            photos={PHOTO_SETS[3]}
            rounded="rounded-2xl"
            interval={2600}
            offset={400}
            className="absolute"
            style={{ top: "64%", left: "0%", width: "36%", height: "34%" }}
          />

          {/* Frame E — small top-left accent */}
          <CyclingPhoto
            photos={PHOTO_SETS[4]}
            rounded="rounded-xl"
            interval={2200}
            offset={1800}
            className="absolute"
            style={{ top: "2%", left: "0%", width: "30%", height: "28%" }}
          />

          {/* Floating quote badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute z-30 px-4 py-3 rounded-2xl max-w-[190px]
              bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur-xl
              border border-gray-200/80 dark:border-white/[0.1]
              shadow-[0_12px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            style={{ bottom: "18%", left: "-18px" }}
          >
            <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
              "Your expertise deserves to be paying you."
            </p>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />)}
            </div>
          </motion.div>

          {/* Live pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl
              bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur-xl
              border border-gray-200/80 dark:border-white/[0.1]
              shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            style={{ top: "32%", right: "-16px" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div>
              <p className="text-[11px] font-black text-gray-900 dark:text-white leading-none">Now enrolling</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Cohort open</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Live ticker ── */}
      <div className="border-t border-gray-100 dark:border-white/[0.04] bg-gray-50/60 dark:bg-white/[0.02] py-3">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 flex-shrink-0" />
          <LiveTicker />
        </div>
      </div>
    </section>
  );
}