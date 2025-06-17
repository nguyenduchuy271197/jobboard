"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserCompanies } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseUserCompaniesParams {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useUserCompanies(params?: UseUserCompaniesParams) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: QUERY_KEYS.companies.userCompanies(),
    queryFn: async () => {
      const result = await getUserCompanies(queryParams);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("đăng nhập")) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
} 