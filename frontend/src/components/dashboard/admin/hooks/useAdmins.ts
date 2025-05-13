import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export function useAdmins({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data, isLoading } = useQuery(
    trpc.admin.getAll.queryOptions({ page, limit, search }),
  );

  return {
    admins: data?.admins ?? [],
    meta: data?.meta,
    loading: isLoading,
  };
}
