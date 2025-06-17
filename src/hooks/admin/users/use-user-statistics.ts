import { useQuery } from "@tanstack/react-query";
import { getUserStatistics } from "@/actions/admin/users/get-user-statistics";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUserStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.statistics(),
    queryFn: getUserStatistics,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi auth hoặc permission
      if ('status' in error && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 