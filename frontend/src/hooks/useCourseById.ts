import { trpc } from "@/utils/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useCoursesById(id: string) {
  const { data: singleCourse, isLoading } = useSuspenseQuery(
    trpc.course.getById.queryOptions({ courseId: id }),
  );

  return { singleCourse, loadingSingleCourse: isLoading };
}
