"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/actions/jobs";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseJobsParams {
  search?: string;
  company_id?: number;
  industry_id?: number;
  location_id?: number;
  employment_type?: "full_time" | "part_time" | "contract" | "freelance" | "internship";
  experience_level?: "entry_level" | "mid_level" | "senior_level" | "executive";
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  is_featured?: boolean;
  status?: "draft" | "pending_approval" | "published" | "closed" | "archived";
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useJobs(params?: UseJobsParams) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: QUERY_KEYS.jobs.list(queryParams),
    queryFn: async () => {
      const result = await getJobs(queryParams);
      
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