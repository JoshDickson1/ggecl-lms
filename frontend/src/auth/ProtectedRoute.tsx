import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthProvider";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isPending } = useAuth();
  const location = useLocation();

  if (isLoading || isPending) {
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
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    // SUPER_ADMIN inherits all ADMIN permissions — if ADMIN is allowed, so is SUPER_ADMIN
    const effectiveAllowed = allowedRoles.includes("ADMIN")
      ? [...allowedRoles, "SUPER_ADMIN" as UserRole]
      : allowedRoles;

    if (!effectiveAllowed.includes(user.role)) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}
