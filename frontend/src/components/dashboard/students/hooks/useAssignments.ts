import { AssignmentFilterStatusType } from "@/types/assignment";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function useAssignments({
  page = 1,
  limit = 10,
  search = "",
  status,
  dueDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssignmentFilterStatusType | undefined;
  dueDate?: Date | undefined;
}) {
  const { data, isLoading } = useQuery(
    trpc.assignment.getAllForStudent.queryOptions({
      page,
      limit,
      search,
      status,
      dueDate,
    }),
  );
  return {
    assignments: data?.assignments ?? [],
    meta: data?.meta,
    loading: isLoading,
  };
}
