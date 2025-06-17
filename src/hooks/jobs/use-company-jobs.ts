"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyJobs } from "@/actions/jobs";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseCompanyJobsParams {
  company_id: number;
  status?: "draft" | "pending_approval" | "published" | "closed" | "archived";
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useCompanyJobs(params: UseCompanyJobsParams) {
  const { enabled = true, company_id, ...queryParams } = params;

  return useQuery({
    queryKey: QUERY_KEYS.jobs.companyJobs(company_id),
    queryFn: async () => {
      const result = await getCompanyJobs({ company_id, ...queryParams });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled: enabled && !!company_id,
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