"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentJobSeekerProfile } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseCurrentJobSeekerProfileParams {
  enabled?: boolean;
}

export function useCurrentJobSeekerProfile(params?: UseCurrentJobSeekerProfileParams) {
  const { enabled = true } = params || {};

  return useQuery({
    queryKey: QUERY_KEYS.jobSeekerProfiles.current(),
    queryFn: async () => {
      const result = await getCurrentJobSeekerProfile();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth or not found errors
      if (error.message.includes("đăng nhập") || error.message.includes("chưa tạo")) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
} 