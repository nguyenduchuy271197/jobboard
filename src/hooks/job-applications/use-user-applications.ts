"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserApplications } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useUser } from "@/hooks/auth/use-user";

export function useUserApplications() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.applications.userApplications(user?.id),
    queryFn: async () => {
      const result = await getUserApplications();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message === "Vui lòng đăng nhập để thực hiện thao tác này") {
        return false;
      }
      return failureCount < 3;
    },
  });
} 