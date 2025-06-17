import { useQuery } from "@tanstack/react-query";
import { getSearchSuggestions, SearchSuggestionsParams } from "@/actions/search/get-suggestions";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSearchSuggestions(params: SearchSuggestionsParams, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.search.suggestions(params),
    queryFn: () => getSearchSuggestions(params),
    enabled: enabled && !!params.query && params.query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
} 