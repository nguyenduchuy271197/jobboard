import { useQuery } from "@tanstack/react-query";
import { getIndustries } from "@/actions/industries/get-industries";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseIndustriesParams {
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export function useIndustries(params?: UseIndustriesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.industries.list(params),
    queryFn: async () => {
      const result = await getIndustries(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - industries don't change often
    retry: (failureCount, error: { status?: number }) =>
      error?.status && error.status >= 400 && error.status < 500 ? false : failureCount < 3,
  });
} 