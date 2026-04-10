// ═══════════════════════════════════════════════════════════════
// FILE 1: src/dashboards/admin-dashboard/AdminLayout.tsx
// ═══════════════════════════════════════════════════════════════
import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { AdminSidebar, AdminSidebarProvider } from "./AdminSidebar";
 
function Guard({ children }: { children: ReactNode }) {
  // const { user, role } = useDashboardUser();
  // if (!user || !role) return <Navigate to="/admin/login" replace />;
  // if (role !== "admin") {
  //   if (role === "instructor") return <Navigate to="/instructor" replace />;
  //   if (role === "student") return <Navigate to="/student" replace />;
  // }
  return <>{children}</>;
}
 
export function AdminLayout({ children }: { children?: ReactNode }) {
  return (
    <Guard>
      <AdminSidebarProvider>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080d18]">
          <div className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right,rgba(59,130,246,0.025) 1px,transparent 1px)," +
                "linear-gradient(to bottom,rgba(59,130,246,0.025) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }} />
          <AdminSidebar />
          <div className="relative z-10 lg:ml-[236px]">
            <AdminNavbar />
            <motion.main
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="px-4 lg:px-6 py-6 mt-14 lg:mt-0 pb-16">
              {children ?? <Outlet />}
            </motion.main>
          </div>
        </div>
      </AdminSidebarProvider>
    </Guard>
  );
}