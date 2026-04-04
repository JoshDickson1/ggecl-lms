// src/landing/components/Hero.tsx
// THE HERO — Maximalist, cinematic, light/dark adaptive.
// Animated mesh gradient background · Floating course cards · Staggered text reveals
// Live ticker · Stats counter · Orbiting skill pills · Particle grid overlay

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, Star, Users, Award,
  Zap, Megaphone, FlaskConical, Sparkles, CheckCircle2,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 48200, label: "Students", suffix: "+" },
  { value: 142,   label: "Courses",  suffix: ""  },
  { value: 48,    label: "Instructors", suffix: "" },
  { value: 96,    label: "Completion %", suffix: "%" },
];

const FLOATING_CARDS = [
  {
    id: 2, pos: "top-[30%] right-[1%]",
    title: "Digital Marketing",
    instructor: "Amara Nwosu",
    rating: 4.8, students: "41k",
    thumbnail: "from-violet-500 to-purple-600",
    icon: Megaphone, delay: 1.2,
    floatDuration: 7,
  },
  {
    id: 3, pos: "bottom-[32%] left-[2%]",
    title: "Data Science & ML",
    instructor: "Kwame Asante",
    rating: 4.9, students: "29k",
    thumbnail: "from-amber-500 to-orange-500",
    icon: FlaskConical, delay: 0.6,
    floatDuration: 8,
  },
];

