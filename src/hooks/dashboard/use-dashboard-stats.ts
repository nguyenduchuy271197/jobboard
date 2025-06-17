import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/actions/dashboard/get-stats";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseDashboardStatsParams {
  date_range?: {
    start: string;
    end: string;
  };
}

export function useDashboardStats(params: UseDashboardStatsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.generalStats(params),
    queryFn: () => getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
} 