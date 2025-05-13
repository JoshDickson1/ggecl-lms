import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function useInstructors({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data, isLoading } = useQuery(
    trpc.instructor.getAll.queryOptions({ page, limit, search }),
  );

  return {
    instructors: data?.instructors || [],
    meta: data?.meta,
    loading: isLoading,
  };
}
