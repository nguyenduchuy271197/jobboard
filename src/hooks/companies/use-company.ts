"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyDetails } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseCompanyParams {
  id: number;
  enabled?: boolean;
}

export function useCompany({ id, enabled = true }: UseCompanyParams) {
  return useQuery({
    queryKey: QUERY_KEYS.companies.detail(id),
    queryFn: async () => {
      const result = await getCompanyDetails({ id });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on not found errors
      if (error.message.includes("không tồn tại")) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
} 