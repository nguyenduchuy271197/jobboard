import { useQuery } from "@tanstack/react-query";
import { globalSearch, GlobalSearchParams } from "@/actions/search/global-search";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useGlobalSearch(params: GlobalSearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.search.global(params),
    queryFn: () => globalSearch(params),
    enabled: enabled && !!params.query,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
} 