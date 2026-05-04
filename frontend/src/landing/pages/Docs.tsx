import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, GraduationCap, Users, Zap, Video,
  ClipboardList, MessageSquare, Bell, ChevronDown,
  PanelBottomOpen, X, BookMarked,
  PlayCircle, Award, Star, ShoppingCart, Lock,
  TrendingUp, CheckCircle, Flame, BarChart2, Layers,
  FileText, UserCheck, PlusCircle, Eye, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Active tab style mirrors the student sidebar exactly
const ACTIVE = "bg-gradient-to-br from-blue-500 to-blue-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]";
const IDLE   = "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-300";

// ── Sidebar sections ─────────────────────────────────────────────────────────
const NAV = [
  { id: "overview",      label: "Overview",              icon: BookOpen    },
  { id: "roles",         label: "Who Is This For",        icon: Users       },
  { id: "courses",       label: "Courses",               icon: BookMarked  },
  { id: "progress",      label: "Progress and XP",       icon: Zap         },
  { id: "live",          label: "Live Classes",           icon: Video       },
  { id: "assignments",   label: "Assignments and Grades", icon: ClipboardList },
  { id: "discussions",   label: "Chat and Discussions",   icon: MessageSquare },
  { id: "notifications", label: "Notifications",          icon: Bell        },
];

// ── Scroll helper ─────────────────────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Sidebar nav list ──────────────────────────────────────────────────────────
function SidebarNav({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-3">
      {NAV.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => { onPick(id); scrollTo(id); }}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl text-[12.5px] font-semibold transition-all duration-200 text-left",
              isActive ? ACTIVE : IDLE,
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0",
              isActive ? "bg-blue-800 text-white" : "bg-white/70 dark:bg-white/[0.08]",
            )}>
              <Icon className="w-[14px] h-[14px]" />
            </div>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// ── Sidebar shell ─────────────────────────────────────────────────────────────
function SidebarShell({ active, onPick, onClose }: {
  active: string;
  onPick: (id: string) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white/90 dark:bg-[#080d18]/95 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-black text-gray-900 dark:text-white leading-none">GGECL</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Guide</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarNav active={active} onPick={(id) => { onPick(id); onClose?.(); }} />
      </div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ id, icon: Icon, children }: { id: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-4 scroll-mt-[100px]">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-[20px] font-black text-gray-900 dark:text-white">{children}</h2>
    </div>
  );
}

// ── Plain-text paragraph ──────────────────────────────────────────────────────
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-400 mb-4">{children}</p>;
}

