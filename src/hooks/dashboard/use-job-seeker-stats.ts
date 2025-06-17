import { useQuery } from "@tanstack/react-query";
import { getJobSeekerStats } from "@/actions/dashboard/get-job-seeker-stats";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseJobSeekerStatsParams {
  user_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export function useJobSeekerStats(params: UseJobSeekerStatsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.jobSeekerStats(params),
    queryFn: () => getJobSeekerStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
} 