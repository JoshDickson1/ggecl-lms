import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthProvider";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // On iOS Safari, the session cookie may not be readable immediately after login.
  // Wait up to 2s with retries before giving up and redirecting.
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !waited) {
      const timer = setTimeout(() => setWaited(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, waited]);

  if (isLoading || (!user && !waited)) {
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}