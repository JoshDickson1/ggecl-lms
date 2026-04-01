import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { instructors } from "@/data/Instructors";
import { InstructorCard } from "@/landing/_components/InstructorCard";

export default function InstructorsPreview() {
  const preview = instructors.slice(0, 4);

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-[#080c17]">

      {/* subtle blue grid + glow background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.035) 1px, transparent 1px),
            radial-gradient(circle 600px at 100% 10%, rgba(59,130,246,0.07), transparent 60%),
            radial-gradient(circle 500px at 0% 80%, rgba(96,165,250,0.06), transparent 55%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              border border-blue-200 dark:border-blue-900/60
              bg-blue-50 dark:bg-blue-950/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                Learn from the best
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Top{" "}
              <span className="text-blue-600 dark:text-blue-400">Instructors</span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-sm">
              World-class educators with real industry experience, teaching what actually matters.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/instructors"
              className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-full
                bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold
                shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors"
            >
              Meet all instructors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* 4-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {preview.map((inst, i) => (
            <InstructorCard key={inst.id} instructor={inst} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}