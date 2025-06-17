import { useQuery } from "@tanstack/react-query";
import { getJobPerformance } from "@/actions/reports/get-job-performance";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseJobPerformanceParams {
  date_range?: {
    start: string;
    end: string;
  };
  company_id?: number;
  industry_filter?: number;
  location_filter?: number;
}

export function useJobPerformance(params: UseJobPerformanceParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.jobPerformance(params),
    queryFn: () => getJobPerformance(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
} 