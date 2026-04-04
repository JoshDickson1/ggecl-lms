// src/dashboards/instructor-dashboard/InstructorLayout.tsx
import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { InstructorSidebar, InstructorSidebarProvider } from "./InstructorSidebar";
import { InstructorNavbar } from "./InstructorNavbar";

function Guard({ children }: { children: ReactNode }) {
  const { user, role } = useDashboardUser();
  if (!user || !role) return <Navigate to="/instructor/login" replace />;
  if (role !== "instructor") {
    if (role === "admin") return <Navigate to="/dashboard" replace />;
    if (role === "student") return <Navigate to="/student" replace />;
  }
  return <>{children}</>;
}

export function InstructorLayout({ children }: { children?: ReactNode }) {
  return (
    <Guard>
      <InstructorSidebarProvider>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080d18]">
          <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.018]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(99,102,241,1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
          <InstructorSidebar />
          <div className="relative z-10 lg:ml-[236px]">
            <InstructorNavbar />
            <motion.main
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="px-4 lg:px-6 py-6 mt-14 lg:mt-0 pb-16">
              {children ?? <Outlet />}
            </motion.main>
          </div>
        </div>
      </InstructorSidebarProvider>
    </Guard>
  );
}