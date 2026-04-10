import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthProvider";

interface ProtectedRouteProps {
  /**
   * Restrict to specific roles. Omit to allow any authenticated user.
   * e.g. allowedRoles={["ADMIN"]} for admin-only pages.
   */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users. Defaults to /login */
  redirectTo?: string;
}

/**
 * Wrap your route with this component to require an active session.
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
 *     <Route path="/admin/users" element={<UserManagement />} />
 *   </Route>
 */
export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  console.log('what user auth looks like', user)
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "14px",
          color: "var(--color-text-secondary, #888)",
        }}
      >
        Verifying session…
      </div>
    );
  }

  if (!user) {
    // Preserve the attempted URL for post-login redirect
    return (
      <Navigate to={redirectTo} state={{ from: location }} replace />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}