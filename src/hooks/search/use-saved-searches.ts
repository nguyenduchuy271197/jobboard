import { useQuery } from "@tanstack/react-query";
import { getSavedSearches, GetSavedSearchesParams } from "@/actions/search/get-saved-searches";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSavedSearches(params?: GetSavedSearchesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.search.savedSearches(params),
    queryFn: () => getSavedSearches(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
} 