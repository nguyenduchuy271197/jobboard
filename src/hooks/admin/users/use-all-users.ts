import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/actions/admin/users/get-all-users";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AdminUsersFilter } from "@/types/custom.types";

export function useAllUsers(filters?: AdminUsersFilter) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.list(filters),
    queryFn: () => getAllUsers(filters || {}),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi auth hoặc permission
      if ('status' in error && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 