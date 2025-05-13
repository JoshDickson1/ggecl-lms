import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function useCourses({
  page = 1,
  limit = 10,
  search = "",
  instructor,
}: {
  page?: number;
  limit?: number;
  search?: string;
  instructor?: string;
}) {
  const { data, isLoading } = useQuery(
    trpc.course.getAll.queryOptions({ page, limit, search, instructor }),
  );

  return { courses: data?.courses || [], meta: data?.meta, loading: isLoading };
}
