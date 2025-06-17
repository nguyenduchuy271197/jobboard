import { useQuery } from "@tanstack/react-query";
import { getPendingJobs } from "@/actions/admin/jobs/get-pending-jobs";
import { QUERY_KEYS } from "@/lib/query-keys";

export function usePendingJobs(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.jobs.pending(),
    queryFn: () => getPendingJobs(params),
    staleTime: 1000 * 60 * 2, // 2 minutes (shorter for pending items)
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi auth hoặc permission
      if ('status' in error && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 