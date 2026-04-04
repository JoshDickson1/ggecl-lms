// src/data/Admin.ts
// Shared Admin type + seed data used by PreviewAdmin, search pages, and management tables.

export type AdminStatus = "Active" | "Inactive" | "Suspended";
export type AdminPermissionLevel = "Super Admin" | "Admin" | "Moderator" | "Read Only";

export type AdminActivity = {
  action: string;
  target: string;
  time: string;
  type: "approve" | "ticket" | "publish" | "payout" | "settings" | "enroll" | "delete" | "create";
};

export type AdminPermissionGroup = {
  group: string;
  permissions: { label: string; granted: boolean }[];
};

export type Admin = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string;       // initials
  avatarBg: string;     // tailwind bg class
  title: string;
  department: string;
  bio: string;
  email: string;
  location: string;
  joined: string;
  website?: string;
  gender: "Male" | "Female" | "Other";
  status: AdminStatus;
  permissionLevel: AdminPermissionLevel;
  isSuperAdmin: boolean;
  badges: string[];
  // stats
  usersManaged: number;
  ticketsResolved: number;
  revenueOverseen: string;
  coursesPublished: number;
  // detail data
  recentActivity: AdminActivity[];
  permissionGroups: AdminPermissionGroup[];
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const FULL_PERMISSIONS: AdminPermissionGroup[] = [
  {
    group: "User Management",
    permissions: [
      { label: "View all users",      granted: true  },
      { label: "Create / edit users", granted: true  },
      { label: "Delete users",        granted: true  },
      { label: "Assign roles",        granted: true  },
    ],
  },
  {
    group: "Content Management",
    permissions: [
      { label: "View all courses",         granted: true },
      { label: "Approve / reject courses", granted: true },
      { label: "Delete courses",           granted: true },
      { label: "Feature courses",          granted: true },
    ],
  },
  {
    group: "Finance",
    permissions: [
      { label: "View transactions",    granted: true },
      { label: "Process payouts",      granted: true },
      { label: "Issue refunds",        granted: true },
      { label: "Export financial data",granted: true },
    ],
  },
  {
    group: "Platform Settings",
    permissions: [
      { label: "Edit general settings", granted: true },
      { label: "Manage features",       granted: true },
      { label: "Access audit logs",     granted: true },
      { label: "Super admin controls",  granted: true },
    ],
  },
];

const LIMITED_PERMISSIONS: AdminPermissionGroup[] = [
  {
    group: "User Management",
    permissions: [
      { label: "View all users",      granted: true  },
      { label: "Create / edit users", granted: true  },
      { label: "Delete users",        granted: false },
      { label: "Assign roles",        granted: false },
    ],
  },
  {
    group: "Content Management",
    permissions: [
      { label: "View all courses",         granted: true  },
      { label: "Approve / reject courses", granted: true  },
      { label: "Delete courses",           granted: false },
      { label: "Feature courses",          granted: false },
    ],
  },
  {
    group: "Finance",
    permissions: [
      { label: "View transactions",    granted: true  },
      { label: "Process payouts",      granted: false },
      { label: "Issue refunds",        granted: false },
      { label: "Export financial data",granted: false },
    ],
  },
  {
    group: "Platform Settings",
    permissions: [
      { label: "Edit general settings", granted: false },
      { label: "Manage features",       granted: false },
      { label: "Access audit logs",     granted: false },
      { label: "Super admin controls",  granted: false },
    ],
  },
];

