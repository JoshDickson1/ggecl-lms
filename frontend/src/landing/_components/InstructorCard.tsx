// InstructorCard.tsx — shared card used by InstructorsPreview & AllInstructors
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, BookOpen, ArrowUpRight } from "lucide-react";
import { type Instructor, fmt } from "@/data/Instructors";

// Deterministic placeholder photos from UI Faces / DiceBear
const PHOTO_MAP: Record<string, string> = {
  "inst-1": "https://i.pinimg.com/736x/b5/ca/9b/b5ca9b6c98616c7d8465aae596917c76.jpg",
  "inst-2": "https://i.pinimg.com/736x/49/c3/65/49c365435c2566ef0c937d8290a8c034.jpg",
  "inst-3": "https://i.pinimg.com/736x/c2/4d/0d/c24d0d7542ee6be66bf4270123c15df4.jpg",
  "inst-4": "https://i.pinimg.com/736x/35/03/f5/3503f5aa64cbfa3b093dfef99fc9cd4a.jpg",
  "inst-5": "https://i.pinimg.com/736x/a7/95/a9/a795a9be9eb35aebaee821eb1acc653f.jpg",
  "inst-6": "https://i.pinimg.com/1200x/0e/db/f3/0edbf38c0d27da9b9dd4cf8a95c850b7.jpg",
  "inst-7": "https://i.pinimg.com/736x/35/41/ea/3541ea71d49833e5d8f5cb9647348342.jpg",
  "inst-8": "https://i.pinimg.com/1200x/66/c3/31/66c331a7757b9d87397a05c46a678527.jpg",
};

export function InstructorCard({
  instructor,
  index = 0,
}: {
  instructor: Instructor;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const photo = instructor.photo ?? PHOTO_MAP[instructor.id];

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
        transition-shadow duration-300 group"
      style={{
        boxShadow: hovered
          ? "0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)"
          : "0 8px 30px rgba(15,23,42,0.08)",
      }}
    >
      {/* ── Photo area ──────────────────────────────────────────────────── */}
      <div className="relative w-full h-62 overflow-hidden bg-gray-100 dark:bg-white/[0.05]">
        {photo ? (
          <motion.img
            src={photo}
            alt={instructor.name}
            className="w-full h-full object-cover object-top"
            animate={hovered ? { scale: 1.06 } : { scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onError={(e) => {
              // fallback to initials if image fails
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}

        {/* Initials fallback — always rendered but hidden behind image */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl font-black text-white ${instructor.avatarBg}`}
          style={{ zIndex: photo ? -1 : 0 }}
        >
          {instructor.avatar}
        </div>

        {/* Gradient overlay — always subtle, stronger on hover */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: hovered
              ? "linear-gradient(to top, rgba(2,6,24,0.85) 0%, rgba(2,6,24,0.2) 55%, transparent 100%)"
              : "linear-gradient(to top, rgba(2,6,24,0.55) 0%, transparent 60%)",
          }}
          transition={{ duration: 0.35 }}
        />

        {/* Badges — top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {instructor.badges.slice(0, 2).map((b) => (
            <span
              key={b}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide
                bg-blue-600/90 backdrop-blur-sm text-white
                shadow-[0_2px_8px_rgba(59,130,246,0.4)]"
            >
              {b}
            </span>
          ))}
        </div>

        {/* Online dot */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-black/30 backdrop-blur-sm text-[10px] font-semibold text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        </div>

        {/* Name over photo — always visible */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white font-black text-base leading-tight drop-shadow-lg">
            {instructor.name}
          </p>
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1 drop-shadow">
            {instructor.title}
          </p>
        </div>
      </div>

      {/* ── Static info (always visible) ────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-gray-800 dark:text-white">{instructor.rating}</span>
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

      {/* ── Hover-revealed info ──────────────────────────────────────────── */}
      <AnimatePresence>
  {hovered && (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute bottom-0 left-0 right-0 px-4 py-4
        bg-gradient-to-t from-[#020618]/95 via-[#020618]/80 to-transparent
        backdrop-blur-sm"
    >
      <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mb-2">
        {instructor.bio}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {instructor.categoryIds.slice(0, 3).map((c) => (
          <span key={c} className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize
            bg-white/10 border border-white/20 text-white/70">
            {c}
          </span>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* ── CTA footer ──────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 mt-auto">
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