const SKILL_PILLS = [
  { label: "React",         color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",         delay: 0    },
  { label: "TypeScript",    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300", delay: 0.1  },
  { label: "Node.js",       color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", delay: 0.2 },
  { label: "Python",        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",     delay: 0.3  },
  { label: "UI/UX",         color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",         delay: 0.4  },
  { label: "Marketing",     color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", delay: 0.5  },
  { label: "Data Science",  color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",         delay: 0.6  },
  { label: "Figma",         color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",         delay: 0.7  },
  { label: "SQL",           color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",         delay: 0.8  },
  { label: "Leadership",    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", delay: 0.9  },
];

const TICKER_ITEMS = [
  "🎓 Sarah completed React Bootcamp",
  "⭐ New 5-star review for Node.js Masterclass",
  "🚀 Kofi earned his TypeScript certificate",
  "🔥 42 students enrolled today",
  "💡 New course: Quantum Mechanics drops this week",
  "🏆 Amara ranked #1 in Marketing cohort",
];

const WORDS = ["Skills", "Careers", "Dreams", "Futures", "Lives"];

// ─── Animated counter ──────────────────────────────────────────────────────────

function AnimatedCounter({ to, duration = 2 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [to, duration]);
  return <>{count.toLocaleString()}</>;
}

// ─── Floating course card ──────────────────────────────────────────────────────

function FloatingCard({ card }: { card: typeof FLOATING_CARDS[0] }) {
  const Icon = card.icon;
  return (
    <motion.div
      className={`absolute ${card.pos} z-20 hidden lg:block`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.8 + card.delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: card.floatDuration, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
        className="w-52"
      >
        <div className="rounded-2xl overflow-hidden bg-white/90 dark:bg-[#0f1623]/90 backdrop-blur-xl
          border border-white/80 dark:border-white/[0.1]
          shadow-[0_20px_60px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.8)_inset]
          dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Thumbnail */}
          <div className={`h-20 bg-gradient-to-br ${card.thumbnail} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "12px 12px" }} />
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-5 h-5 text-white drop-shadow" />
            </div>
            {/* Live badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-[9px] font-bold">LIVE</span>
            </div>
          </div>
          {/* Info */}
          <div className="p-3">
            <p className="text-xs font-black text-gray-900 dark:text-white leading-tight mb-0.5 truncate">{card.title}</p>
            <p className="text-[10px] text-gray-400 mb-2 truncate">by {card.instructor}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{card.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">{card.students}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Magnetic button ──────────────────────────────────────────────────────────

function MagneticButton({ children, className, to }: { children: React.ReactNode; className?: string; to: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ x: springX, y: springY }}>
        <Link to={to} className={className}>{children}</Link>
      </motion.div>
    </div>
  );
}

// ─── Particle grid ────────────────────────────────────────────────────────────

function ParticleGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Main mesh gradient */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59,130,246,0.18), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139,92,246,0.12), transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 10%, rgba(16,185,129,0.08), transparent 60%)
          `,
        }}
      />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Large blur orb — top left */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }}
      />
      {/* Large blur orb — bottom right */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
      />
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400/20 dark:bg-blue-400/10"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -(Math.random() * 60 + 20), 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Noise overlay ────────────────────────────────────────────────────────────

function NoiseOverlay() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px",
      }}
    />
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function LiveTicker() {
  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="text-xs text-gray-500 dark:text-gray-500 font-medium flex items-center gap-2 flex-shrink-0">
            {item}
            <span className="w-1 h-1 rounded-full bg-blue-400/40 dark:bg-blue-400/30" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Word cycler ──────────────────────────────────────────────────────────────

function WordCycler() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden h-[1.1em] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export default function Hero() {
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white dark:bg-[#060b14]">
      <ParticleGrid />
      <NoiseOverlay />

      {/* Floating course cards */}
      {FLOATING_CARDS.map(card => <FloatingCard key={card.id} card={card} />)}

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-40 pb-16 text-center max-w-5xl mx-auto w-full">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8
            bg-white/80 dark:bg-white/[0.06]
            border border-blue-200/60 dark:border-white/[0.1]
            shadow-[0_4px_24px_rgba(59,130,246,0.12),0_1px_0_rgba(255,255,255,0.8)_inset]
            dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]
            backdrop-blur-xl">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide">GGECL Learning Platform</span>
            </span>
            <span className="w-px h-3.5 bg-blue-200 dark:bg-white/10" />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">4,200+ enrolled this week</span>
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="mb-6 overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.06] tracking-tight text-gray-900 dark:text-white"
            style={{ fontFamily: "'Sora', 'Clash Display', system-ui, sans-serif" }}
          >
            Transform Your{" "}
            <WordCycler />
            <br />
            <span className="relative inline-block">
              With Expert-Led
              {/* Underline squiggle */}
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              >
                <motion.path
                  d="M2 8 C60 2, 120 12, 180 6 S260 2, 298 8"
                  stroke="url(#heroUnderlineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="heroUnderlineGrad" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
            {" "}Courses
          </motion.h1>
        </div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="max-w-xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10 font-medium"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Join <strong className="text-gray-900 dark:text-white font-black">48,200+ learners</strong> building real skills through project-based courses, live mentorship, and a community that pushes you forward.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-12"
        >
          <MagneticButton
            to="/courses"
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white overflow-hidden
              bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600
              shadow-[0_8px_32px_rgba(59,130,246,0.45),0_1px_0_rgba(255,255,255,0.2)_inset]
              hover:shadow-[0_12px_48px_rgba(59,130,246,0.6)] transition-shadow duration-300"
          >
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative">Start Learning Free</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>

          <MagneticButton
            to="/courses"
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold
              text-gray-700 dark:text-gray-200
              bg-white/80 dark:bg-white/[0.06]
              border border-gray-200/80 dark:border-white/[0.12]
              backdrop-blur-xl
              shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.8)_inset]
              dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
              hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400
              transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-0.5" />
            </div>
            Watch Preview
          </MagneticButton>
        </motion.div>

        {/* Social proof avatars */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75, ease: "easeOut" }}
          className="flex items-center gap-3 mb-16"
        >
          <div className="flex -space-x-2">
            {[
              { initials: "ZA", color: "bg-emerald-500" },
              { initials: "KM", color: "bg-violet-500" },
              { initials: "PK", color: "bg-pink-500" },
              { initials: "EO", color: "bg-blue-600" },
              { initials: "AD", color: "bg-amber-500" },
            ].map((av, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 300 }}
                className={`w-9 h-9 rounded-full ${av.color} flex items-center justify-center text-white text-xs font-black
                  ring-2 ring-white dark:ring-[#060b14] shadow-md`}
              >
                {av.initials}
              </motion.div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 mb-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              <strong className="text-gray-800 dark:text-white">4.9/5</strong> from 12,400+ reviews
            </p>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-2xl"
        >
          <div className="relative rounded-3xl overflow-hidden
            bg-white/70 dark:bg-white/[0.04]
            border border-white/80 dark:border-white/[0.08]
            backdrop-blur-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.9)_inset]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.04)_inset]">
            <div className="grid grid-cols-4 divide-x divide-gray-200/50 dark:divide-white/[0.06]">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="px-6 py-5 text-center group hover:bg-blue-50/50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">
                    {started ? <AnimatedCounter to={stat.value} duration={2} /> : "0"}
                    {stat.suffix}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Skill pills belt ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative z-10 w-full overflow-hidden py-6 border-t border-gray-200/40 dark:border-white/[0.05]"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-white dark:from-[#060b14] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-white dark:from-[#060b14] to-transparent" />
        <motion.div
          className="flex gap-3 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {[...SKILL_PILLS, ...SKILL_PILLS].map((pill, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-transparent flex-shrink-0 ${pill.color} shadow-sm`}
            >
              <CheckCircle2 className="w-3 h-3 opacity-70" />
              {pill.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Live activity ticker ── */}
      <div className="relative z-10 w-full overflow-hidden py-3 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-200/40 dark:border-white/[0.04] backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 max-w-full">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider whitespace-nowrap">Live</span>
          </div>
          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 flex-shrink-0" />
          <LiveTicker />
        </div>
      </div>

      {/* ── Feature strips ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.4 }}
        className="relative z-10 w-full border-t border-gray-200/40 dark:border-white/[0.05]"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200/40 dark:divide-white/[0.05]">
          {[
            { icon: Zap,         label: "Project-Based Learning",  desc: "Build real things from day one", color: "text-blue-500" },
            { icon: Users,       label: "Live Mentorship",          desc: "Weekly sessions with experts",  color: "text-violet-500" },
            { icon: Award,       label: "Recognised Certificates",  desc: "Industry-valued credentials",  color: "text-amber-500" },
          ].map(({ icon: Icon, label, desc, color }, i) => (
            <div key={i} className="flex items-center gap-4 px-8 py-5 group hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
                bg-white dark:bg-white/[0.05] border border-gray-200/60 dark:border-white/[0.08]
                shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}