export const admins: Admin[] = [
  {
    id: "adm-001",
    name: "Emeka Osei",
    firstName: "Emeka",
    lastName: "Osei",
    avatar: "EO",
    avatarBg: "bg-gradient-to-br from-rose-600 to-pink-600",
    title: "Platform Administrator · GGECL",
    department: "Operations & Platform",
    bio: "Experienced platform administrator overseeing day-to-day operations, instructor onboarding, and student support escalations. Passionate about building great learning environments.",
    email: "emeka.osei@ggecl.io",
    location: "Abuja, Nigeria",
    joined: "January 2022",
    website: "ggecl.io",
    gender: "Male",
    status: "Active",
    permissionLevel: "Super Admin",
    isSuperAdmin: true,
    badges: ["Super Admin", "Operations Lead"],
    usersManaged: 4820,
    ticketsResolved: 312,
    revenueOverseen: "₦18.4M",
    coursesPublished: 47,
    recentActivity: [
      { action: "Approved instructor application", target: "James Okafor",            time: "10m ago",  type: "approve"  },
      { action: "Resolved support ticket #91",     target: "Student: Emeka O.",       time: "1h ago",   type: "ticket"   },
      { action: "Published new course",            target: "React Bootcamp 2024",     time: "3h ago",   type: "publish"  },
      { action: "Processed instructor payout",     target: "Sarah Mitchell · $312",   time: "5h ago",   type: "payout"   },
      { action: "Updated platform settings",       target: "Notifications config",    time: "1d ago",   type: "settings" },
      { action: "Enrolled student batch",          target: "32 students → cohort 4",  time: "2d ago",   type: "enroll"   },
    ],
    permissionGroups: FULL_PERMISSIONS,
  },
  {
    id: "adm-002",
    name: "Chinelo Adeyemi",
    firstName: "Chinelo",
    lastName: "Adeyemi",
    avatar: "CA",
    avatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600",
    title: "Content & Compliance Administrator",
    department: "Content & Quality",
    bio: "Content-focused administrator responsible for course quality reviews, instructor onboarding compliance, and platform content standards.",
    email: "chinelo@ggecl.io",
    location: "Lagos, Nigeria",
    joined: "March 2022",
    website: "ggecl.io",
    gender: "Female",
    status: "Active",
    permissionLevel: "Admin",
    isSuperAdmin: false,
    badges: ["Admin", "Content Lead"],
    usersManaged: 1240,
    ticketsResolved: 187,
    revenueOverseen: "₦6.2M",
    coursesPublished: 28,
    recentActivity: [
      { action: "Reviewed course content",   target: "Node.js Masterclass v2", time: "30m ago", type: "approve"  },
      { action: "Created classroom",         target: "Marketing Cohort 3",     time: "2h ago",  type: "create"   },
      { action: "Resolved ticket #104",      target: "Instructor: Amara N.",   time: "4h ago",  type: "ticket"   },
      { action: "Published announcement",    target: "Platform-wide",          time: "1d ago",  type: "publish"  },
    ],
    permissionGroups: LIMITED_PERMISSIONS,
  },
  {
    id: "adm-003",
    name: "Tunde Fashola",
    firstName: "Tunde",
    lastName: "Fashola",
    avatar: "TF",
    avatarBg: "bg-gradient-to-br from-violet-600 to-purple-600",
    title: "Finance & Transactions Administrator",
    department: "Finance",
    bio: "Finance administrator overseeing instructor payouts, student refund requests, and transaction integrity across the platform.",
    email: "tunde@ggecl.io",
    location: "Port Harcourt, Nigeria",
    joined: "July 2022",
    gender: "Male",
    status: "Active",
    permissionLevel: "Moderator",
    isSuperAdmin: false,
    badges: ["Admin", "Finance Lead"],
    usersManaged: 680,
    ticketsResolved: 94,
    revenueOverseen: "₦22.1M",
    coursesPublished: 0,
    recentActivity: [
      { action: "Processed 14 payouts",    target: "Instructor batch — March",  time: "1h ago",  type: "payout"   },
      { action: "Issued refund",           target: "Student: Nkechi O. · $15",  time: "3h ago",  type: "payout"   },
      { action: "Flagged transaction",     target: "Duplicate charge #892",      time: "6h ago",  type: "settings" },
    ],
    permissionGroups: LIMITED_PERMISSIONS,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAdminById(id: string): Admin | undefined {
  return admins.find(a => a.id === id);
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
  Inactive:  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
  Suspended: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
};

export const PERMISSION_STYLES: Record<AdminPermissionLevel, string> = {
  "Super Admin": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
  "Admin":       "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
  "Moderator":   "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30",
  "Read Only":   "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/20",
};