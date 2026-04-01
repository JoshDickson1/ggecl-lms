// src/dashboards/admin/shared/UserManagementBase.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  UserX,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Filter,
  UserCheck,
  Mail,
  ShieldCheck,
  GraduationCap,
  Users,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "instructor" | "admin";

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: "Male" | "Female" | "Other";
  status: "Active" | "Inactive" | "Suspended";
  createdAt: Date;
  // role-specific extras
  enrollments?: number;   // student
  courses?: number;       // instructor
  permissions?: string;   // admin
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seed = (role: UserRole): ManagedUser[] => {
  const base = [
    { firstName: "Olusegun", lastName: "Adewale", email: "olu@ggecl.io", gender: "Male" as const, status: "Active" as const, daysAgo: 2 },
    { firstName: "Mei-Ling", lastName: "Chen", email: "mei@ggecl.io", gender: "Female" as const, status: "Active" as const, daysAgo: 5 },
    { firstName: "Tobias", lastName: "Richter", email: "tobias@ggecl.io", gender: "Male" as const, status: "Inactive" as const, daysAgo: 10 },
    { firstName: "Amara", lastName: "Osei", email: "amara@ggecl.io", gender: "Female" as const, status: "Active" as const, daysAgo: 14 },
    { firstName: "Luca", lastName: "Ferreira", email: "luca@ggecl.io", gender: "Male" as const, status: "Suspended" as const, daysAgo: 21 },
    { firstName: "Yuki", lastName: "Tanaka", email: "yuki@ggecl.io", gender: "Female" as const, status: "Active" as const, daysAgo: 30 },
  ];
  return base.map((u, i) => ({
    id: `${role}-${i + 1}`,
    ...u,
    createdAt: new Date(Date.now() - u.daysAgo * 86_400_000),
    ...(role === "student" ? { enrollments: Math.floor(Math.random() * 6) + 1 } : {}),
    ...(role === "instructor" ? { courses: Math.floor(Math.random() * 8) + 1 } : {}),
    ...(role === "admin" ? { permissions: ["Full Access", "Read Only", "Moderator"][i % 3] } : {}),
  }));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleConfig = {
  student: {
    label: "Student",
    plural: "Students",
    icon: GraduationCap,
    color: "text-blue-600 dark:text-blue-400",
    accent: "from-blue-600 to-indigo-700",
    badge: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40",
    actions: ["View Profile", "Unenroll", "Suspend", "Reset Password", "Delete"],
  },
  instructor: {
    label: "Instructor",
    plural: "Instructors",
    icon: Users,
    color: "text-violet-600 dark:text-violet-400",
    accent: "from-violet-600 to-purple-700",
    badge: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/40",
    actions: ["View Profile", "Deactivate", "Suspend", "Reset Password", "Delete"],
  },
  admin: {
    label: "Admin",
    plural: "Admins",
    icon: ShieldCheck,
    color: "text-rose-600 dark:text-rose-400",
    accent: "from-rose-600 to-pink-700",
    badge: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/40",
    actions: ["View Profile", "Revoke Access", "Edit Permissions", "Reset Password", "Delete"],
  },
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  Inactive: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
};

function initials(u: ManagedUser) {
  return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${className}`}>
      {children}
    </span>
  );
}

function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 2500)}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
        ${type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-rose-600 text-white"}`}
    >
      {type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <p className="text-sm font-semibold">{message}</p>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserManagementBase({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const cfg = roleConfig[role];
  const RoleIcon = cfg.icon;

  // ── State ──
  const [users, setUsers] = useState<ManagedUser[]>(() => seed(role));
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", gender: "" });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
  const [formSuccess, setFormSuccess] = useState(false);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Suspended">("All");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Filtered / sorted data ──
  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((u) => u.status === statusFilter);
    list.sort((a, b) =>
      sortOrder === "newest"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime()
    );
    return list;
  }, [users, search, sortOrder, statusFilter]);

  // ── Form logic ──
  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.gender) errs.gender = "Required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const newUser: ManagedUser = {
      id: `${role}-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      gender: form.gender as ManagedUser["gender"],
      status: "Active",
      createdAt: new Date(),
      ...(role === "student" ? { enrollments: 0 } : {}),
      ...(role === "instructor" ? { courses: 0 } : {}),
      ...(role === "admin" ? { permissions: "Read Only" } : {}),
    };
    setUsers((prev) => [newUser, ...prev]);
    setForm({ firstName: "", lastName: "", email: "", gender: "" });
    setFormErrors({});
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
    setToast({ msg: `${cfg.label} created successfully. Password sent to ${newUser.email}`, type: "success" });
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmDelete(null);
    setOpenMenuId(null);
    setToast({ msg: `${cfg.label} removed.`, type: "success" });
  };

  const handleAction = (action: string, user: ManagedUser) => {
  setOpenMenuId(null);
  
  // ← paste here, as the first check
  if (action === "View Profile") {
    const profilePath =
      role === "student" ? `/admin/student-profile/${user.id}` :
      role === "instructor" ? `/admin/instructor-profile/${user.id}` :
      `/admin/admin-profile/${user.id}`;
    navigate(profilePath);
    return;
  }

  if (action === "Delete") { setConfirmDelete(user.id); return; }
//   if (action === "Suspend") { ... }
  // rest of the existing code...
};

  // ── Extra column header & cell by role ──
  const extraHeader =
    role === "student" ? "Enrollments" :
    role === "instructor" ? "Courses" :
    "Permissions";

  const extraCell = (u: ManagedUser) =>
    role === "student" ? (
      <span className="font-semibold">{u.enrollments ?? 0} course{u.enrollments !== 1 ? "s" : ""}</span>
    ) : role === "instructor" ? (
      <span className="font-semibold">{u.courses ?? 0} course{u.courses !== 1 ? "s" : ""}</span>
    ) : (
      <Badge className={cfg.badge}>{u.permissions}</Badge>
    );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center shadow-md`}>
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {cfg.plural}
            </h1>
            <p className="text-xs text-gray-400">{users.length} total</p>
          </div>
        </div>
      </motion.div>

      {/* ── Create Form ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Plus className={`w-4 h-4 ${cfg.color}`} />
            <h2 className="font-black text-base text-gray-900 dark:text-white">
              Create New {cfg.label}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="e.g. Sarah"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border
                  bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200
                  placeholder:text-gray-400 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${formErrors.firstName ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
              />
              {formErrors.firstName && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="e.g. Mitchell"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border
                  bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200
                  placeholder:text-gray-400 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${formErrors.lastName ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
              />
              {formErrors.lastName && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="sarah@ggecl.io"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border
                  bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200
                  placeholder:text-gray-400 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${formErrors.email ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
              />
              {formErrors.email && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border
                  bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${formErrors.gender ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {formErrors.gender && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.gender}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleCreate}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
                bg-gradient-to-br ${cfg.accent} hover:opacity-90 transition-all shadow-md`}
            >
              <Plus className="w-4 h-4" />
              Create {cfg.label}
            </button>

            <AnimatePresence>
              {formSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Created! Password will be emailed.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* ── Table Section ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${cfg.plural.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border
                  bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.07]
                  text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
              {(["newest", "oldest"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setSortOrder(o)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortOrder === o
                      ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  {o === "newest" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              {(["All", "Active", "Inactive", "Suspended"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? `${s === "All" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" :
                          s === "Active" ? "bg-emerald-600 text-white" :
                          s === "Inactive" ? "bg-gray-500 text-white" :
                          "bg-amber-500 text-white"}`
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {["Name", "Email", "Gender", extraHeader, "Status", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                <AnimatePresence initial={false}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                        No {cfg.plural.toLowerCase()} found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex-shrink-0`}>
                              {initials(user)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                {user.firstName} {user.lastName}
                              </p>
                              <Badge className={cfg.badge}>{cfg.label}</Badge>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5">
                          <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors text-xs">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{user.email}</span>
                          </a>
                        </td>

                        {/* Gender */}
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                          {user.gender}
                        </td>

                        {/* Role-specific column */}
                        <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 text-xs">
                          {extraCell(user)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <Badge className={statusStyles[user.status]}>{user.status}</Badge>
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          {user.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="relative flex items-center gap-2">
                            {/* Quick actions */}
                            <button
                              title="View Profile"
                              onClick={() => navigate(`/admin/${role}s/${user.id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => setConfirmDelete(user.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Dropdown menu */}
                            <AnimatePresence>
                              {openMenuId === user.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-1 z-20 w-48
                                    bg-white dark:bg-[#0f1623] rounded-2xl
                                    border border-gray-100 dark:border-white/[0.08]
                                    shadow-xl overflow-hidden"
                                >
                                  {cfg.actions.map((action) => (
                                    <button
                                      key={action}
                                      onClick={() => handleAction(action, user)}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5
                                        hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors
                                        ${action === "Delete" ? "text-rose-500" :
                                          action === "View Profile" ? "text-blue-500" :
                                          "text-gray-700 dark:text-gray-300"}`}
                                    >
                                      {action === "View Profile" && <Eye className="w-4 h-4" />}
                                      {action === "Delete" && <Trash2 className="w-4 h-4" />}
                                      {(action === "Unenroll" || action === "Deactivate" || action === "Revoke Access") && <UserX className="w-4 h-4" />}
                                      {(action === "Suspend" || action === "Edit Permissions") && <UserCheck className="w-4 h-4" />}
                                      {action === "Reset Password" && <Mail className="w-4 h-4" />}
                                      {action}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-300">{users.length}</span> {cfg.plural.toLowerCase()}
            </p>
            {statusFilter !== "All" || search ? (
              <button
                onClick={() => { setSearch(""); setStatusFilter("All"); }}
                className="text-xs text-blue-500 font-semibold hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </Card>
      </motion.div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-[#0f1623] rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-white/[0.08]"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-black text-center text-gray-900 dark:text-white">
                Delete {cfg.label}?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-5">
                This action cannot be undone. The account and all associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.msg}
            message={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Click-away for dropdown ── */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}