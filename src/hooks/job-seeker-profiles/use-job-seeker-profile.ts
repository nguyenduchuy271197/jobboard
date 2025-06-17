"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobSeekerProfile } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseJobSeekerProfileParams {
  user_id: string;
  enabled?: boolean;
}

export function useJobSeekerProfile({ user_id, enabled = true }: UseJobSeekerProfileParams) {
  return useQuery({
    queryKey: QUERY_KEYS.jobSeekerProfiles.detail(user_id),
    queryFn: async () => {
      const result = await getJobSeekerProfile({ user_id });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled: enabled && !!user_id,
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