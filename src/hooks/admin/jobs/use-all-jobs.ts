import { useQuery } from "@tanstack/react-query";
import { getAllJobs } from "@/actions/admin/jobs/get-all-jobs";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AdminJobsFilter } from "@/types/custom.types";

export function useAllJobs(filters?: AdminJobsFilter) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.jobs.list(filters),
    queryFn: () => getAllJobs(filters || {}),
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