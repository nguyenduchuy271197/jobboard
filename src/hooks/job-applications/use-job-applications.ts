"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobApplications } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { JobApplicationsFilter } from "@/types/custom.types";

export function useJobApplications(filters?: JobApplicationsFilter) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.list(filters),
    queryFn: async () => {
      const result = await getJobApplications(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message === "Vui lòng đăng nhập để thực hiện thao tác này") {
        return false;
      }
      return failureCount < 3;
    },
  });
} 