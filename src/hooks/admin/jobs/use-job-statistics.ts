import { useQuery } from "@tanstack/react-query";
import { getJobStatistics } from "@/actions/admin/jobs/get-job-statistics";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useJobStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.jobs.statistics(),
    queryFn: getJobStatistics,
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