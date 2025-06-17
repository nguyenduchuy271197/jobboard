import { useQuery } from "@tanstack/react-query";
import { getEmployerStats } from "@/actions/dashboard/get-employer-stats";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseEmployerStatsParams {
  company_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
}

export function useEmployerStats(params: UseEmployerStatsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.employerStats(params),
    queryFn: () => getEmployerStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
} 