import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import AdminNav from "@/components/dashboard/admin/components/AdminNav";
import { AdminSidebar } from "@/components/dashboard/admin/components/AdminSidebar";
import { isAdmin } from "@/utils/isAdmin";
import { RequireAuth } from "@/components/utils/RequireAuth";
import { AdminContext } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import NavSkeleton from "../../students/utils/NavSkeleton";
import AdminDashboardSkeleton from "./AdminDashboardSkeleton";

function AdminLayout() {
  const { userId, isLoading: isAuthLoading } = useAuth();

  const {
    data: user,
    isPending: isAdminDataPending,
    isError,
    error,
  } = useQuery({
    ...trpc.admin.getById.queryOptions({ id: userId || "" }),
    enabled: !!userId && !isAuthLoading,
    retry: 3,
  });

  if (isError) {
    console.error("Failed to fetch admin data:", error);
    toast.error(error.message);
    return (
      <RequireAuth>
        <div>Error loading admin information. Please try again later.</div>
      </RequireAuth>
    );
  }

  if (!isAdminDataPending && user && !isAdmin(user)) {
    toast.error("You do not have permission to access the admin dashboard.");
    return (
      <RequireAuth>
        <div>You do not have permission to access the admin dashboard.</div>
      </RequireAuth>
    );
  }

  if (isAdminDataPending) {
    return (
      <RequireAuth>
        <SidebarProvider>
          <AdminSidebar />
          <main className="w-full overflow-x-hidden">
            <NavSkeleton />
            <AdminDashboardSkeleton />
          </main>
        </SidebarProvider>
      </RequireAuth>
    );
  }

  const admin = user;

  return (
    <RequireAuth>
      <AdminContext.Provider value={{ admin }}>
        <SidebarProvider>
          <AdminSidebar />
          <main className="h-screen w-full overflow-x-hidden overflow-y-scroll">
            <AdminNav />
            <Outlet />
          </main>
        </SidebarProvider>
      </AdminContext.Provider>
    </RequireAuth>
  );
}

export default AdminLayout;
