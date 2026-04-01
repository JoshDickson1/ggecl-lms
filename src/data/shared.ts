// ─── Shared across all three dashboard layouts ────────────────────────────────
// Put this at: src/dashboards/shared/dashboardShared.ts

export type Role = "admin" | "instructor" | "student";

export const ROLE_ROOT: Record<Role, string> = {
  admin:      "/dashboard",
  instructor: "/instructor",
  student:    "/student",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin:      "Administrator",
  instructor: "Instructor",
  student:    "Student",
};

// ─── Accent palette per role ──────────────────────────────────────────────────
export function getAccent(role: Role) {
  switch (role) {
    case "admin": return {
      activeBg:   "bg-gradient-to-r from-blue-600 to-blue-500",
      activeText: "text-white",
      activeIcon: "bg-white/20",
      hoverBg:    "hover:bg-blue-50 dark:hover:bg-blue-950/30",
      hoverText:  "hover:text-blue-700 dark:hover:text-blue-300",
      idleBg:     "bg-gray-100 dark:bg-white/[0.05]",
      idleText:   "text-gray-700 dark:text-gray-300",
      badge:      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
      logoBg:     "from-blue-600 via-blue-700 to-indigo-700",
      ring:       "ring-blue-200/60 dark:ring-blue-500/30",
      pill:       "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      border:     "border-blue-100 dark:border-blue-900/40",
      dot:        "bg-emerald-400",
      shadow:     "shadow-[0_4px_14px_rgba(59,130,246,0.28)]",
      roleColor:  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      accentHex:  "59,130,246",
    };
    case "instructor": return {
      activeBg:   "bg-gradient-to-r from-indigo-600 to-blue-500",
      activeText: "text-white",
      activeIcon: "bg-white/20",
      hoverBg:    "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
      hoverText:  "hover:text-indigo-700 dark:hover:text-indigo-300",
      idleBg:     "bg-gray-100 dark:bg-white/[0.05]",
      idleText:   "text-gray-700 dark:text-gray-300",
      badge:      "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
      logoBg:     "from-indigo-600 via-indigo-700 to-blue-700",
      ring:       "ring-indigo-200/60 dark:ring-indigo-500/30",
      pill:       "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
      border:     "border-indigo-100 dark:border-indigo-900/40",
      dot:        "bg-emerald-400",
      shadow:     "shadow-[0_4px_14px_rgba(99,102,241,0.28)]",
      roleColor:  "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
      accentHex:  "99,102,241",
    };
    case "student": return {
      activeBg:   "bg-gradient-to-r from-blue-600 to-cyan-500",
      activeText: "text-white",
      activeIcon: "bg-white/20",
      hoverBg:    "hover:bg-blue-50 dark:hover:bg-blue-950/30",
      hoverText:  "hover:text-blue-700 dark:hover:text-blue-300",
      idleBg:     "bg-gray-100 dark:bg-white/[0.05]",
      idleText:   "text-gray-700 dark:text-gray-300",
      badge:      "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
      logoBg:     "from-blue-600 via-blue-500 to-cyan-500",
      ring:       "ring-blue-200/60 dark:ring-blue-500/30",
      pill:       "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
      border:     "border-cyan-100 dark:border-cyan-900/40",
      dot:        "bg-emerald-400",
      shadow:     "shadow-[0_4px_14px_rgba(6,182,212,0.28)]",
      roleColor:  "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
      accentHex:  "6,182,212",
    };
  }
}

export type Accent = ReturnType<typeof getAccent>;