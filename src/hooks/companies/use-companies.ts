"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseCompaniesParams {
  search?: string;
  industry_id?: number;
  location_id?: number;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useCompanies(params?: UseCompaniesParams) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: QUERY_KEYS.companies.list(queryParams),
    queryFn: async () => {
      const result = await getCompanies(queryParams);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message.includes("không hợp lệ")) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
} 