// ── Feature row ───────────────────────────────────────────────────────────────
function FeatureRow({ icon: Icon, title, desc, color = "blue" }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color?: "blue" | "purple" | "green" | "amber";
}) {
  const colors = {
    blue:   "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    green:  "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    amber:  "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", colors[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[13.5px] font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Collapsible role card ─────────────────────────────────────────────────────
function RoleCard({ icon: Icon, title, badgeLabel, badgeClass, defaultOpen, children }: {
  icon: React.ElementType;
  title: string;
  badgeLabel: string;
  badgeClass: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] overflow-hidden bg-white dark:bg-white/[0.02] mb-4">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-bold text-gray-900 dark:text-white">{title}</span>
          <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full", badgeClass)}>{badgeLabel}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-white/[0.05] pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Info card ─────────────────────────────────────────────────────────────────
function InfoCard({ icon: Icon, title, desc, accent = "blue" }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent?: "blue" | "purple" | "green" | "amber";
}) {
  const accents = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-950/20",   icon: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",   border: "border-blue-100 dark:border-blue-900/30" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/20", icon: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400", border: "border-purple-100 dark:border-purple-900/30" },
    green:  { bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-900/30" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-950/20",  icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",   border: "border-amber-100 dark:border-amber-900/30" },
  };
  const a = accents[accent];
  return (
    <div className={cn("rounded-2xl border p-4 flex items-start gap-3", a.bg, a.border)}>
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", a.icon)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[13.5px] font-bold text-gray-900 dark:text-white mb-0.5">{title}</p>
        <p className="text-[12.5px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── XP table ──────────────────────────────────────────────────────────────────
function XPTable() {
  const rows = [
    [0, "Just starting out"],
    [1, "450 XP"],
    [2, "700 XP"],
    [3, "1,000 XP"],
    [4, "1,200 XP"],
    [5, "1,500 XP"],
    [6, "1,900 XP"],
    [7, "2,400 XP"],
    [8, "3,000 XP"],
    [9, "3,750 XP (max level)"],
  ];
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] overflow-hidden">
      <div className="grid grid-cols-2 bg-gray-50 dark:bg-white/[0.03] px-4 py-2.5 border-b border-gray-200 dark:border-white/[0.06]">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Level</span>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">XP Required</span>
      </div>
      {rows.map(([level, xp]) => (
        <div key={level} className="grid grid-cols-2 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.04] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
          <span className="text-[13px] font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-[10px] text-white font-bold">{level}</span>
          </span>
          <span className="text-[13px] text-gray-600 dark:text-gray-400">{xp}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main docs content ─────────────────────────────────────────────────────────
function DocsContent() {
  return (
    <div className="max-w-[980px] mx-auto px-5 lg:px-8 py-8 md:py-10 space-y-14">

      {/* Overview */}
      <section>
        <SectionHeading id="overview" icon={BookOpen}>Overview</SectionHeading>
        <P>
          GGECL is an online learning platform where students build skills and instructors share knowledge. This guide explains how every part of the platform works, in plain language, no technical background needed.
        </P>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard icon={GraduationCap} title="For Students" desc="Browse courses, learn at your own pace, earn XP, get certificates, and connect with instructors." accent="blue" />
          <InfoCard icon={Layers} title="For Instructors" desc="Create courses, upload your content, track how students are doing, and host live sessions." accent="purple" />
        </div>
      </section>

      {/* Roles */}
      <section>
        <SectionHeading id="roles" icon={Users}>Who Is This For</SectionHeading>
        <P>There are two types of users on GGECL. Each has their own dashboard and set of tools.</P>

        {/* Student (open first) */}
        <RoleCard
          icon={GraduationCap}
          title="Students"
          badgeLabel="Learner"
          badgeClass="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          defaultOpen={true}
        >
          <div className="mt-2">
            <FeatureRow icon={BookMarked} title="Browse and join courses" desc="Explore a full catalog of published courses. Filter by topic, level, or price. Enroll with one click." color="blue" />
            <FeatureRow icon={PlayCircle} title="Watch lessons" desc="Lessons unlock one by one as you progress. Each lesson must be mostly watched before the next one opens." color="blue" />
            <FeatureRow icon={TrendingUp} title="Track your progress" desc="See how far along you are in each course. Your progress saves automatically while you watch." color="green" />
            <FeatureRow icon={Zap} title="Earn XP and level up" desc="You earn 45 XP each time you complete a lesson. Enough XP and you move up to the next level, from 0 all the way to 9." color="amber" />
            <FeatureRow icon={Flame} title="Keep your streak alive" desc="Learn every day to build a learning streak. Miss a day and it resets, so keep at it." color="amber" />
            <FeatureRow icon={Award} title="Get certified" desc="Finish a course and receive a certificate you can share and download." color="green" />
            <FeatureRow icon={Video} title="Join live classes" desc="Attend scheduled live sessions hosted by instructors, in real time." color="purple" />
            <FeatureRow icon={ClipboardList} title="Submit assignments" desc="Upload your work for assignments set by your instructor. View your grades and feedback once marked." color="blue" />
            <FeatureRow icon={MessageSquare} title="Message your instructor" desc="Use the discussions area to ask questions or have conversations with your instructor." color="green" />
            <FeatureRow icon={ShoppingCart} title="Cart and wishlist" desc="Add courses to your cart to purchase, or save them to your wishlist for later." color="blue" />
            <FeatureRow icon={Bell} title="Stay notified" desc="Get alerts when new announcements are posted, grades are released, or assignments are due." color="amber" />
          </div>
        </RoleCard>

        {/* Instructor (closed initially) */}
        <RoleCard
          icon={Layers}
          title="Instructors"
          badgeLabel="Educator"
          badgeClass="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
          defaultOpen={false}
        >
          <div className="mt-2">
            <FeatureRow icon={PlusCircle} title="Create courses" desc="Build a course from scratch. Add a title, description, price, cover image, and intro video." color="purple" />
            <FeatureRow icon={Layers} title="Organize with sections and lessons" desc="Structure your course into sections, each containing individual lessons. Control the order students learn in." color="purple" />
            <FeatureRow icon={FileText} title="Upload lesson materials" desc="Attach videos, PDFs, audio files, or links to any lesson for students to access." color="blue" />
            <FeatureRow icon={Eye} title="Publish or archive" desc="Courses start as drafts. When ready, publish them so students can find and enroll. Archive to hide a course without deleting it." color="green" />
            <FeatureRow icon={UserCheck} title="See your students" desc="View who has enrolled in your courses and browse individual student profiles." color="blue" />
            <FeatureRow icon={BarChart2} title="Track engagement" desc="See how much time students spend watching your lessons and which courses are most popular." color="green" />
            <FeatureRow icon={ClipboardList} title="Create and grade assignments" desc="Post assignments with instructions and deadlines. Review what students submit and post grades with feedback." color="amber" />
            <FeatureRow icon={Star} title="Read student reviews" desc="See what students think of your courses through their ratings and written reviews." color="amber" />
            <FeatureRow icon={Video} title="Host live sessions" desc="Start a live video session from your dashboard and invite students to join in real time." color="purple" />
            <FeatureRow icon={MessageSquare} title="Discussion board" desc="Engage with students through the discussions area. Answer questions and keep conversations going." color="blue" />
          </div>
        </RoleCard>
      </section>

      {/* Courses */}
      <section>
        <SectionHeading id="courses" icon={BookMarked}>Courses</SectionHeading>
        <P>Courses are the heart of GGECL. Each course is made up of sections, and each section has lessons. Here is how it all works.</P>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <InfoCard icon={BookOpen} title="Browsing" desc="Anyone can browse published courses without an account. Filter by difficulty, topic, or price to find the right fit." accent="blue" />
          <InfoCard icon={CheckCircle} title="Enrolling" desc="Once you have an account, click enroll on any published course. Paid courses go through the checkout flow first." accent="green" />
          <InfoCard icon={Lock} title="Lesson locking" desc="Lessons unlock sequentially. You need to watch most of each lesson before the next one opens, keeping learning structured." accent="amber" />
          <InfoCard icon={PlayCircle} title="Preview lessons" desc="Some lessons are marked as free previews. Anyone can watch these before deciding to enroll." accent="purple" />
        </div>
        <P>Course materials can include video, PDF documents, audio files, and external links. Instructors can attach multiple materials to a single lesson.</P>
      </section>

      {/* Progress and XP */}
      <section>
        <SectionHeading id="progress" icon={Zap}>Progress and XP</SectionHeading>
        <P>Learning on GGECL is gamified to keep you motivated. Progress is tracked automatically, and you earn XP as you complete lessons.</P>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <InfoCard icon={TrendingUp} title="Automatic progress tracking" desc="Your video progress saves as you watch. A lesson counts as complete once you have watched at least 80 percent of it." accent="blue" />
          <InfoCard icon={Flame} title="Daily streaks" desc="Watch at least one lesson per day to maintain your streak. Your longest streak is always saved, so you can try to beat your personal best." accent="amber" />
          <InfoCard icon={Zap} title="Earning XP" desc="You earn 45 XP for every lesson you complete. XP adds up over time and pushes you to higher levels." accent="green" />
          <InfoCard icon={BarChart2} title="Your dashboard" desc="The progress dashboard gives you a full picture: watch time this month, weekly activity, completed courses, and your streak." accent="purple" />
        </div>
        <p className="text-[14px] font-bold text-gray-900 dark:text-white mb-3">Level thresholds</p>
        <XPTable />
      </section>

      {/* Live Classes */}
      <section>
        <SectionHeading id="live" icon={Video}>Live Classes</SectionHeading>
        <P>Instructors can host live video sessions directly on the platform. Students join from the Live Classes section of their dashboard.</P>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard icon={Calendar} title="Scheduled sessions" desc="Live classes are listed in the lobby. Browse upcoming sessions and join when they go live." accent="blue" />
          <InfoCard icon={Video} title="Real-time interaction" desc="Attend live, ask questions, and engage directly with your instructor during the session." accent="purple" />
        </div>
      </section>

      {/* Assignments and Grades */}
      <section>
        <SectionHeading id="assignments" icon={ClipboardList}>Assignments and Grades</SectionHeading>
        <P>Assignments let instructors set tasks for students to complete. Grades and feedback are posted once the instructor has reviewed the submission.</P>
        <div className="space-y-3">
          <InfoCard icon={FileText} title="Submitting work" desc="Find your assignment in the Assignments section of your dashboard. Upload your file before the deadline and submit." accent="blue" />
          <InfoCard icon={CheckCircle} title="Viewing grades" desc="Once your instructor marks your submission, your grade and any written feedback appear in the Grades section." accent="green" />
          <InfoCard icon={ClipboardList} title="For instructors" desc="Instructors see all submissions for each assignment and can leave a grade and written comments for each student." accent="purple" />
        </div>
      </section>

      {/* Discussions */}
      <section>
        <SectionHeading id="discussions" icon={MessageSquare}>Chat and Discussions</SectionHeading>
        <P>Every user on the platform has access to a real-time messaging area. Use it to ask questions, get help, or stay in touch with your instructor or students.</P>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard icon={MessageSquare} title="Messaging" desc="Send and receive messages in real time. Conversations are organised by contact so nothing gets lost." accent="blue" />
          <InfoCard icon={FileText} title="Attachments" desc="You can attach images, PDFs, videos, audio, and other files directly in a conversation." accent="green" />
        </div>
      </section>

      {/* Notifications */}
      <section>
        <SectionHeading id="notifications" icon={Bell}>Notifications</SectionHeading>
        <P>The platform keeps you in the loop with notifications so you never miss something important.</P>
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] overflow-hidden">
          {[
            { icon: Bell,         title: "New announcements",   desc: "When the platform posts a new announcement, all users are notified." },
            { icon: CheckCircle,  title: "Grade posted",        desc: "Students get notified as soon as an instructor marks their assignment." },
            { icon: ClipboardList, title: "Assignment due soon", desc: "A reminder goes out when an assignment deadline is approaching." },
            { icon: Video,        title: "Live class starting",  desc: "Get a heads-up before a live session you are enrolled in goes live." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-gray-900 dark:text-white">{title}</p>
                <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <P>All your notifications are collected in the Notifications page of your dashboard so you can review them any time.</P>
      </section>

      <div className="h-16" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const Docs = () => {
  const [active,       setActive]       = useState("overview");
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [showTrigger,  setShowTrigger]  = useState(true);

  // Track active section on scroll
  useEffect(() => {
    const ids = NAV.map(n => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter(e => e.isIntersecting);
        if (hit.length) {
          const top = hit.reduce((a, b) => a.boundingClientRect.top < b.boundingClientRect.top ? a : b);
          setActive(top.target.id);
        }
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 },
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Hide mobile trigger when the page footer enters the viewport
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowTrigger(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(footer);
    return () => obs.disconnect();
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#080d18] pt-[88px]">

      {/*
        Flex row: sidebar + content sit side-by-side in the document flow.
        The sidebar uses `sticky` so it scrolls with the page but doesn't
        go below the bottom of this flex container (i.e. it disappears
        naturally before the footer, never overlapping it).
      */}
      <div className="flex items-start">

        {/* Desktop sidebar: sticky, not fixed — stops at the container bottom */}
        <aside className="hidden lg:flex flex-col sticky top-[112px] ml-[120px] w-[280px] flex-shrink-0 rounded-[20px] overflow-hidden
          max-h-[calc(100vh-104px)]
          bg-white/90 dark:bg-[#080d18]/95 backdrop-blur-2xl
          border border-gray-200/50 dark:border-white/[0.07]
          shadow-[0_8px_40px_rgba(0,0,0,0.10)] mb-2">
          <SidebarShell active={active} onPick={setActive} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <DocsContent />
        </main>

      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[101]"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={false}
        animate={{ x: drawerOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="lg:hidden fixed top-0 left-0 bottom-0 w-[272px] z-[102] rounded-r-[24px] overflow-hidden shadow-2xl"
      >
        <SidebarShell active={active} onPick={setActive} onClose={() => setDrawerOpen(false)} />
      </motion.aside>

      {/* Mobile floating trigger — fades out before the footer */}
      <AnimatePresence>
        {showTrigger && !drawerOpen && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50
              flex items-center gap-2 px-5 py-3 rounded-full
              bg-gradient-to-br from-blue-500 to-blue-900
              text-white text-[13px] font-bold
              shadow-[0_8px_28px_rgba(26,110,247,0.45)]
              hover:shadow-[0_12px_36px_rgba(26,110,247,0.55)] transition-shadow"
            aria-label="Open navigation"
          >
            <PanelBottomOpen className="w-4 h-4" />
            Browse sections
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Docs;
