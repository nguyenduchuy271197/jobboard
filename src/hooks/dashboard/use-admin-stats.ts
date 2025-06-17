import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/actions/dashboard/get-admin-stats";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseAdminStatsParams {
  date_range?: {
    start: string;
    end: string;
  };
}

export function useAdminStats(params: UseAdminStatsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.adminStats(params),
    queryFn: () => getAdminStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
} 