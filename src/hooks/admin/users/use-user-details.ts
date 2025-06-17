import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "@/actions/admin/users/get-user-details";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users.detail(userId),
    queryFn: () => getUserDetails({ user_id: userId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi auth hoặc permission
      if ('status' in error && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 