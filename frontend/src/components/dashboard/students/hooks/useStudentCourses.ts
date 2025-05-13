import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function useStudentCourses({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data, isLoading } = useQuery(
    trpc.course.getAllForStudent.queryOptions({ page, limit, search }),
  );

  return { courses: data?.courses || [], meta: data?.meta, loading: isLoading };
}
