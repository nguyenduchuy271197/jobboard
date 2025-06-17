import { useQuery } from "@tanstack/react-query";
import { advancedJobSearch, AdvancedJobSearchParams } from "@/actions/search/advanced-job-search";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useAdvancedJobSearch(params: AdvancedJobSearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.search.advancedJobs(params),
    queryFn: () => advancedJobSearch(params),
    enabled,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
} 