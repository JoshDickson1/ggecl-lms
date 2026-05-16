import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
  readSessionCache,
  writeSessionCache,
  clearSessionCache,
} from "@/lib/session-cache";

const { useSession } = authClient;

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isPending: boolean;
  isAuthenticated: boolean;
  /** Role helpers */
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  canEdit: (targetUserId: string) => boolean;
  canDelete: (targetUserId: string) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  // Live user from better-auth network response
  const liveUser = (session?.user as SessionUser | undefined) ?? null;

  // Cached user from localStorage — available synchronously on first render,
  // so isPending never causes a blank/loading state for returning users.
  const cachedRaw = readSessionCache();
  const cachedUser: SessionUser | null = cachedRaw
    ? {
        id:    cachedRaw.id,
        email: cachedRaw.email,
        name:  cachedRaw.name,
        role:  cachedRaw.role as UserRole,
      }
    : null;

  // Use live user once resolved; fall back to cache while pending.
  // If the network says no session (liveUser is null and not pending),
  // we treat the user as logged out regardless of cache.
  const user: SessionUser | null = isPending ? cachedUser : liveUser;

  // Keep the cache in sync with the live session
  useEffect(() => {
    if (!isPending) {
      if (liveUser) {
        writeSessionCache({
          id:    liveUser.id,
          name:  liveUser.name,
          email: liveUser.email,
          role:  liveUser.role,
        });
      } else {
        // Session expired or user logged out — clear stale cache
        clearSessionCache();
      }
    }
  }, [isPending, liveUser]);

  // Only show as "loading" if we have no cached user to fall back on.
  // If we have a cached user, render immediately and re-validate silently.
  const isLoading = isPending && !cachedUser;

  const isAdmin      = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR";
  const isStudent    = user?.role === "STUDENT";

  const canEdit   = (targetUserId: string) => isAdmin || user?.id === targetUserId;
  const canDelete = (targetUserId: string) => isAdmin || user?.id === targetUserId;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isPending,
        isAuthenticated: !!user,
        isAdmin,
        isInstructor,
        isStudent,
        canEdit,
        canDelete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
