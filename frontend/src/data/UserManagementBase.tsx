// src/dashboards/admin/shared/UserManagementBase.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Trash2, Eye, UserX, MoreHorizontal,
  ChevronUp, ChevronDown, Filter, UserCheck, Mail,
  ShieldCheck, GraduationCap, Users, X,
  CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserService, { UserRole as ApiUserRole } from "@/services/user.service";
import AdminDashboardService from "@/services/admin-dashboard.service";
import { useDashboardUser } from "@/hooks/useDashboardUser";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "instructor" | "admin";

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  gender: "Male" | "Female" | "Other";
  status: "Active" | "Inactive" | "Suspended";
  createdAt: Date;
  enrollments?: number;
  courses?: number;
  permissions?: string;
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  bio?: string | null;
  phone?: string | null;
  createdAt: string;
}

const ROLE_ENUM: Record<UserRole, ApiUserRole> = {
  student:    ApiUserRole.STUDENT,
  instructor: ApiUserRole.INSTRUCTOR,
  admin:      ApiUserRole.ADMIN,
};

function generatePassword(): string {
  const chars  = "abcdefghijklmnopqrstuvwxyz";
  const upper  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const sym    = "!@#$";
  const rand   = (s: string) => s[Math.floor(Math.random() * s.length)];
  return [rand(upper), rand(upper), rand(chars), rand(chars), rand(chars), rand(chars), rand(digits), rand(digits), rand(sym)].join("");
}

function mapApiUser(u: ApiUser, role: UserRole): ManagedUser {
  const [firstName, ...rest] = u.name.split(" ");
  return {
    id:        u.id,
    firstName: firstName || u.name,
    lastName:  rest.join(" ") || "",
    email:     u.email,
    image:     u.image,
    gender:    "Other",
    status:    "Active",
    createdAt: new Date(u.createdAt),
    ...(role === "student"    ? { enrollments: 0 }          : {}),
    ...(role === "instructor" ? { courses: 0 }              : {}),
    ...(role === "admin"      ? { permissions: "Read Only" } : {}),
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const roleConfig = {
  student: {
    label: "Student", plural: "Students",
    icon: GraduationCap,
    color: "text-blue-600 dark:text-blue-400",
    accent: "from-blue-600 to-indigo-700",
    badge: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40",
    actions: ["View Profile", "Unenroll", "Suspend", "Reset Password", "Delete"],
  },
  instructor: {
    label: "Instructor", plural: "Instructors",
    icon: Users,
    color: "text-violet-600 dark:text-violet-400",
    accent: "from-violet-600 to-purple-700",
    badge: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/40",
    actions: ["View Profile", "Deactivate", "Suspend", "Reset Password", "Delete"],
  },
  admin: {
    label: "Admin", plural: "Admins",
    icon: ShieldCheck,
    color: "text-rose-600 dark:text-rose-400",
    accent: "from-rose-600 to-pink-700",
    badge: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/40",
    actions: ["View Profile", "Revoke Access", "Edit Permissions", "Reset Password", "Delete"],
  },
};

const statusStyles: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
};

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];

