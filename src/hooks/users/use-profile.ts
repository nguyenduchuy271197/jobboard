"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/actions/users/get-profile";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.users.currentProfile(),
    queryFn: async () => {
      const result = await getUserProfile();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      if (error?.message === "Unauthorized") return false;
      return failureCount < 3;
    },
  });
} 