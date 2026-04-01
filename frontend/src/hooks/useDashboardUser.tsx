// src/hooks/useDashboardUser.tsx
// Pure React context — zero external deps.
// File must be .tsx (not .ts) because it contains JSX in the Provider.

import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "admin" | "student" | "instructor";

export type DashboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
};

type DashboardAuthCtx = {
  user: DashboardUser | null;
  role: Role | null;
  isAdmin: boolean;
  isStudent: boolean;
  isInstructor: boolean;
  login: (user: DashboardUser) => void;
  logout: () => void;
  switchRole: (role: Role) => void; // dev helper — remove in prod
};

const Ctx = createContext<DashboardAuthCtx | null>(null);

// ─── Dummy users — swap with your real auth later ─────────────────────────────
export const MOCK_USERS: Record<Role, DashboardUser> = {
  admin: {
    id: "adm-001",
    firstName: "Emeka",
    lastName: "Osei",
    email: "emeka@learnflow.io",
    role: "admin",
    isSuperAdmin: true,
  },
  instructor: {
    id: "inst-1",
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah@learnflow.io",
    role: "instructor",
  },
  student: {
    id: "stu-001",
    firstName: "Zara",
    lastName: "Adeyemi",
    email: "zara@example.com",
    role: "student",
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DashboardAuthProvider({
  children,
  defaultRole = "student",
}: {
  children: ReactNode;
  defaultRole?: Role;
}) {
  const [user, setUser] = useState<DashboardUser | null>(MOCK_USERS[defaultRole]);

  const login      = (u: DashboardUser) => setUser(u);
  const logout     = ()                 => setUser(null);
  const switchRole = (r: Role)          => setUser(MOCK_USERS[r]); // dev only

  return (
    <Ctx.Provider
      value={{
        user,
        role:         user?.role ?? null,
        isAdmin:      user?.role === "admin",
        isStudent:    user?.role === "student",
        isInstructor: user?.role === "instructor",
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDashboardUser(): DashboardAuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardUser must be inside <DashboardAuthProvider>");
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getInitials(user: DashboardUser | null): string {
  if (!user) return "??";
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export const ROLE_LABELS: Record<Role, string> = {
  admin:      "Admin",
  instructor: "Instructor",
  student:    "Student",
};