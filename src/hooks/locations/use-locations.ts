import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/actions/locations/get-locations";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseLocationsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export function useLocations(params?: UseLocationsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.locations.list(params),
    queryFn: async () => {
      const result = await getLocations(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - locations don't change often
    retry: (failureCount, error: { status?: number }) =>
      error?.status && error.status >= 400 && error.status < 500 ? false : failureCount < 3,
  });
} 