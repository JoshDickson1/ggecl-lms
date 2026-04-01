// src/dashboards/student-dashboard/StudentLayout.tsx
import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StudentSidebar, StudentSidebarProvider } from "./StudentSidebar";
import { StudentNavbar } from "./StudentNavbar";

function Guard({ children }: { children: ReactNode }) {
  const { user, role } = useDashboardUser();
  if (!user || !role) return <Navigate to="/login" replace />;
  if (role !== "student") {
    if (role === "admin") return <Navigate to="/dashboard" replace />;
    if (role === "instructor") return <Navigate to="/instructor" replace />;
  }
  return <>{children}</>;
}

export function StudentLayout({ children }: { children?: ReactNode }) {
  return (
    <Guard>
      <StudentSidebarProvider>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080d18]">
          {/* Subtle dot grid */}
          <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.018]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(6,182,212,1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
          <StudentSidebar />
          <div className="relative z-10 lg:ml-[236px]">
            <StudentNavbar />
            <motion.main
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="px-4 lg:px-6 py-6 mt-14 lg:mt-0 pb-16">
              {children ?? <Outlet />}
            </motion.main>
          </div>
        </div>
      </StudentSidebarProvider>
    </Guard>
  );
}