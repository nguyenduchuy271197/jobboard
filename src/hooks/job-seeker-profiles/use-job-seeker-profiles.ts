"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobSeekerProfiles } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseJobSeekerProfilesParams {
  search?: string;
  preferred_location_id?: number;
  experience_level?: "entry_level" | "mid_level" | "senior_level" | "executive";
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  is_looking_for_job?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useJobSeekerProfiles(params?: UseJobSeekerProfilesParams) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: QUERY_KEYS.jobSeekerProfiles.list(queryParams),
    queryFn: async () => {
      const result = await getJobSeekerProfiles(queryParams);
      
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