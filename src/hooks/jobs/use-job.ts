"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobDetails } from "@/actions/jobs";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseJobParams {
  id: number;
  enabled?: boolean;
}

export function useJob({ id, enabled = true }: UseJobParams) {
  return useQuery({
    queryKey: QUERY_KEYS.jobs.detail(id),
    queryFn: async () => {
      const result = await getJobDetails({ id });
      
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