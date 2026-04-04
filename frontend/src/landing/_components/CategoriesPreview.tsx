import { motion, useAnimationFrame } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { categories, type Category } from "@/data/categories";
import { Link } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

// ─── Single card ─────────────────────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex-shrink-0 w-[320px] rounded-[22px] p-6 flex flex-col gap-4 cursor-pointer
        bg-white/70 dark:bg-[#020618]
        backdrop-blur-xl
        border border-white/80 dark:border-white/[0.08]
        transition-shadow duration-300"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)"
          : "0 8px 30px rgba(15,23,42,0.08)",
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* Hover glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[22px] z-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 70%)",
        }}
      />

      {/* Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
        <motion.div
          animate={hovered ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>

      {/* Title + courses */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {category.title}
        </h3>
        <p className="text-sm mt-0.5">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {category.courses}
          </span>
          <span className="text-gray-400 dark:text-gray-500"> courses available</span>
        </p>
      </div>

      {/* Popularity bar */}
      <div className="relative z-10">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
          <span>Popularity</span>
          <span>{category.popularity}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${category.popularity}%` }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="relative z-10 flex flex-wrap gap-2">
        {category.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs font-semibold
              border border-gray-200 dark:border-white/[0.10]
              text-gray-600 dark:text-gray-300
              bg-gray-50 dark:bg-white/[0.04]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="relative z-10 h-px bg-gray-100 dark:bg-white/[0.06]" />

      {/* Bottom: students + arrow */}
      <div className="relative z-10 flex items-center gap-3 mt-auto">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl
          bg-gray-50 dark:bg-white/[0.04]
          border border-gray-100 dark:border-white/[0.07]">
          <div className="flex -space-x-2">
            {category.students_avatars.map((av, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full text-[10px] font-bold text-white
                  flex items-center justify-center
                  border-2 border-white dark:border-[#020618]
                  ${av.bg}`}
              >
                {av.initials}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatStudents(category.students)} students
          </span>
        </div>

        <Link to={`/categories/${category.id}`} onClick={(e) => e.stopPropagation()}>
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500
              transition-colors flex items-center justify-center flex-shrink-0
              shadow-[0_4px_14px_rgba(59,130,246,0.4)]"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Marquee row (pauses on hover) ───────────────────────────────────────────
function MarqueeRow({
  items,
  reverse = false,
  speed = 28,
}: {
  items: Category[];
  reverse?: boolean;
  speed?: number;
}) {
  const x = useRef(0);
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);
  const doubled = [...items, ...items];
  const cardW = 320 + 20; // card width + gap
  const totalW = items.length * cardW;

  useAnimationFrame((_, delta) => {
    if (paused) return;
    const dir = reverse ? 1 : -1;
    x.current += dir * (speed / 1000) * delta;
    if (x.current <= -totalW) x.current += totalW;
    if (x.current >= 0) x.current -= totalW;
    setPos(x.current);
  });

  return (
    <div
      className="overflow-hidden w-full py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-5"
        style={{ transform: `translateX(${pos}px)`, willChange: "transform" }}
      >
        {doubled.map((cat, i) => (
          <CategoryCard key={`${cat.id}-${i}`} category={cat} />
        ))}
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function CategoriesPreview() {
  const row1 = categories.slice(0, 6);
  const row2 = categories.slice(6, 12);

  return (
    <section className="relative py-20 overflow-hidden bg-gray-50/50 dark:bg-[#080d18]">

      {/* subtle blue grid + glow background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
            radial-gradient(circle 600px at 0% 10%, rgba(59,130,246,0.08), transparent 60%),
            radial-gradient(circle 500px at 100% 0%, rgba(96,165,250,0.07), transparent 55%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* 20% fade masks — left & right, light/dark aware */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20"
        style={{
          width: "20%",
          background:
            "linear-gradient(to right, var(--section-bg, #f9fafb) 20%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-20"
        style={{
          width: "20%",
          background:
            "linear-gradient(to left, var(--section-bg, #f9fafb) 20%, transparent 100%)",
        }}
      />

      {/* Header — sits above the masks */}
      <div className="relative z-30 max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              border border-blue-200 dark:border-blue-900/60
              bg-blue-50 dark:bg-blue-950/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                Browse by field
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Top{" "}
              <span className="text-blue-600 dark:text-blue-400">Categories</span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-sm">
              Find your perfect learning path across our most popular disciplines.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/categories"
              className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-full
                bg-blue-600 hover:bg-blue-500
                text-white text-sm font-semibold
                shadow-[0_4px_20px_rgba(59,130,246,0.4)]
                transition-colors duration-200"
            >
              Explore all categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Marquee rows — behind masks (z-10), full bleed */}
      <div className="relative z-10 flex flex-col gap-5">
        <MarqueeRow items={row1} reverse={false} speed={28} />
        <MarqueeRow items={row2} reverse={true} speed={22} />
      </div>

      {/* CSS custom property for the mask gradient — matches bg in light & dark */}
      <style>{`
        :root       { --section-bg: #f9fafb; }
        .dark       { --section-bg: #080d18; }
      `}</style>
    </section>
  );
}