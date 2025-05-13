import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { RequireAuth } from "@/components/utils/RequireAuth";
import InstructorNav from "@/components/dashboard/instructor/_components/InstructorNav";
import { InstructorSide } from "@/components/dashboard/instructor/_components/InstructorSide";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { InstructorContext } from "@/hooks/useInstructor";
import { isInstructor } from "@/utils/isInstructor";
import { toast } from "sonner";
import NavSkeleton from "../../students/utils/NavSkeleton";
import InstructorHomeSkeleton from "./InstructorDashboardSkeleton";

function InstructorLayout() {
  const { userId, isLoading } = useAuth();

  const {
    data: user,
    isPending: isInstructorDataPending,
    isError,
    error,
  } = useQuery({
    ...trpc.instructor.getById.queryOptions({ id: userId || "" }),
    enabled: !!userId && !isLoading,
    retry: 3,
  });

  if (isError) {
    console.error("Failed to fetch instructor data:", error);
    toast.error(error.message);
    return (
      <RequireAuth>
        <div>Error loading instructor information. Please try again later.</div>
      </RequireAuth>
    );
  }

  if (!isInstructorDataPending && user && !isInstructor(user)) {
    toast.error(
      "You do not have permission to access the instructor dashboard.",
    );
    return (
      <RequireAuth>
        <div>
          You do not have permission to access the instructor dashboard.
        </div>
      </RequireAuth>
    );
  }

  if (isInstructorDataPending) {
    return (
      <RequireAuth>
        <SidebarProvider>
          <InstructorSide />
          <main className="w-full overflow-x-hidden">
            <NavSkeleton />
            <InstructorHomeSkeleton />
          </main>
        </SidebarProvider>
      </RequireAuth>
    );
  }

  const instructor = user;

  return (
    <RequireAuth>
      <InstructorContext.Provider value={{ instructor }}>
        <SidebarProvider>
          <InstructorSide />
          <main className="h-screen w-full overflow-x-hidden overflow-y-scroll">
            <InstructorNav />
            <Outlet />
          </main>
        </SidebarProvider>
      </InstructorContext.Provider>
    </RequireAuth>
  );
}

export default InstructorLayout;
