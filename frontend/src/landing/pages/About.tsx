// src/landing/pages/About.tsx
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Globe, Users, BookOpen, Award,
  Target, Lightbulb, Heart, Zap,
  GraduationCap, TrendingUp, CheckCircle2,
  MapPin, Mail, Star,
} from "lucide-react";
import { PageHeroBg } from "./SingleCategory";
import { instructors } from "@/data/Instructors";
import { courses } from "@/data/courses";
import { categories } from "@/data/categories";

// ─── Fonts injected once ──────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── Animation helpers ────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

// ─── Derived stats ─────────────────────────────────────────────────────────────
const totalStudents = courses.reduce((a, c) => a + c.students, 0);
const totalInstructors = instructors.length;
const totalCourses = courses.length;
const totalCategories = categories.length;

function fmtBig(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k+`;
  return String(n);
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
      bg-blue-50 dark:bg-blue-950/40
      border border-blue-100 dark:border-blue-800/50 mb-5">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{text}</span>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/[0.07] to-transparent my-2" />;
}

// ─── Values data ──────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: Target,
    color: "from-blue-500 to-blue-700",
    glow:  "rgba(59,130,246,0.35)",
    title: "Purposeful Learning",
    body:  "Every course on GGECL is built around a clear outcome. We don't believe in filler — every lecture earns its place.",
  },
  {
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    glow:  "rgba(244,63,94,0.35)",
    title: "Student First, Always",
    body:  "From pricing to support, every decision starts with one question: does this make the student's journey better?",
  },
  {
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    glow:  "rgba(245,158,11,0.35)",
    title: "World-Class Instruction",
    body:  "We partner only with practitioners — people doing the work, not just teaching it. Theory and reality, together.",
  },
  {
    icon: Globe,
    color: "from-emerald-500 to-teal-600",
    glow:  "rgba(16,185,129,0.35)",
    title: "Accessible to Everyone",
    body:  "Great education shouldn't depend on your zip code or your bank account. We're built to reach every corner of Africa and beyond.",
  },
  {
    icon: Zap,
    color: "from-violet-500 to-purple-700",
    glow:  "rgba(139,92,246,0.35)",
    title: "Relentless Improvement",
    body:  "Our platform, our content, and our community never stop getting better. Feedback isn't a suggestion box — it's our roadmap.",
  },
  {
    icon: Users,
    color: "from-cyan-500 to-blue-500",
    glow:  "rgba(6,182,212,0.35)",
    title: "Community & Belonging",
    body:  "Learning alone is hard. GGECL is a place where students support each other, instructors know your name, and nobody falls behind alone.",
  },
];

// ─── Timeline milestones ──────────────────────────────────────────────────────
const MILESTONES = [
  { year: "2020", title: "Founded in Lagos", body: "GGECL was born from a simple frustration: great instruction was locked behind geography and wealth. Our founders set out to fix that." },
  { year: "2021", title: "First 1,000 Students", body: "Within six months of launch, 1,000 students had enrolled across Development, Marketing, and Business courses. Proof the model worked." },
  { year: "2022", title: "Instructor Partner Program", body: "We launched a rigorous vetting and onboarding programme to bring the continent's best practitioners onto the platform." },
  { year: "2023", title: "200k Enrollments", body: "Students from 38 countries had enrolled in GGECL courses. Our certificate programme was recognised by 12 partner employers." },
  { year: "2024", title: "₦1B+ Paid to Instructors", body: "We crossed ₦1 billion in total instructor earnings — proving that knowledge-sharing is a sustainable, dignified career." },
  { year: "2025", title: "The Next Chapter", body: "New categories, AI-powered learning paths, live cohorts, and a mobile app. GGECL is just getting started." },
];

// ─── Featured instructors (top 4 by students) ────────────────────────────────
const FEATURED = [...instructors]
  .sort((a, b) => b.students - a.students)
  .slice(0, 4);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <>
      <style>{FONTS}</style>

      <div
        className="min-h-screen bg-white dark:bg-[#070d1a] text-gray-900 dark:text-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-36 pb-28 overflow-hidden">
          <PageHeroBg  />

          <div className="relative z-10 max-w-[1100px] mx-auto px-5 text-center">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                bg-white/20 dark:bg-blue-900/30 backdrop-blur-sm
                border border-white/30 dark:border-blue-700/40 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Our Story</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-6 tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Learning that{" "}
              <span className="relative inline-block">
                changes lives
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full origin-left"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed mb-10">
              GGECL was built on the belief that world-class education should be accessible to everyone —
              wherever you are, whatever you earn, whoever you are.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/courses">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold
                    bg-white text-blue-700
                    shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all">
                  Explore Courses <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/instructors">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold
                    bg-white/15 backdrop-blur-sm border border-white/30 text-white
                    hover:bg-white/25 transition-all">
                  Meet Instructors
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Stats row floating at bottom of hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="relative z-10 max-w-[900px] mx-auto px-5 mt-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users,        value: fmtBig(totalStudents),    label: "Learners worldwide" },
                { icon: BookOpen,     value: String(totalCourses) + "+", label: "Expert-led courses"  },
                { icon: GraduationCap,value: String(totalInstructors)+"+",label: "World-class instructors" },
                { icon: Globe,        value: "38+",                    label: "Countries reached"   },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center py-5 px-4 rounded-2xl
                  bg-white/15 dark:bg-white/[0.06] backdrop-blur-md
                  border border-white/20 dark:border-white/[0.08] text-center">
                  <Icon className="w-5 h-5 text-white/70 mb-2" />
                  <p className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── MISSION ───────────────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1100px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <FadeUp>
              <Label text="Our Mission" />
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Closing the global{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  skills gap
                </span>
                , one learner at a time
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-5 text-[15px]">
                The world is changing faster than traditional education can keep up. By the time a university
                curriculum is written, reviewed, and published, the industry has already moved on.
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 text-[15px]">
                GGECL exists to bridge that gap — partnering with practitioners at the top of their fields
                to deliver instruction that is immediately applicable, constantly updated, and radically affordable.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Courses updated every quarter",
                  "Instructors vetted by industry panels",
                  "Certificates recognised by 50+ employers",
                  "Lifetime access — learn at your own pace",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Right — visual card stack */}
            <FadeUp delay={0.12}>
              <div className="relative h-[420px]">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-[32px] blur-3xl" />

                {/* Card 1 — main */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-800
                  overflow-hidden shadow-[0_24px_80px_rgba(59,130,246,0.3)]">
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Total impact</p>
                    <p className="text-white text-5xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {fmtBig(totalStudents)}
                    </p>
                    <p className="text-white/70 text-sm">students whose careers we've touched</p>

                    <div className="mt-6 flex gap-2 flex-wrap">
                      {categories.slice(0, 6).map(cat => (
                        <span key={cat.id} className="px-3 py-1.5 rounded-xl text-[10px] font-bold
                          bg-white/15 border border-white/20 text-white/80">
                          {cat.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating card — instructor count */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-4 -top-4 w-44 rounded-2xl p-4
                    bg-white dark:bg-[#0f1623] shadow-[0_12px_40px_rgba(0,0,0,0.15)]
                    border border-gray-100 dark:border-white/[0.08]">
                  <GraduationCap className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{totalInstructors}+</p>
                  <p className="text-xs text-gray-400">Expert instructors</p>
                </motion.div>

                {/* Floating card — rating */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -left-4 top-16 w-44 rounded-2xl p-4
                    bg-white dark:bg-[#0f1623] shadow-[0_12px_40px_rgba(0,0,0,0.15)]
                    border border-gray-100 dark:border-white/[0.08]">
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: "'Syne', sans-serif" }}>4.8</p>
                  <p className="text-xs text-gray-400">Avg. course rating</p>
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </section>

        <Divider />

        {/* ── VALUES ────────────────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1100px] mx-auto px-5">
          <div className="text-center mb-14">
            <FadeUp>
              <Label text="What We Stand For" />
              <h2 className="text-4xl sm:text-5xl font-black leading-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                The principles that{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
                  guide everything
                </span>
              </h2>
            </FadeUp>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-[22px] bg-white dark:bg-[#0f1623]
                    border border-gray-100 dark:border-white/[0.07]
                    shadow-[0_4px_24px_rgba(0,0,0,0.04)]
                    hover:shadow-[0_12px_40px_rgba(59,130,246,0.10)]
                    dark:hover:shadow-[0_12px_40px_rgba(59,130,246,0.06)]
                    transition-all duration-300 p-6 group h-full">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.color}
                    flex items-center justify-center mb-5
                    shadow-[0_6px_20px_${v.glow}]
                    group-hover:scale-110 transition-transform duration-300`}>
                    <v.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-2"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {v.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.body}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── TIMELINE ──────────────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1100px] mx-auto px-5">
          <div className="text-center mb-14">
            <FadeUp>
              <Label text="Our Journey" />
              <h2 className="text-4xl sm:text-5xl font-black leading-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Five years of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  building something real
                </span>
              </h2>
            </FadeUp>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] sm:left-1/2 top-0 bottom-0 w-px
              bg-gradient-to-b from-blue-500/40 via-blue-300/20 to-transparent hidden sm:block" />

            <div className="flex flex-col gap-8">
              {MILESTONES.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <FadeUp key={m.year} delay={i * 0.06}>
                    <div className={`flex items-start gap-6 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                      {/* Card */}
                      <div className={`flex-1 ${isLeft ? "sm:text-right sm:pr-12" : "sm:pl-12"}`}>
                        <div className={`inline-block rounded-[20px] p-5
                          bg-white dark:bg-[#0f1623]
                          border border-gray-100 dark:border-white/[0.07]
                          shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                          hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.25),0_8px_32px_rgba(59,130,246,0.08)]
                          transition-all duration-300 text-left max-w-sm w-full`}>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{m.year}</span>
                          <h3 className="text-base font-black text-gray-900 dark:text-white mt-1 mb-2"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            {m.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{m.body}</p>
                        </div>
                      </div>

                      {/* Centre dot */}
                      <div className="relative hidden sm:flex items-center justify-center flex-shrink-0 w-11 h-11">
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center
                          shadow-[0_0_0_4px_rgba(59,130,246,0.2)]">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Spacer for opposite side */}
                      <div className="flex-1 hidden sm:block" />
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── TEAM / INSTRUCTORS ────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1100px] mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <FadeUp>
              <Label text="The People" />
              <h2 className="text-4xl sm:text-5xl font-black leading-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Instructors who{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  actually do the work
                </span>
              </h2>
            </FadeUp>
            <FadeIn>
              <Link to="/instructors">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold
                    border border-gray-200 dark:border-white/[0.1]
                    text-gray-700 dark:text-gray-300
                    hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400
                    transition-all whitespace-nowrap">
                  All instructors <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED.map((inst, i) => (
              <FadeUp key={inst.id} delay={i * 0.07}>
                <Link to={`/instructors/${inst.id}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-[22px] bg-white dark:bg-[#0f1623]
                      border border-gray-100 dark:border-white/[0.07]
                      shadow-[0_4px_24px_rgba(0,0,0,0.05)]
                      hover:shadow-[0_0_0_1.5px_rgba(59,130,246,0.3),0_12px_40px_rgba(59,130,246,0.10)]
                      transition-all duration-300 p-5 text-center group">

                    {/* Avatar */}
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                        text-xl font-black text-white ${inst.avatarBg}
                        shadow-[0_6px_20px_rgba(0,0,0,0.2)]
                        group-hover:scale-105 transition-transform duration-300`}>
                        {inst.avatar}
                      </div>
                      {inst.badges.includes("Top Rated") && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400
                          flex items-center justify-center border-2 border-white dark:border-[#0f1623]">
                          <Award className="w-3 h-3 text-amber-900" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-0.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      {inst.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 mb-3 leading-tight line-clamp-2">{inst.title}</p>

                    <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {inst.rating}
                      </span>
                      <span>·</span>
                      <span>{(inst.students / 1000).toFixed(1)}k students</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                      {inst.badges.slice(0, 2).map(b => (
                        <span key={b} className="text-[9px] font-bold px-2 py-0.5 rounded-full
                          bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400
                          border border-blue-100 dark:border-blue-800/50">
                          {b}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── NUMBERS BAND ──────────────────────────────────────────────────── */}
        <section className="py-20 overflow-hidden">
          <div className="max-w-[1100px] mx-auto px-5">
            <FadeIn className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: fmtBig(totalStudents),      label: "Lives changed",           color: "text-blue-600 dark:text-blue-400"    },
                { value: "₦1B+",                     label: "Paid to instructors",     color: "text-emerald-600 dark:text-emerald-400" },
                { value: "4.8★",                     label: "Average course rating",   color: "text-amber-500"                      },
                { value: "38+",                      label: "Countries represented",   color: "text-violet-600 dark:text-violet-400" },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex flex-col items-center">
                  <p className={`text-4xl sm:text-5xl font-black ${color} mb-2`}
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </FadeIn>
          </div>
        </section>

        <Divider />

        {/* ── CONTACT / LOCATION ────────────────────────────────────────────── */}
        <section className="py-24 max-w-[1100px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <FadeUp>
              <Label text="Get in Touch" />
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                We'd love to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  hear from you
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed mb-8">
                Whether you're a student with a question, an instructor who wants to partner with us,
                or a company interested in our enterprise programmes — our team is ready.
              </p>

              <div className="flex flex-col gap-4">
                {[
                  { icon: MapPin, label: "Headquarters", value: "Plot 44, Victoria Island, Lagos, Nigeria"  },
                  { icon: Mail,   label: "General enquiries", value: "hello@ggecl.io"     },
                  { icon: Mail,   label: "Instructor partnerships", value: "teach@ggecl.io" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 p-4 rounded-2xl
                    bg-white dark:bg-[#0f1623]
                    border border-gray-100 dark:border-white/[0.07]
                    shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30
                      flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* CTA card */}
            <FadeUp delay={0.1}>
              <div className="relative rounded-[28px] overflow-hidden
                bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
                p-8 shadow-[0_24px_80px_rgba(59,130,246,0.3)]">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 blur-3xl" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    Want to teach on GGECL?
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-7">
                    Join our growing community of instructors earning from their expertise.
                    We handle the platform. You focus on teaching.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/instructor/login">
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold
                          bg-white text-blue-700
                          shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all">
                        Apply to Teach <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <Link to="/courses">
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold
                          bg-white/15 border border-white/30 text-white
                          hover:bg-white/25 transition-all">
                        Browse Courses
                      </motion.button>
                    </Link>
                  </div>

                  {/* Mini stats */}
                  <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-center">
                    {[
                      { value: "₦1B+",  label: "Paid out" },
                      { value: totalInstructors + "+", label: "Partners" },
                      { value: "38+",   label: "Countries" },
                    ].map(({ value, label }) => (
                      <div key={label}>
                        <p className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="pb-24 max-w-[1100px] mx-auto px-5">
          <FadeUp>
            <div className="relative rounded-[32px] overflow-hidden text-center py-20 px-8
              bg-gradient-to-br from-gray-50 to-blue-50/30
              dark:from-[#0f1623] dark:to-[#0a1428]
              border border-gray-100 dark:border-white/[0.07]
              shadow-[0_8px_40px_rgba(0,0,0,0.05)]">
              {/* Glow orbs */}
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-violet-400/10 blur-3xl" />
              <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle, #1a6ef7 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10">
                <Label text="Ready to start?" />
                <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  Your next chapter{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    starts today
                  </span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 text-[15px]">
                  Join {fmtBig(totalStudents)} learners already on GGECL. Browse {totalCourses}+ courses across {totalCategories} categories — free to explore, built to transform.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link to="/courses">
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold
                        bg-gradient-to-br from-blue-600 to-blue-700
                        text-white shadow-[0_8px_28px_rgba(59,130,246,0.45)]
                        transition-all">
                      Start Learning Free <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link to="/instructors">
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold
                        border border-gray-200 dark:border-white/[0.1]
                        text-gray-700 dark:text-gray-300
                        hover:border-blue-300 hover:text-blue-600
                        transition-all">
                      Meet the Instructors
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </section>

      </div>
    </>
  );
}