// src/landing/_components/InstructorCard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, BookOpen, ArrowUpRight } from "lucide-react";
import { type Instructor, fmt } from "@/data/Instructors";

export function InstructorCard({
  instructor,
  index = 0,
}: {
  instructor: Instructor;
  index?: number;
}) {
  const [hovered, setHovered]   = useState(false);
  const [imgError, setImgError] = useState(false);
  const showPhoto                = !!instructor.photo && !imgError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.32, delay: index * 0.045 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col rounded-[24px] overflow-hidden cursor-pointer
        bg-white/70 dark:bg-[#020618]
        backdrop-blur-xl
        border border-white/80 dark:border-white/[0.08]
        transition-shadow duration-300 w-full mx-auto"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)"
          : "0 8px 30px rgba(15,23,42,0.08)",
      }}
    >
      {/* ── Image area ───────────────────────────────────────────────── */}
      <div className="relative w-full h-64 overflow-hidden flex-shrink-0">

        {/* Initials bg */}
        <div className={`absolute inset-0 flex items-center justify-center ${instructor.avatarBg}`}>
          <span className="text-6xl font-black text-white/30 select-none">
            {instructor.avatar}
          </span>
        </div>

        {/* Photo */}
        {showPhoto && (
          <motion.img
            src={instructor.photo}
            alt={instructor.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            animate={hovered ? { scale: 1.06 } : { scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onError={() => setImgError(true)}
          />
        )}

        {/* Always-on gradient so name is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Available pill */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-black/30 backdrop-blur-sm text-[10px] font-semibold text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        </div>

        {/* Badges */}
        {instructor.badges.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {instructor.badges.slice(0, 2).map((b) => (
              <span key={b}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide
                  bg-blue-600/90 backdrop-blur-sm text-white
                  shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* ── Bottom panel: bio (hover) + name (always) ─────────────── */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">

          {/* Bio — expands above the name on hover */}
          <AnimatePresence>
            {hovered && instructor.bio && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="overflow-hidden mb-2.5"
              >
                <p className="text-[11px] text-white/85 leading-relaxed line-clamp-3">
                  {instructor.bio}
                </p>
                {instructor.categoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {instructor.categoryIds.slice(0, 3).map((c) => (
                      <span key={c}
                        className="px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize
                          bg-white/10 border border-white/20 text-white/70">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name — always visible, part of the same panel */}
          <p className="text-white font-black text-sm leading-tight drop-shadow-lg truncate">
            {instructor.name}
          </p>
          <p className="text-white/65 text-[11px] mt-0.5 truncate">
            {instructor.title}
          </p>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-3.5 pb-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-gray-800 dark:text-white">
            {instructor.rating > 0 ? instructor.rating : "New"}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          {fmt(instructor.students)}
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" />
          {instructor.courses} courses
        </span>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 mt-auto">
        <Link to={`/instructors/${instructor.id}`} onClick={(e) => e.stopPropagation()}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-[0_4px_14px_rgba(59,130,246,0.35)]
              transition-colors duration-200"
          >
            View Profile
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}