function initials(u: ManagedUser) {
  return `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
}

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
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
    >
      {type === "success"
        ? <CheckCircle2 className="w-5 h-5" />
        : <AlertTriangle className="w-5 h-5" />
      }
      <p className="text-sm font-semibold">{message}</p>
    </motion.div>
  );
}

// ─── Row actions dropdown ─────────────────────────────────────────────────────
// Rendered via a portal-style fixed-position div so it always floats above the
// table regardless of overflow:hidden on ancestor elements.

function ActionsMenu({
  user, cfg, onAction, onClose,
}: {
  user: ManagedUser;
  cfg: typeof roleConfig[UserRole];
  onAction: (action: string, user: ManagedUser) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full right-0 mt-1 z-50 w-48 bg-white dark:bg-[#0f1623] rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {cfg.actions.map((action) => (
        <button
          key={action}
          onClick={() => { onAction(action, user); onClose(); }}
          className={`w-full px-3 py-2 text-left text-sm font-medium flex items-center gap-2
            hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors
            ${action === "Delete"       ? "text-rose-500"
            : action === "View Profile" ? "text-blue-500"
            : "text-gray-700 dark:text-gray-300"}`}
        >
          {action === "View Profile"                                    && <Eye className="w-4 h-4" />}
          {(action === "Unenroll" || action === "Deactivate" || action === "Revoke Access") && <UserX className="w-4 h-4" />}
          {(action === "Suspend"  || action === "Edit Permissions")     && <UserCheck className="w-4 h-4" />}
          {action === "Reset Password"                                  && <Mail className="w-4 h-4" />}
          {action === "Delete"                                          && <Trash2 className="w-4 h-4" />}
          {action}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserManagementBase({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const cfg      = roleConfig[role];
  const RoleIcon = cfg.icon;
  const qc       = useQueryClient();
  const { user: currentUser } = useDashboardUser();

  // ── Server state ──────────────────────────────────────────────────────────

  const { data: studentStats } = useQuery({
    queryKey: ["admin-student-stats"],
    queryFn:  () => AdminDashboardService.getStudents(),
    enabled:  role === "student",
    staleTime: 1000 * 60 * 5,
  });

  const { data: instructorStats } = useQuery({
    queryKey: ["admin-instructor-stats"],
    queryFn:  () => AdminDashboardService.getInstructors(),
    enabled:  role === "instructor",
    staleTime: 1000 * 60 * 5,
  });

  const { data: rawUsers = [], isLoading, isError } = useQuery<ManagedUser[]>({
    queryKey: ["admin-users", role],
    queryFn: async () => {
      let res: { data?: ApiUser[] } | ApiUser[];

      if (role === "admin") {
        try {
          res = await UserService.findAdmins({ limit: 200 }) as { data?: ApiUser[] } | ApiUser[];
        } catch {
          res = await UserService.findAll({ limit: 200 }) as { data?: ApiUser[] } | ApiUser[];
        }
      } else {
        res = await UserService.findAll({ role: ROLE_ENUM[role], limit: 200 }) as { data?: ApiUser[] } | ApiUser[];
      }

      const list: ApiUser[] = Array.isArray(res) ? res : ((res as { data?: ApiUser[] }).data ?? []);
      return list
        .filter(u => u.role?.toUpperCase() === ROLE_ENUM[role]?.toUpperCase())
        .map(u => mapApiUser(u, role));
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const name     = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const password = generatePassword();
      await UserService.create({ name, email: form.email.trim(), password, role: ROLE_ENUM[role] });
      return password;
    },
    onSuccess: (password) => {
      qc.invalidateQueries({ queryKey: ["admin-users", role] });
      setForm({ firstName: "", lastName: "", email: "", gender: "" });
      setFormErrors({});
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
      setToast({ msg: `${cfg.label} created! Temp password: ${password}`, type: "success" });
    },
    onError: (err: unknown) => {
      const raw = err instanceof Error ? err.message : "";
      const msg = raw.includes("409") || raw.toLowerCase().includes("exist")
        ? "A user with this email already exists."
        : raw || `Failed to create ${cfg.label}.`;
      setToast({ msg, type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UserService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users", role] });
      setConfirmDelete(null);
      setToast({ msg: `${cfg.label} removed.`, type: "success" });
    },
    onError: () => {
      setToast({ msg: `Failed to delete ${cfg.label}.`, type: "error" });
    },
  });

  // ── Local UI state ─────────────────────────────────────────────────────────

  const [form, setForm]           = useState({ firstName: "", lastName: "", email: "", gender: "" });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
  const [formSuccess, setFormSuccess] = useState(false);

  const [search, setSearch]           = useState("");
  const [sortOrder, setSortOrder]     = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Suspended">("All");

  // Menu anchor stores the user id for the open menu
  const [menuAnchor, setMenuAnchor]   = useState<string | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...rawUsers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "All") list = list.filter(u => u.status === statusFilter);
    list.sort((a, b) =>
      sortOrder === "newest"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime(),
    );
    return list;
  }, [rawUsers, search, sortOrder, statusFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.firstName.trim())                           errs.firstName = "Required";
    if (!form.lastName.trim())                            errs.lastName  = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.gender)                                     errs.gender    = "Required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => { if (validate()) createMutation.mutate(); };

  const handleAction = (action: string, user: ManagedUser) => {
    if (action === "View Profile") { navigate(`/admin/${role}s/${user.id}`); return; }
    if (action === "Delete")       { setConfirmDelete(user.id); return; }
    // Other actions (Suspend, Reset Password, etc.) can be wired up as needed
  };

  // ── Column helpers ─────────────────────────────────────────────────────────

  const extraHeader =
    role === "student"    ? "Enrollments" :
    role === "instructor" ? "Courses"     : "Permissions";

  const extraCell = (u: ManagedUser) =>
    role === "student" ? (
      <span className="font-semibold">{u.enrollments ?? 0} course{u.enrollments !== 1 ? "s" : ""}</span>
    ) : role === "instructor" ? (
      <span className="font-semibold">{u.courses ?? 0} course{u.courses !== 1 ? "s" : ""}</span>
    ) : (
      <Badge className={cfg.badge}>{u.permissions}</Badge>
    );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12">

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center shadow-md`}>
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{cfg.plural}</h1>
            <p className="text-xs text-gray-400">{rawUsers.length} total</p>
          </div>
        </div>
      </motion.div>

      {/* Stats strip */}
      {(role === "student" || role === "instructor") && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="grid grid-cols-3 gap-3">
          {role === "student" && [
            { label: "Total Students", value: studentStats?.total    ?? rawUsers.length, color: "text-blue-600 dark:text-blue-400"       },
            { label: "Active",         value: studentStats?.active   ?? "—",             color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Inactive",       value: studentStats?.inactive ?? "—",             color: "text-gray-500 dark:text-gray-400"       },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </Card>
          ))}
          {role === "instructor" && [
            { label: "Total Instructors",     value: instructorStats?.total               ?? rawUsers.length, color: "text-violet-600 dark:text-violet-400"   },
            { label: "Active",                value: instructorStats?.active              ?? "—",             color: "text-emerald-600 dark:text-emerald-400" },
            { label: "With Published Course", value: instructorStats?.withPublishedCourse ?? "—",             color: "text-blue-600 dark:text-blue-400"       },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Create Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Plus className={`w-4 h-4 ${cfg.color}`} />
            <h2 className="font-black text-base text-gray-900 dark:text-white">Create New {cfg.label}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">First Name</label>
              <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="e.g. Sarah"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${formErrors.firstName ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`} />
              {formErrors.firstName && <p className="text-xs text-rose-500 mt-1">{formErrors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Last Name</label>
              <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="e.g. Mitchell"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${formErrors.lastName ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`} />
              {formErrors.lastName && <p className="text-xs text-rose-500 mt-1">{formErrors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="sarah@ggecl.io"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${formErrors.email ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`} />
              {formErrors.email && <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${formErrors.gender ? "border-rose-400" : "border-gray-200 dark:border-white/[0.08]"}`}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {formErrors.gender && <p className="text-xs text-rose-500 mt-1">{formErrors.gender}</p>}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleCreate} disabled={createMutation.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br ${cfg.accent} hover:opacity-90 transition-all shadow-md disabled:opacity-70`}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create {cfg.label}
            </button>

            <AnimatePresence>
              {formSuccess && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Created! Password will be emailed.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${cfg.plural.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.07] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
              {(["newest", "oldest"] as const).map(o => (
                <button key={o} onClick={() => setSortOrder(o)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortOrder === o ? "bg-white dark:bg-[#0f1623] shadow-sm text-gray-900 dark:text-white" : "text-gray-500"}`}>
                  {o === "newest" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              {(["All", "Active", "Inactive", "Suspended"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? s === "All"       ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : s === "Active"    ? "bg-emerald-600 text-white"
                      : s === "Inactive"  ? "bg-gray-500 text-white"
                      : "bg-amber-500 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table body — NO overflow-x-auto here so the fixed dropdown can escape */}
          <div className="w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {["Name", "Email", "Gender", extraHeader, "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                <AnimatePresence initial={false}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-rose-400 text-sm">
                        Failed to load {cfg.plural.toLowerCase()}. Please refresh.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                        No {cfg.plural.toLowerCase()} found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, idx) => (
                      <motion.tr key={user.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors group">

                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img 
                                src={user.image} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex-shrink-0`}>
                                {initials(user)}
                              </div>
                            )}
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

                        {/* Role-specific */}
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
                        <td className="px-5 py-3.5 relative">
                          {/* Hide action buttons for superadmin users in admin management */}
                          {!(role === "admin" && currentUser?.isSuperAdmin) ? (
                            <div className="flex items-center gap-2">
                              {/* Quick view */}
                              <button title="View Profile"
                                onClick={() => navigate(`/admin/${role}s/${user.id}`)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100">
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Quick delete */}
                              <button title="Delete"
                                onClick={() => setConfirmDelete(user.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* More actions */}
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    setMenuAnchor(
                                      menuAnchor === user.id ? null : user.id,
                                    );
                                  }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {menuAnchor === user.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setMenuAnchor(null)}
                                    />
                                    <ActionsMenu
                                      key={user.id}
                                      user={user}
                                      cfg={cfg}
                                      onAction={handleAction}
                                      onClose={() => setMenuAnchor(null)}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-300 dark:text-gray-600 text-xs">
                              —
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-300">{rawUsers.length}</span> {cfg.plural.toLowerCase()}
            </p>
            {(statusFilter !== "All" || search) && (
              <button onClick={() => { setSearch(""); setStatusFilter("All"); }} className="text-xs text-blue-500 font-semibold hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ── Actions dropdowns ── */}
      {/* Removed - now handled inline */}

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-[#0f1623] rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-black text-center text-gray-900 dark:text-white">Delete {cfg.label}?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-5">
                This action cannot be undone. The account and all associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                  Cancel
                </button>
                <button onClick={() => deleteMutation.mutate(confirmDelete)} disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
          <Toast key={toast.msg} message={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}