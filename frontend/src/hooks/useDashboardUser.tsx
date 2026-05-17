// src/hooks/useDashboardUser.tsx
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import {
  readSessionCache,
  writeSessionCache,
  clearSessionCache,
} from "@/lib/session-cache";

const { useSession } = authClient;

export type Role = "admin" | "super_admin" | "student" | "instructor";

export type DashboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isSuperAdmin: boolean;
};

type DashboardAuthCtx = {
  user: DashboardUser | null;
  role: Role | null;
  isLoading: boolean;
  isAdmin: boolean;      // true for both admin and super_admin
  isSuperAdmin: boolean; // true only for super_admin
  isStudent: boolean;
  isInstructor: boolean;
  logout: () => void;
};

const Ctx = createContext<DashboardAuthCtx | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rawToDashboardUser(raw: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}): DashboardUser {
  const nameParts = (raw.name ?? "").trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName  = nameParts.slice(1).join(" ") || "";
  const rawRole   = (raw.role ?? "student").toLowerCase();
  // SUPER_ADMIN maps to "super_admin"; treat it as admin-tier
  const role      = rawRole as Role;
  const isSuperAdmin = rawRole === "super_admin";
  return {
    id: raw.id,
    firstName,
    lastName,
    email:     raw.email,
    role,
    avatarUrl: raw.image ?? undefined,
    isSuperAdmin,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const raw = session?.user as
    | { id: string; name: string; email: string; image?: string | null; role?: string }
    | undefined;

  // Live user from network
  const liveUser: DashboardUser | null = raw ? rawToDashboardUser(raw) : null;

  // Cached user from localStorage — available synchronously on first render
  const cachedRaw = readSessionCache();
  const cachedUser: DashboardUser | null = cachedRaw
    ? rawToDashboardUser({
        id:    cachedRaw.id,
        name:  cachedRaw.name,
        email: cachedRaw.email,
        image: null,
        role:  cachedRaw.role,
      })
    : null;

  // Use live user once resolved; fall back to cache while pending
  const user: DashboardUser | null = isPending ? cachedUser : liveUser;

  // Keep cache in sync
  useEffect(() => {
    if (!isPending) {
      if (raw) {
        writeSessionCache({
          id:    raw.id,
          name:  raw.name,
          email: raw.email,
          role:  raw.role ?? "student",
          image: raw.image,
        });
      } else {
        clearSessionCache();
      }
    }
  }, [isPending, raw]);

  // Only block rendering if we have no cached user to fall back on
  const isLoading = isPending && !cachedUser;

  const logout = () => {
    clearSessionCache();
    authClient.signOut();
  };

  const isSuperAdmin = user?.isSuperAdmin ?? false;

  return (
    <Ctx.Provider
      value={{
        user,
        role:         user?.role ?? null,
        isLoading,
        isAdmin:      user?.role === "admin" || isSuperAdmin,
        isSuperAdmin,
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

export function getInitials(user: DashboardUser | null): string {
  if (!user) return "??";
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0]  ?? "";
  return `${f}${l}`.toUpperCase() || "??";
}

export const ROLE_LABELS: Record<Role, string> = {
  admin:       "Admin",
  super_admin: "Super Admin",
  instructor:  "Instructor",
  student:     "Student",
};
