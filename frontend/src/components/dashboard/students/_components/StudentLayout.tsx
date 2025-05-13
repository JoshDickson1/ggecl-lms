import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import { AppSidebar } from "./AppSidebar";
import { RequireAuth } from "@/components/utils/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { isStudent } from "@/utils/isStudent";
import { StudentContext } from "@/hooks/useStudent";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import NavSkeleton from "../utils/NavSkeleton";
import StudentHomeSkeleton from "./StudentHomeSkeleton";

function StudentLayout() {
  const { userId, isLoading } = useAuth();

  const {
    data: user,
    isPending: isStudentDataPending,
    isError,
    error,
  } = useQuery({
    ...trpc.student.getById.queryOptions({ id: userId || "" }),
    enabled: !!userId && !isLoading,
    retry: 3,
  });

  if (isError) {
    console.error("Failed to fetch student data:", error);
    toast.error(error.message);
    return (
      <RequireAuth>
        <div>Error loading student information. Please try again later.</div>
      </RequireAuth>
    );
  }

  if (!isStudentDataPending && user && !isStudent(user)) {
    toast.error("You do not have permission to access the student dashboard.");
    return (
      <RequireAuth>
        <div>You do not have permission to access the student dashboard.</div>
      </RequireAuth>
    );
  }

  if (isStudentDataPending) {
    return (
      <RequireAuth>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full overflow-x-hidden">
            <NavSkeleton />
            <StudentHomeSkeleton />
          </main>
        </SidebarProvider>
      </RequireAuth>
    );
  }

  const student = user;

  return (
    <RequireAuth>
      <StudentContext.Provider value={{ student }}>
        <SidebarProvider>
          <AppSidebar />
          <main className="h-screen w-full overflow-x-hidden overflow-y-scroll">
            <Navbar />
            <Outlet />
          </main>
        </SidebarProvider>
      </StudentContext.Provider>
    </RequireAuth>
  );
}

export default StudentLayout;
