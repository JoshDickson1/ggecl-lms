// src/hooks/useDashboardUser.tsx
import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

const { useSession } = authClient;

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
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isInstructor: boolean;
  logout: () => void;
};

const Ctx = createContext<DashboardAuthCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  // better-auth session.user shape:
  // { id, name, email, image, role, ... }
  const raw = session?.user as
    | { id: string; name: string; email: string; image?: string | null; role?: string }
    | undefined;

  // Split "First Last" → firstName / lastName
  const nameParts  = (raw?.name ?? "").trim().split(" ");
  const firstName  = nameParts[0] ?? "";
  const lastName   = nameParts.slice(1).join(" ") || "";

  const rawRole    = (raw?.role ?? "student").toLowerCase() as Role;

  const user: DashboardUser | null = raw
    ? {
        id:        raw.id,
        firstName,
        lastName,
        email:     raw.email,
        role:      rawRole,
        avatarUrl: raw.image ?? undefined,
      }
    : null;

  const logout = () => authClient.signOut();

  return (
    <Ctx.Provider
      value={{
        user,
        role:         user?.role ?? null,
        isLoading:    isPending,
        isAdmin:      user?.role === "admin",
        isStudent:    user?.role === "student",
        isInstructor: user?.role === "instructor",
        logout,
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
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0]  ?? "";
  return `${f}${l}`.toUpperCase() || "??";
}

export const ROLE_LABELS: Record<Role, string> = {
  admin:      "Admin",
  instructor: "Instructor",
  student:    "Student",
};