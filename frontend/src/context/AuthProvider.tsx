import {
    createContext,
    useContext,
    type ReactNode,
  } from "react";
  import { authClient } from "@/lib/auth-client";

  const {useSession} = authClient
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
    isAuthenticated: boolean;
    /** Role helpers */
    isAdmin: boolean;
    isInstructor: boolean;
    isStudent: boolean;
    /**
     * Can this user edit the target?
     * Admins can edit anyone. Others can only edit themselves.
     */
    canEdit: (targetUserId: string) => boolean;
    /**
     * Can this user delete the target?
     * Admins and owners only.
     */
    canDelete: (targetUserId: string) => boolean;
  }
  
  // ─── Context ──────────────────────────────────────────────────────────────────
  
  const AuthContext = createContext<AuthContextValue | null>(null);
  
  // ─── Provider ─────────────────────────────────────────────────────────────────
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, isPending } = useSession();
  
    const user = (session?.user as SessionUser | undefined) ?? null;
  
    const isAdmin = user?.role === "ADMIN";
    const isInstructor = user?.role === "INSTRUCTOR";
    const isStudent = user?.role === "STUDENT";
  
    const canEdit = (targetUserId: string) =>
      isAdmin || user?.id === targetUserId;
  
    const canDelete = (targetUserId: string) =>
      isAdmin || user?.id === targetUserId;
  
    return (
      <AuthContext.Provider
        value={{
          user,
          isLoading: isPending,
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
    if (!ctx) {
      throw new Error("useAuth must be used within <AuthProvider>");
    }
    return ctx;
  }